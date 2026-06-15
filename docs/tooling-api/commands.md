# Commands & config files

**Index:** [../TOOLING-API.md](../TOOLING-API.md)

## Commands

| Task                        | Command                                                            |
| --------------------------- | ------------------------------------------------------------------ |
| Lint + format check (hooks) | `npm run lint:api` (from repo root)                                |
| Lint only                   | `cd apps/api && uv run ruff check .`                               |
| Format check only           | `cd apps/api && uv run ruff format --check .`                      |
| Auto-fix locally (optional) | `cd apps/api && uv run ruff check --fix . && uv run ruff format .` |
| Install deps                | `cd apps/api && uv sync`                                           |
| Run API                     | `cd apps/api && uv run uvicorn main:app --reload --port 8000`      |

## Config files

| File                       | Purpose                                   |
| -------------------------- | ----------------------------------------- |
| `apps/api/pyproject.toml`  | Dependencies + `[tool.ruff]` config       |
| `apps/api/uv.lock`         | Locked transitive deps (commit this)      |
| `apps/api/.python-version` | Python 3.12                               |
| `package.json` (root)      | `lint:api` script + lint-staged for `.py` |
| `.husky/pre-push`          | Runs `npm run lint:api`                   |
