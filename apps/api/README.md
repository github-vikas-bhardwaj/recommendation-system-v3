# API app (`apps/api`)

FastAPI + LangServe — LangChain chains via **Ollama**, traced in **LangSmith**.

**Previous:** [docs/GETTING-STARTED.md](../../docs/GETTING-STARTED.md)  
**Next:** [docs/TOOLING-API.md](../../docs/TOOLING-API.md)  
**Index:** [docs/README.md](../../docs/README.md)

## Role

```
Next.js (:3000) → FastAPI (:8000) → Ollama (:11434)
```

Browser never calls this service directly.

## Setup

```bash
uv sync    # from apps/api
cp .env.example .env
uv run uvicorn main:app --reload --port 8000
```

## Environment

| Variable               | Default                    | Description                |
| ---------------------- | -------------------------- | -------------------------- |
| `OLLAMA_BASE_URL`      | `http://localhost:11434`   | Ollama server              |
| `OLLAMA_MODEL`         | `llama3.2`                 | Model name                 |
| `LANGCHAIN_TRACING_V2` | —                          | `true` to enable LangSmith |
| `LANGCHAIN_API_KEY`    | —                          | LangSmith key              |
| `LANGCHAIN_PROJECT`    | `recommendation-system-v1` | LangSmith project          |

Never commit `.env`.

## Endpoints

| Endpoint   | URL                                         |
| ---------- | ------------------------------------------- |
| Health     | http://localhost:8000/health                |
| OpenAPI    | http://localhost:8000/docs                  |
| Playground | http://localhost:8000/recommend/playground/ |
| Invoke     | `POST /recommend/invoke`                    |

## Test

```bash
curl -X POST http://localhost:8000/recommend/invoke \
  -H "Content-Type: application/json" \
  -d '{"input": {"input": "thriller"}}'
```

End-to-end via BFF: [docs/setup/local-setup.md](../../docs/setup/local-setup.md)

## Key files

| Path                  | Purpose                        |
| --------------------- | ------------------------------ |
| `main.py`             | FastAPI app + LangServe routes |
| `chains/recommend.py` | Ollama chain                   |
| `pyproject.toml`      | Pinned deps                    |

After changing deps: `uv lock && uv sync`

Tooling (Ruff, hooks): [docs/TOOLING-API.md](../../docs/TOOLING-API.md)
