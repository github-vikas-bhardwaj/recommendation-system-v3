# Local setup

**Previous:** [prerequisites.md](./prerequisites.md)  
**Next:** [../../apps/web/README.md](../../apps/web/README.md)

## 1. Environment files

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

| App | File                  | Purpose              |
| --- | --------------------- | -------------------- |
| API | `apps/api/.env`       | Ollama, LangSmith    |
| Web | `apps/web/.env.local` | `AI_API_URL` for BFF |

API env details: [../../apps/api/README.md](../../apps/api/README.md)

## 2. Install dependencies

```bash
# Web — from repo root
nvm use && npm install

# API
cd apps/api && uv sync
```

## 3. Start the API

Terminal 1 — from `apps/api`:

```bash
uv run uvicorn main:app --reload --port 8000
```

| Endpoint   | URL                                         |
| ---------- | ------------------------------------------- |
| Health     | http://localhost:8000/health                |
| OpenAPI    | http://localhost:8000/docs                  |
| Playground | http://localhost:8000/recommend/playground/ |

## 4. Start the web app

Terminal 2 — from repo root:

```bash
npm run dev -w web
```

Open http://localhost:3000

## Quick test

```bash
# BFF (recommended)
curl -X POST http://localhost:3000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"input": "thriller"}'

# API directly (dev only)
curl -X POST http://localhost:8000/recommend/invoke \
  -H "Content-Type: application/json" \
  -d '{"input": {"input": "thriller"}}'
```
