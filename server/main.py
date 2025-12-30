"""
Open Chat Backend Server

A FastAPI server that proxies requests to OpenRouter and implements
the Open Chat API contract. This serves as a reference implementation
for building your own backend.

Usage:
    export OPENROUTER_API_KEY=sk-or-v1-xxx
    uvicorn main:app --reload
"""

import os
import json
import uuid
import httpx
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

app = FastAPI(
    title="Open Chat Backend",
    description="Reference backend implementation for Open Chat UI",
    version="1.0.0",
)

# CORS - allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
DEFAULT_MODEL = "anthropic/claude-sonnet-4"

# Available models (customize as needed)
MODELS = [
    # Anthropic
    {"id": "anthropic/claude-opus-4", "name": "Claude Opus 4", "description": "Anthropic's most capable model"},
    {"id": "anthropic/claude-sonnet-4", "name": "Claude Sonnet 4", "description": "Anthropic's balanced model"},
    # OpenAI
    {"id": "openai/gpt-4.1", "name": "GPT-4.1", "description": "OpenAI's flagship model"},
    {"id": "openai/gpt-4.1-mini", "name": "GPT-4.1 Mini", "description": "Fast and affordable"},
    # Google
    {"id": "google/gemini-2.5-pro-preview", "name": "Gemini 2.5 Pro", "description": "Google's flagship model"},
    {"id": "google/gemini-2.5-flash-preview", "name": "Gemini 2.5 Flash", "description": "Google's fast model"},
    # Moonshot
    {"id": "moonshotai/kimi-k2", "name": "Kimi K2", "description": "Moonshot's frontier model"},
]

# In-memory conversation storage (replace with database in production)
conversations: dict = {}


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    model: Optional[str] = None


class Message(BaseModel):
    role: str
    content: str


@app.get("/")
async def root():
    return {"status": "ok", "service": "Open Chat Backend"}


@app.get("/models")
async def get_models():
    """Return available models."""
    return MODELS


@app.get("/conversations")
async def get_conversations():
    """Return list of conversations, sorted by most recent first."""
    conv_list = [
        {
            "id": conv_id,
            "title": conv["title"],
            "updated_at": conv["updated_at"],
        }
        for conv_id, conv in conversations.items()
    ]
    # Sort by updated_at descending (most recent first)
    conv_list.sort(key=lambda x: x["updated_at"], reverse=True)
    return conv_list


@app.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Return a specific conversation with messages."""
    if conversation_id not in conversations:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversations[conversation_id]


@app.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Delete a conversation."""
    if conversation_id in conversations:
        del conversations[conversation_id]
    return {"success": True}


@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Handle chat requests with streaming response.

    Implements the Open Chat SSE protocol:
    - message_start: New message started
    - text: Text content chunk
    - tool_start: Tool call started
    - tool_end: Tool call completed
    - error: Error occurred
    - message_end: Message complete with usage
    - [DONE]: Stream complete
    """
    if not OPENROUTER_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OPENROUTER_API_KEY environment variable not set"
        )

    # Get or create conversation
    conv_id = request.conversation_id or str(uuid.uuid4())
    if conv_id not in conversations:
        conversations[conv_id] = {
            "id": conv_id,
            "title": request.message[:50] + "..." if len(request.message) > 50 else request.message,
            "messages": [],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

    # Add user message to history
    conversations[conv_id]["messages"].append({
        "role": "user",
        "content": request.message,
    })
    conversations[conv_id]["updated_at"] = datetime.now().isoformat()

    # Build messages for API
    messages = conversations[conv_id]["messages"]
    model = request.model or DEFAULT_MODEL
    message_id = str(uuid.uuid4())

    async def generate():
        """Stream response from OpenRouter."""
        assistant_content = ""

        # Send message_start event
        yield f"data: {json.dumps({'type': 'message_start', 'conversation_id': conv_id, 'message_id': message_id})}\n\n"

        try:
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    "POST",
                    f"{OPENROUTER_BASE_URL}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:8000",
                        "X-Title": "Open Chat",
                    },
                    json={
                        "model": model,
                        "messages": messages,
                        "stream": True,
                    },
                    timeout=60.0,
                ) as response:
                    if response.status_code != 200:
                        error_text = await response.aread()
                        yield f"data: {json.dumps({'type': 'error', 'code': 'api_error', 'message': error_text.decode()})}\n\n"
                        yield "data: [DONE]\n\n"
                        return

                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data = line[6:]
                            if data == "[DONE]":
                                break

                            try:
                                chunk = json.loads(data)
                                content = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
                                if content:
                                    assistant_content += content
                                    yield f"data: {json.dumps({'type': 'text', 'content': content})}\n\n"
                            except json.JSONDecodeError:
                                continue

        except httpx.TimeoutException:
            yield f"data: {json.dumps({'type': 'error', 'code': 'timeout', 'message': 'Request timed out'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'code': 'error', 'message': str(e)})}\n\n"

        # Store assistant message
        if assistant_content:
            conversations[conv_id]["messages"].append({
                "role": "assistant",
                "content": assistant_content,
            })

        # Send message_end event
        yield f"data: {json.dumps({'type': 'message_end'})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
