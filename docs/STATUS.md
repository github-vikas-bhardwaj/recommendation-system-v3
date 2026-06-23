# Project status

**Index:** [docs/README.md](./README.md)

## Done

- Monorepo skeleton + documentation
- FastAPI + LangServe + Ollama chain
- LangSmith tracing
- Next.js BFF + test page
- Web dev tooling (ESLint, Prettier, Husky, Vitest, Knip, tsc, `lint:web` on pre-push)
- API dev tooling (Ruff, pytest, pyright, deptry via `knip:api`, lint-staged, pre-push)
- CI (GitHub Actions — `.github/workflows/ci.yml`, mirrors pre-push)
- Branch protection on `main` and `release/next` (require PR, block force push)

## Branch protection — required status check

Require **one** job-level check only:

```
CI / check
```

(or `check` — use the exact label GitHub shows after CI runs on a PR)

Do **not** require individual workflow steps (`Checkout`, `Setup Node`, `Type-check (WEB)`, etc.). The `check` job fails if any step fails.

CI must run at least once on a PR before the check appears in the ruleset picker.

## Planned

- RAG / vector store (`apps/api`)
- Final product UI
- Docker, deployment

## Local ports

| Service | Port    |
| ------- | ------- |
| Next.js | `3000`  |
| FastAPI | `8000`  |
| Ollama  | `11434` |
