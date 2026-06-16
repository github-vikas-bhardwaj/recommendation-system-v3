# pytest

**Index:** [../TOOLING-API.md](../TOOLING-API.md)

[pytest](https://docs.pytest.org/) = test runner for Python (like Vitest on web).

## Install

```bash
cd apps/api
uv add --dev pytest httpx2
```

`httpx2` is required for FastAPI `TestClient`.

## Config

File: `apps/api/pyproject.toml`

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["."]
```

| Setting      | Purpose                                                       |
| ------------ | ------------------------------------------------------------- |
| `testpaths`  | Only discover tests in `tests/`                               |
| `pythonpath` | Add `apps/api` to import path so `from main import app` works |

## Test layout

```
apps/api/tests/
├── conftest.py       # setup before tests (env vars)
└── test_health.py    # GET /health via TestClient
```

### `conftest.py`

Runs automatically before tests. Sets default Ollama env vars so importing `main` (and the chain) does not fail.

### `test_health.py`

Uses `TestClient` to call `/health` in-process — no `uvicorn`, no port 8000, no real LLM call.

## Commands

| Task           | Command                        |
| -------------- | ------------------------------ |
| Run tests      | `cd apps/api && uv run pytest` |
| Verbose        | `uv run pytest -v`             |
| From repo root | `npm run test:api`             |

## When it runs

**pre-push only** — not on pre-commit.

```
npm run test:api
```

Full pre-push order: see [hooks.md](./hooks.md).

## Web vs API

|             | Web                | API                         |
| ----------- | ------------------ | --------------------------- |
| Runner      | Vitest             | pytest                      |
| Config      | `vitest.config.ts` | `[tool.pytest.ini_options]` |
| Root script | `npm run test`     | `npm run test:api`          |
