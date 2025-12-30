# Open Chat API Specification

This document describes the API contract that backends must implement to work with the Open Chat UI.

## Overview

Open Chat is a stateless frontend that communicates with your backend via HTTP + Server-Sent Events (SSE). Your backend is responsible for:

- Storing API keys securely
- Managing conversations (optional)
- Making LLM provider calls
- Implementing agent logic / tools

## Base URL

Configure your backend URL in the frontend's `config.json`:

```json
{
  "api": {
    "baseUrl": "http://localhost:8000",
    "mode": "native"
  }
}
```

## Endpoints

### POST /chat

Send a message and receive a streaming response.

**Request:**

```http
POST /chat
Content-Type: application/json
Accept: text/event-stream

{
  "message": "Hello, how are you?",
  "conversation_id": "conv_123",  // optional
  "model": "gpt-4"                // optional
}
```

**Response:** Server-Sent Events stream (see SSE Events below)

---

### GET /models (Optional)

Return available models for the model selector.

**Response:**

```json
[
  {
    "id": "gpt-4",
    "name": "GPT-4",
    "description": "OpenAI's most capable model"
  },
  {
    "id": "claude-3-opus",
    "name": "Claude 3 Opus",
    "description": "Anthropic's most capable model"
  }
]
```

---

### GET /conversations (Optional)

Return list of conversations for the sidebar.

**Response:**

```json
[
  {
    "id": "conv_123",
    "title": "Discussion about React hooks",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

---

### GET /conversations/:id (Optional)

Return a specific conversation with all messages.

**Response:**

```json
{
  "id": "conv_123",
  "title": "Discussion about React hooks",
  "messages": [
    { "role": "user", "content": "What are React hooks?" },
    { "role": "assistant", "content": "React hooks are..." }
  ],
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### DELETE /conversations/:id (Optional)

Delete a conversation.

**Response:**

```json
{ "success": true }
```

---

## SSE Event Types

The `/chat` endpoint returns a Server-Sent Events stream. Each event is a JSON object with a `type` field.

### message_start

Emitted when the assistant starts responding.

```json
{
  "type": "message_start",
  "conversation_id": "conv_123",
  "message_id": "msg_456"
}
```

### text

Emitted for each chunk of text content (streaming).

```json
{
  "type": "text",
  "content": "Hello! I'm"
}
```

### tool_start

Emitted when a tool/function call begins.

```json
{
  "type": "tool_start",
  "id": "tool_789",
  "name": "search_web",
  "input": { "query": "latest news" }
}
```

### tool_end

Emitted when a tool/function call completes.

```json
{
  "type": "tool_end",
  "id": "tool_789",
  "output": { "results": [...] },
  "error": null
}
```

### error

Emitted when an error occurs.

```json
{
  "type": "error",
  "code": "rate_limit",
  "message": "Too many requests. Please try again later."
}
```

### message_end

Emitted when the message is complete. Includes optional usage stats.

```json
{
  "type": "message_end",
  "usage": {
    "input_tokens": 150,
    "output_tokens": 89
  }
}
```

### Stream Complete

The stream ends with:

```
data: [DONE]
```

---

## Example SSE Stream

```
data: {"type":"message_start","conversation_id":"conv_123","message_id":"msg_456"}

data: {"type":"text","content":"Hello"}

data: {"type":"text","content":"! How"}

data: {"type":"text","content":" can I help"}

data: {"type":"text","content":" you today?"}

data: {"type":"message_end","usage":{"input_tokens":10,"output_tokens":8}}

data: [DONE]
```

---

## CORS

Your backend must allow CORS from the frontend origin:

```python
# FastAPI example
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Authentication (Optional)

If your backend requires authentication, you can:

1. **API Key in header:** Frontend can pass custom headers via config
2. **Cookie-based auth:** For same-domain deployments
3. **Token in URL:** Pass as query parameter

Example config with custom header:

```json
{
  "api": {
    "baseUrl": "https://api.example.com",
    "headers": {
      "X-API-Key": "your-api-key"
    }
  }
}
```

---

## Error Handling

Return appropriate HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (invalid input) |
| 401 | Unauthorized |
| 429 | Rate limited |
| 500 | Server error |

For streaming errors, emit an `error` event before `[DONE]`.
