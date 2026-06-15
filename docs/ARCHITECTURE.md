# Architecture

Gen AI recommendation platform with two deployable applications in a monorepo.

**Previous:** [../README.md](../README.md)  
**Next:** [GETTING-STARTED.md](./GETTING-STARTED.md)  
**Index:** [docs/README.md](./README.md)

## Applications

| App | Path       | Stack                         | Responsibility                |
| --- | ---------- | ----------------------------- | ----------------------------- |
| Web | `apps/web` | Next.js                       | UI, authentication, BFF proxy |
| API | `apps/api` | FastAPI, LangChain, LangServe | Gen AI chains, RAG, tracing   |

## Request flow

```
Browser → Next.js (:3000) → FastAPI + LangServe (:8000) → Ollama
```

- The browser **only** talks to Next.js (same origin).
- Next.js calls FastAPI **server-side**; the Python URL is never exposed to the client.
- `POST /api/recommend` (Next.js) → `POST /recommend/invoke` (LangServe).

## Trust boundaries

**Next.js** — validates the user session; attaches `user_id` before proxying. Do not trust identity fields from the browser alone.

**FastAPI** — holds LLM keys, LangSmith credentials, and vector DB access. In production, only the BFF should reach it.

## Secrets

| Secret                      | Location        |
| --------------------------- | --------------- |
| LLM / LangSmith / vector DB | `apps/api` only |
| Session / auth              | `apps/web` only |

Never commit `.env` files.

## Ownership (v1)

| Area                        | Owner             |
| --------------------------- | ----------------- |
| `apps/web`                  | Vikas (team lead) |
| `apps/api`                  | Vikas (team lead) |
| `docs/`, repo structure, CI | Vikas (team lead) |

Split ownership when the team grows.

## Out of scope for v1

Docker, CI/CD, streaming through BFF, RAG/vector store, shared `packages/`, production deployment.
