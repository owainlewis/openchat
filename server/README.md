# Open Chat Backend Server

A reference FastAPI implementation of the Open Chat API contract.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Set your OpenRouter API key
export OPENROUTER_API_KEY=sk-or-v1-xxx

# Run the server
uvicorn main:app --reload
```

Server runs at http://localhost:8000

## Docker

```bash
docker build -t openchat-server .
docker run -e OPENROUTER_API_KEY=sk-or-v1-xxx -p 8000:8000 openchat-server
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/models` | GET | List available models |
| `/chat` | POST | Send message (streaming) |
| `/conversations` | GET | List conversations |
| `/conversations/:id` | GET | Get conversation |
| `/conversations/:id` | DELETE | Delete conversation |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | Your OpenRouter API key |

## Customization

This is a reference implementation. In production you might:

- Replace in-memory storage with SQLite/PostgreSQL
- Add authentication (JWT, API keys)
- Add rate limiting
- Use your own LLM provider instead of OpenRouter
- Add custom tools/agents
