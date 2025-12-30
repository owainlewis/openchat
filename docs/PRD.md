# Open Chat

## Design Document

**Version:** 0.1 (Draft)
**Author:** [Your Name]
**Date:** December 2024

---

## Overview

Open Chat is a lightweight, production-ready chat UI for AI applications. It's a static frontend that connects to any backend via a simple API contract—no bundled server, no database, no opinions about your LLM or framework.

**Tagline:** *"The frontend for your AI. Nothing more, nothing less."*

Open Chat is for developers who are **building** AI applications, not just using them. Whether you've built a custom agent, want to create your own multi-model chat app, or need to ship an AI product fast—Open Chat gives you a beautiful, functional interface in minutes.

### What you can build with Open Chat

| Use Case | Backend | Result |
|----------|---------|--------|
| **Custom agent UI** | Your PydanticAI/LangGraph agent | ChatGPT-like interface for your agent |
| **Multi-model chat** | OpenRouter API | Your own T3 Chat / multi-LLM app |
| **Internal AI tool** | Company's internal LLM endpoint | Slack-like chat for your team's AI |
| **Startup MVP** | Any LLM API | Ship an AI product without building frontend |
| **Client project** | Client's AI backend | White-label, rebrandable chat UI |
| **Local LLM interface** | Ollama / llama.cpp | Lightweight alternative to Open WebUI |

The goal: stop rebuilding chat UIs. Configure once, deploy anywhere, get back to building your actual product.

---

## Problem Statement

You're a developer building an AI application. You've got your agent working, your API is ready, and now you need a UI.

**Your options suck:**

1. **Build from scratch** — weeks of React/CSS/streaming logic for something that "just" needs to display chat messages
2. **Framework-coupled UIs** (Chainlit, Gradio) — tied to specific Python runtimes, hard to customize, look like demos
3. **Full platforms** (Open WebUI) — need Docker, a database, and bring their own backend logic you don't need
4. **Consumer products** (T3 Chat, ChatGPT) — great UX, but you can't self-host or customize them
5. **Component libraries** (chatscope, Vercel AI SDK) — still requires significant frontend work to assemble

The result: developers either waste days building chat UIs, or ship with ugly/limited interfaces that don't reflect the quality of their actual work.

**Open Chat exists so you never build another chat UI again.**

---

## Competitive Positioning

### Open Chat vs Open WebUI

Open WebUI (115k+ GitHub stars) is the dominant player in self-hosted AI interfaces. Understanding the difference is critical to Open Chat's positioning.

**Open WebUI is a ChatGPT replacement. Open Chat is a UI for your agent.**

| Dimension | Open WebUI | Open Chat |
|-----------|------------|-----------|
| **Architecture** | Full-stack application (Svelte + Python + DB) | Static frontend only |
| **Backend** | Bundles its own | Points to yours |
| **Agent logic** | Built-in (RAG, pipelines, tools) | You bring your own |
| **Target user** | End users wanting a ChatGPT alternative | Developers building custom agents |
| **Deployment** | Docker required, database required | Static files, zero infrastructure |
| **LLM providers** | Ollama-first, OpenAI-compatible | Provider-agnostic (any HTTP endpoint) |
| **Configuration** | 100+ environment variables | ~20 options in a JSON file |
| **Auth/multi-user** | Built-in RBAC, SCIM, user management | None (your app handles it) |
| **Complexity** | 14k+ commits, massive codebase | Target: <5k LOC |

### When to use Open WebUI

- You want to self-host a ChatGPT-like experience
- You're running Ollama and want a nice UI for it
- You need multi-user support, teams, permissions
- You want built-in RAG, web search, image generation

### When to use Open Chat

- You've built a custom agent and need a UI for it
- Your backend already handles the AI logic
- You want to deploy in 5 minutes, not 5 hours
- You don't want another database or Docker container
- You need something you can embed or customize easily

### The simplicity pitch

```bash
# Open WebUI setup
docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data --name open-webui --restart always \
  ghcr.io/open-webui/open-webui:main

# Open Chat setup  
npx open-chat --api http://localhost:8000/chat
```

One command. No Docker. No database. No backend. Just static files talking to your existing API.

---

### Open Chat vs T3 Chat

T3 Chat is a polished consumer SaaS—Theo built a beautiful frontend and manages API aggregation for users. Open Chat lets you build your own T3 Chat.

| Dimension | T3 Chat | Open Chat |
|-----------|---------|-----------|
| **Product type** | SaaS (you're a user) | Tool (you're a builder) |
| **API keys** | Theo manages them | You bring your own |
| **Models available** | Fixed set (GPT-4, Claude, etc.) | Any endpoint you configure |
| **Billing** | $8/month to T3 | Your API costs only |
| **Customization** | Use as-is | Full control, rebrandable |
| **Data** | On their infrastructure | On your infrastructure |

**If you want to USE a multi-model chat app:** Use T3 Chat.
**If you want to BUILD a multi-model chat app:** Use Open Chat + OpenRouter.

---

### Common Configurations

**1. Custom Agent (PydanticAI, LangGraph, etc.)**
```json
{
  "api": {
    "baseUrl": "http://localhost:8000",
    "endpoints": { "chat": "/chat" }
  }
}
```

**2. Multi-Model Chat (via OpenRouter)**
```json
{
  "api": {
    "baseUrl": "https://openrouter.ai/api/v1",
    "endpoints": { "chat": "/chat/completions" },
    "headers": { "Authorization": "Bearer ${OPENROUTER_API_KEY}" }
  },
  "ui": {
    "title": "My AI Chat",
    "modelSelector": true
  }
}
```

**3. Direct to Anthropic/OpenAI**
```json
{
  "api": {
    "baseUrl": "https://api.anthropic.com",
    "endpoints": { "chat": "/v1/messages" },
    "headers": { "x-api-key": "${ANTHROPIC_API_KEY}" }
  }
}
```

**4. Local LLM (Ollama)**
```json
{
  "api": {
    "baseUrl": "http://localhost:11434",
    "endpoints": { "chat": "/api/chat" }
  }
}
```

---

## Goals

1. **5-minute setup** — from zero to working UI in one command
2. **Zero infrastructure** — no Docker, no database, no backend process
3. **Backend agnostic** — works with any language or framework that serves HTTP
4. **Provider agnostic** — not tied to OpenAI, Anthropic, Ollama, or any specific LLM
5. **Truly static** — deploy to Vercel, Netlify, S3, or serve from your API
6. **Beautiful defaults** — looks professional without configuration
7. **Agent-first** — streaming, tool calls, file handling built for modern agents
8. **Tiny footprint** — target <100KB gzipped, <5k lines of code

## Non-Goals

1. **User authentication** — the host application handles this
2. **Multi-tenant / team features** — this is a single-user UI
3. **LLM provider integration** — we talk to your backend, not to LLMs directly
4. **Conversation analytics** — out of scope
5. **Plugin system** — keep it simple for v1
6. **RAG, web search, image generation** — your agent does this, not the UI

---

## Design Principles

### 1. Complexity is the enemy

Every feature must justify its complexity cost. When in doubt, leave it out. Open WebUI has 100+ env vars—we have 20. They have a Python backend—we have none.

### 2. Your backend, your rules

Open Chat doesn't know or care what LLM you're using, what framework you chose, or how your agent works. It speaks HTTP and renders responses. That's it.

### 3. Static means static

The entire app is HTML, CSS, and JavaScript. No server process, no database, no runtime. Deploy it to a CDN and forget about it.

### 4. Convention over configuration

Sensible defaults mean most users never touch config.json. The streaming format is opinionated so backends can implement it quickly.

### 5. Escape hatches everywhere

When you do need to customize, you can. CSS variables for theming. Config for behavior. Fork and modify if needed—the codebase is small enough to understand.

---

## Architecture

### High-Level

```
┌─────────────────────────────────────────────────────────────────┐
│                         Host Environment                         │
│  (Vercel, Cloudflare Pages, Docker, S3, or alongside your API)  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                           Open Chat                              │
│                     (Static React Application)                   │
│                                                                  │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│   │   Config    │  │     UI      │  │    API Client           │ │
│   │   Loader    │──│  Components │──│  (SSE, REST, WebSocket) │ │
│   └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼ HTTP
┌─────────────────────────────────────────────────────────────────┐
│                        Your Backend                              │
│           (Any language, any framework, any LLM)                 │
│                                                                  │
│   Implements the Open Chat API Contract:                         │
│   • POST /chat          (streaming or non-streaming)             │
│   • POST /upload        (optional)                               │
│   • GET  /conversations (optional)                               │
│   • GET  /conversations/:id (optional)                           │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | React 18 | Ecosystem, contributor pool |
| Build | Vite | Fast, simple, good defaults |
| Styling | Tailwind CSS | Utility-first, easy theming |
| State | Zustand | Minimal, no boilerplate |
| Streaming | Native EventSource + fetch | No dependencies |
| Markdown | marked + highlight.js | Lightweight, widely used |
| Persistence | localStorage | Zero-config default |

### Bundle

Target: **< 100KB gzipped** (excluding syntax highlighting themes)

The app should load fast on any connection. No heavy dependencies.

---

## Configuration

Open Chat is configured via a `config.json` file served alongside the app, or via environment variables at build time.

### config.json

```json
{
  "api": {
    "baseUrl": "http://localhost:8000",
    "endpoints": {
      "chat": "/chat",
      "upload": "/upload",
      "conversations": "/conversations",
      "conversation": "/conversations/:id"
    },
    "headers": {
      "Authorization": "Bearer ${AUTH_TOKEN}"
    }
  },
  "features": {
    "streaming": true,
    "fileUpload": true,
    "imageUpload": true,
    "conversationHistory": true,
    "toolCalls": true,
    "codeExecution": false,
    "messageEditing": true,
    "messageBranching": false,
    "tokenUsage": false
  },
  "ui": {
    "title": "Open Chat",
    "subtitle": "",
    "logo": "",
    "theme": "system",
    "accentColor": "#2563eb",
    "fontFamily": "system-ui",
    "welcomeMessage": "How can I help you today?",
    "inputPlaceholder": "Message...",
    "maxFileSize": 10485760,
    "allowedFileTypes": ["*"]
  },
  "behavior": {
    "autofocus": true,
    "saveConversationsLocally": true,
    "sendOnEnter": true,
    "showTimestamps": false,
    "collapseToolCalls": true
  }
}
```

### Environment Variables

For deployment platforms that support build-time env vars:

```bash
OPENCHAT_API_BASE_URL=https://api.example.com
OPENCHAT_TITLE="My Agent"
OPENCHAT_THEME=dark
```

Environment variables override `config.json` values.

### Runtime Configuration

For dynamic configuration (e.g., per-user settings), the host page can pass config via:

```html
<script>
  window.OPENCHAT_CONFIG = {
    api: { baseUrl: "https://user-specific-api.example.com" }
  };
</script>
```

---

## API Contract

Open Chat expects your backend to implement the following endpoints. Only `/chat` is required; others enable optional features.

### API Modes

Open Chat supports two API modes:

**1. Open Chat Native Format** (recommended for custom agents)
- Full control over streaming events
- Tool call visualization
- Custom metadata

**2. OpenAI-Compatible Format** (for direct LLM access)
- Works with OpenAI, Anthropic, OpenRouter, Ollama, etc.
- Standard `/v1/chat/completions` format
- Model selection support

```json
{
  "api": {
    "mode": "openai",  // or "native"
    "baseUrl": "https://openrouter.ai/api/v1"
  }
}
```

When using OpenAI mode, Open Chat automatically handles the request/response format translation.

### POST /chat

Send a message and receive a response. Supports both streaming (SSE) and non-streaming modes.

**Request:**

```json
{
  "message": "What's the weather in London?",
  "conversation_id": "conv_abc123",
  "files": [
    { "id": "file_xyz", "name": "data.csv", "type": "text/csv" }
  ]
}
```

**Response (Streaming via SSE):**

```
Content-Type: text/event-stream

data: {"type": "message_start", "conversation_id": "conv_abc123", "message_id": "msg_001"}

data: {"type": "text", "content": "Let me "}
data: {"type": "text", "content": "check that "}
data: {"type": "text", "content": "for you."}

data: {"type": "tool_start", "id": "tool_001", "name": "weather_lookup", "input": {"city": "London"}}
data: {"type": "tool_end", "id": "tool_001", "output": {"temp": 12, "conditions": "cloudy"}}

data: {"type": "text", "content": "\n\nIt's currently 12°C and cloudy in London."}

data: {"type": "message_end", "usage": {"input_tokens": 24, "output_tokens": 47}}
```

**Response (Non-Streaming):**

```json
{
  "conversation_id": "conv_abc123",
  "message_id": "msg_001",
  "content": "It's currently 12°C and cloudy in London.",
  "tool_calls": [
    {
      "id": "tool_001",
      "name": "weather_lookup",
      "input": {"city": "London"},
      "output": {"temp": 12, "conditions": "cloudy"}
    }
  ],
  "usage": {
    "input_tokens": 24,
    "output_tokens": 47
  }
}
```

### POST /upload

Upload a file for use in conversation.

**Request:**

```
Content-Type: multipart/form-data

file: (binary)
```

**Response:**

```json
{
  "id": "file_xyz789",
  "name": "document.pdf",
  "type": "application/pdf",
  "size": 245123
}
```

### GET /conversations

List conversations for the sidebar.

**Response:**

```json
{
  "conversations": [
    {
      "id": "conv_abc123",
      "title": "Weather in London",
      "created_at": "2024-12-28T10:30:00Z",
      "updated_at": "2024-12-28T10:35:00Z",
      "message_count": 4
    }
  ],
  "has_more": false,
  "cursor": null
}
```

### GET /conversations/:id

Retrieve messages for a specific conversation.

**Response:**

```json
{
  "id": "conv_abc123",
  "title": "Weather in London",
  "messages": [
    {
      "id": "msg_001",
      "role": "user",
      "content": "What's the weather in London?",
      "files": [],
      "created_at": "2024-12-28T10:30:00Z"
    },
    {
      "id": "msg_002",
      "role": "assistant",
      "content": "It's currently 12°C and cloudy in London.",
      "tool_calls": [...],
      "created_at": "2024-12-28T10:30:02Z"
    }
  ]
}
```

### DELETE /conversations/:id

Delete a conversation.

**Response:**

```json
{
  "deleted": true
}
```

### Error Format

All endpoints should return errors in this format:

```json
{
  "error": {
    "code": "rate_limited",
    "message": "Too many requests. Please try again in 30 seconds.",
    "retry_after": 30
  }
}
```

---

## Features

### Core (v1.0)

| Feature | Description |
|---------|-------------|
| Streaming responses | Real-time text display via SSE |
| Tool call visualization | Show when agent uses tools, with inputs/outputs |
| File upload | Drag-drop or click to upload |
| Conversation history | Sidebar with past conversations |
| Local persistence | Conversations saved to localStorage |
| Dark/light/system themes | Respects OS preference, manual toggle |
| Code syntax highlighting | Automatic language detection |
| Copy code blocks | One-click copy button |
| Stop generation | Cancel in-progress responses |
| Keyboard shortcuts | Enter to send, Escape to stop, Cmd+K for new chat |
| Mobile responsive | Collapsible sidebar, touch-friendly |
| Markdown rendering | Full CommonMark support |
| Model selector | Switch models mid-conversation (OpenAI mode) |
| OpenAI-compatible mode | Works directly with any OpenAI-format API |

### Extended (v1.x)

| Feature | Description |
|---------|-------------|
| Message editing | Edit previous messages, optionally branch |
| Conversation branching | Fork from any point in conversation |
| Token usage display | Show input/output tokens and cost |
| Export conversations | Download as Markdown, JSON, or PDF |
| Image preview | Inline display of uploaded images |
| Audio input | Speech-to-text via browser API |
| Custom themes | User-defined color schemes |
| System prompt presets | Quick switch between agent personas |

### Future Consideration (v2+)

| Feature | Description |
|---------|-------------|
| Multi-modal responses | Image/audio generation display |
| Artifacts | Rendered HTML/React previews (à la Claude) |
| Collaborative | Shared conversations (requires auth) |
| Analytics | Token usage over time, common queries |

---

## User Interface

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────────┐ ┌─────────────────────────────────────────┐ │
│ │    Sidebar      │ │              Chat Area                  │ │
│ │                 │ │                                         │ │
│ │ [+ New Chat]    │ │  ┌─────────────────────────────────┐    │ │
│ │                 │ │  │ User message                    │    │ │
│ │ Today           │ │  └─────────────────────────────────┘    │ │
│ │ ├─ Conv 1 █     │ │                                         │ │
│ │ ├─ Conv 2       │ │  ┌─────────────────────────────────┐    │ │
│ │                 │ │  │ Assistant message               │    │ │
│ │ Yesterday       │ │  │                                 │    │ │
│ │ ├─ Conv 3       │ │  │ ┌─────────────────────────────┐ │    │ │
│ │ ├─ Conv 4       │ │  │ │ Tool: search               │ │    │ │
│ │                 │ │  │ │ "latest news"    ✓ Done    │ │    │ │
│ │                 │ │  │ └─────────────────────────────┘ │    │ │
│ │                 │ │  │                                 │    │ │
│ │                 │ │  │ Here's what I found...         │    │ │
│ │                 │ │  └─────────────────────────────────┘    │ │
│ │                 │ │                                         │ │
│ │                 │ ├─────────────────────────────────────────┤ │
│ │ [Settings]      │ │ [📎] [         Message...        ] [➤] │ │
│ │ [Theme Toggle]  │ │          ⌘+Enter to send               │ │
│ └─────────────────┘ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Layout

```
┌─────────────────────┐
│ [☰]  Open Chat  [+] │
├─────────────────────┤
│                     │
│  ┌───────────────┐  │
│  │ User message  │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │ Assistant     │  │
│  │ message       │  │
│  └───────────────┘  │
│                     │
├─────────────────────┤
│ [📎] [       ] [➤]  │
└─────────────────────┘
```

### Tool Call Display

Tool calls are shown inline with collapsible details:

**Collapsed (default):**
```
┌─────────────────────────────────────┐
│ 🔍 search  "AI news 2024"    ✓ Done │
└─────────────────────────────────────┘
```

**Expanded:**
```
┌─────────────────────────────────────┐
│ 🔍 search  "AI news 2024"    ✓ Done │
├─────────────────────────────────────┤
│ Input:                              │
│ { "query": "AI news 2024" }         │
│                                     │
│ Output:                             │
│ { "results": [...] }                │
└─────────────────────────────────────┘
```

**In progress:**
```
┌─────────────────────────────────────┐
│ 🔍 search  "AI news 2024"   ◌ ...   │
└─────────────────────────────────────┘
```

---

## Deployment

### Option 1: Static Hosting

Build and deploy to any static host.

```bash
npm run build
# Upload dist/ to Vercel, Netlify, Cloudflare Pages, S3, etc.
```

**With config:**
```bash
# Include your config in the build
cp config.json dist/
```

### Option 2: Docker

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

```bash
docker build -t openchat .
docker run -p 3000:80 \
  -v $(pwd)/config.json:/usr/share/nginx/html/config.json \
  openchat
```

### Option 3: Alongside Your API

Serve the built files from your backend:

**Python (FastAPI):**
```python
from fastapi.staticfiles import StaticFiles

app.mount("/", StaticFiles(directory="openchat/dist", html=True))
```

**Node (Express):**
```javascript
app.use(express.static('openchat/dist'));
app.get('*', (req, res) => res.sendFile('index.html'));
```

### Option 4: Embed in Existing Page

```html
<div id="openchat-root"></div>
<script>
  window.OPENCHAT_CONFIG = { api: { baseUrl: "/api" } };
</script>
<script src="https://unpkg.com/openchat@latest/dist/openchat.umd.js"></script>
```

---

## Backend Adapters

While Open Chat is backend-agnostic, we provide optional adapters for common frameworks to make integration trivial.

### Python (PydanticAI + FastAPI)

```bash
pip install openchat-python
```

```python
from fastapi import FastAPI
from openchat import OpenChatRoutes
from pydantic_ai import Agent

agent = Agent('openai:gpt-4o', system_prompt="You are a helpful assistant.")

app = FastAPI()
app.include_router(OpenChatRoutes(agent).router)
```

### Python (LangGraph)

```python
from openchat import OpenChatRoutes
from my_graph import graph

app.include_router(OpenChatRoutes.from_langgraph(graph).router)
```

### Node.js (Express)

```bash
npm install @openchat/express
```

```javascript
import { openChatRouter } from '@openchat/express';

app.use('/api', openChatRouter({
  chat: async function* (message, conversationId) {
    // Your agent logic here
    yield { type: 'text', content: 'Hello!' };
  }
}));
```

These adapters are optional conveniences. Any backend that implements the API contract will work.

---

## Project Structure

```
openchat/
├── src/
│   ├── components/
│   │   ├── Chat/
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── Message.tsx
│   │   │   ├── ToolCall.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   └── InputArea.tsx
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ConversationList.tsx
│   │   │   └── ConversationItem.tsx
│   │   ├── FileUpload/
│   │   │   ├── UploadButton.tsx
│   │   │   ├── UploadPreview.tsx
│   │   │   └── DropZone.tsx
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── IconButton.tsx
│   │       └── ThemeToggle.tsx
│   ├── hooks/
│   │   ├── useChat.ts
│   │   ├── useStreaming.ts
│   │   ├── useConversations.ts
│   │   ├── useFileUpload.ts
│   │   └── useKeyboardShortcuts.ts
│   ├── stores/
│   │   ├── chatStore.ts
│   │   ├── configStore.ts
│   │   └── uiStore.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── sse.ts
│   │   └── storage.ts
│   ├── types/
│   │   ├── message.ts
│   │   ├── conversation.ts
│   │   ├── config.ts
│   │   └── api.ts
│   ├── utils/
│   │   ├── markdown.ts
│   │   ├── formatters.ts
│   │   └── constants.ts
│   ├── styles/
│   │   └── index.css
│   ├── App.tsx
│   ├── main.tsx
│   └── config.ts
├── public/
│   └── config.json
├── adapters/
│   ├── python/
│   │   └── openchat/
│   └── node/
│       └── openchat/
├── docs/
│   ├── getting-started.md
│   ├── configuration.md
│   ├── api-contract.md
│   └── deployment.md
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## Roadmap

### Phase 1: Foundation (v0.1)

- [ ] Project scaffolding (Vite + React + Tailwind)
- [ ] Config system (file + env + runtime)
- [ ] Basic chat UI (messages, input)
- [ ] SSE streaming client
- [ ] Message rendering (markdown, code blocks)
- [ ] Copy code button
- [ ] Dark/light theme

### Phase 2: Core Features (v0.5)

- [ ] Sidebar with conversation list
- [ ] Local storage persistence
- [ ] File upload (UI only, posts to configured endpoint)
- [ ] Tool call display
- [ ] Stop generation
- [ ] Keyboard shortcuts
- [ ] Mobile responsive layout

### Phase 3: Polish (v1.0)

- [ ] Loading states and error handling
- [ ] Retry failed messages
- [ ] Accessibility audit (ARIA, focus management)
- [ ] Documentation site
- [ ] Python adapter (PydanticAI)
- [ ] Docker image
- [ ] npm package for embedding

### Phase 4: Extended Features (v1.x)

- [ ] Message editing
- [ ] Conversation export
- [ ] Token usage display
- [ ] Image preview for uploads
- [ ] Custom themes
- [ ] Node.js adapter

### Future

- [ ] Conversation branching
- [ ] Audio input
- [ ] Artifact rendering
- [ ] Plugin system (maybe)

---

## Success Metrics

**For personal use:**
- Can deploy a new agent UI in under 5 minutes
- Can point to OpenRouter and have a working multi-model chat
- Doesn't feel like a compromise vs. building custom

**For open source adoption:**
- 500+ GitHub stars in first month
- 10+ community PRs
- Featured in AI/developer newsletters
- "Open Chat" becomes the default answer to "what UI should I use for my agent?"

---

## Why This Will Work

**The timing is right:**
- AI agent frameworks (PydanticAI, LangGraph, CrewAI) are exploding—developers need UIs
- OpenRouter makes multi-model access trivial—but there's no good self-hosted frontend
- Open WebUI proved demand exists, but it's too heavy for most use cases
- The "ship fast" culture means developers won't spend weeks on UI

**The gap is real:**
- Every AI hackathon ends with "...and here's our terminal demo"
- Freelancers rebuilding chat UIs for every client project
- Startups choosing between ugly demos and expensive frontend work

**The approach is sound:**
- Static files = deploy anywhere, no maintenance
- Config-driven = no code changes for common use cases
- OpenAI-compatible = works with 90% of backends immediately
- Small codebase = easy to understand, contribute to, and fork

---

## Open Questions

1. **WebSocket support?** SSE covers most cases, but some deployments prefer WebSocket. Worth the complexity?

2. **Theming depth?** Full CSS variable exposure vs. simple presets. How much customization is enough?

3. **Conversation storage API?** Current design has the backend store conversations. Should we support a mode where Open Chat handles storage entirely (IndexedDB) with no backend persistence?

4. **Authentication passthrough?** Current design just forwards headers. Should we support OAuth flows, API key input UI, etc.?

5. **Internationalization?** Worth building i18n infrastructure for v1, or add later?

6. **Model list fetching?** For OpenAI mode, should we fetch available models from the API (e.g., `/v1/models`) or require manual configuration?

7. **System prompt UI?** Should users be able to set/edit system prompts in the UI, or leave that to the backend?

---

## References

- [PydanticAI Documentation](https://ai.pydantic.dev/)
- [Server-Sent Events Spec](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [Vercel AI SDK](https://sdk.vercel.ai/docs) (inspiration for streaming patterns)
- [Chainlit](https://chainlit.io/) (comparable tool, different approach)

---

## Appendix A: SSE Message Types

| Type | Description | Fields |
|------|-------------|--------|
| `message_start` | New message beginning | `conversation_id`, `message_id` |
| `text` | Text chunk | `content` |
| `tool_start` | Tool invocation starting | `id`, `name`, `input` |
| `tool_end` | Tool invocation complete | `id`, `output`, `error?` |
| `error` | Error occurred | `code`, `message` |
| `message_end` | Message complete | `usage?` |

## Appendix B: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line |
| `Escape` | Stop generation / Close modal |
| `Cmd/Ctrl + K` | New conversation |
| `Cmd/Ctrl + /` | Toggle sidebar |
| `Cmd/Ctrl + Shift + C` | Copy last code block |
| `Up Arrow` | Edit last message (when input empty) |

## Appendix C: Error Codes

| Code | Description |
|------|-------------|
| `rate_limited` | Too many requests |
| `context_length` | Conversation too long |
| `invalid_request` | Malformed request |
| `server_error` | Backend error |
| `network_error` | Connection failed |
| `timeout` | Request timed out |