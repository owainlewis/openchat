# Open Chat

A production-ready UI for AI agents. Build your backend in any language, point this UI at it.

## Architecture

```
┌─────────────────────────────────┐
│         Open Chat UI            │
│    (Static React Frontend)      │
│                                 │
│  • No secrets / API keys        │
│  • No persistence               │
│  • Stateless display layer      │
│  • Configurable via config.json │
└───────────────┬─────────────────┘
                │ HTTP + SSE
                ▼
┌─────────────────────────────────┐
│      Your Backend               │
│   (Python/Node/Go/Rust/etc)     │
│                                 │
│  • API keys (secure)            │
│  • Conversation storage         │
│  • Agent logic / tools          │
│  • LLM provider calls           │
└─────────────────────────────────┘
```

## Quick Start

### 1. Start the backend

```bash
cd server
pip install -r requirements.txt
export OPENROUTER_API_KEY=sk-or-v1-xxx
uvicorn main:app --reload
```

### 2. Start the frontend

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Features

- **Model selector** - Switch between models
- **Streaming responses** - Real-time SSE streaming
- **Tool calls** - Display agent tool usage
- **Dark/light mode** - Theme toggle
- **Example prompts** - Configurable quick starts
- **File uploads** - Attach files to messages

## Configuration

Edit `public/config.json`:

```json
{
  "api": {
    "baseUrl": "http://localhost:8000",
    "mode": "native"
  },
  "ui": {
    "title": "My Agent",
    "welcomeMessage": "How can I help?",
    "welcomeSubtitle": "I'm an AI assistant.",
    "examplePrompts": [
      {
        "icon": "code",
        "title": "Help me code",
        "prompt": "Write a React component..."
      }
    ]
  }
}
```

## API Contract

Your backend must implement the [Open Chat API](docs/API.md):

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chat` | POST | Send message (streaming SSE) |
| `/models` | GET | List available models (optional) |
| `/conversations` | GET | List conversations (optional) |

See [docs/API.md](docs/API.md) for the full specification.

## Example Backend

The `server/` directory contains a reference FastAPI implementation that proxies to OpenRouter:

```bash
cd server
pip install -r requirements.txt
export OPENROUTER_API_KEY=sk-or-v1-xxx
python main.py
```

## Building for Production

```bash
npm run build
```

Static files are output to `dist/`. Deploy to any static hosting (Vercel, Netlify, S3, etc).

## Why Open Chat?

- **Language agnostic** - Works with any backend (Python, Node, Go, Rust)
- **Production ready** - Not a prototype or demo tool
- **Customizable** - Theming, prompts, models via config
- **Secure** - API keys stay on your backend, never in the frontend
- **Lightweight** - ~30KB gzipped (excluding markdown/syntax highlighting)

## License

MIT
