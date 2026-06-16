# Commands & config files

**Index:** [../TOOLING-API.md](../TOOLING-API.md)

## Commands

| Task                        | Command                                                            |
| --------------------------- | ------------------------------------------------------------------ |
| Type-check                  | `npm run type-check:api` (from repo root)                          |
| Tests                       | `npm run test:api`                                                 |
| Lint + format check         | `npm run lint:api`                                                 |
| Type-check only             | `cd apps/api && uv run pyright`                                    |
| Tests only                  | `cd apps/api && uv run pytest`                                     |
| Lint only                   | `cd apps/api && uv run ruff check .`                               |
| Format check only           | `cd apps/api && uv run ruff format --check .`                      |
| Auto-fix locally (optional) | `cd apps/api && uv run ruff check --fix . && uv run ruff format .` |
| Install deps                | `cd apps/api && uv sync`                                           |
| Run API                     | `cd apps/api && uv run uvicorn main:app --reload --port 8000`      |

## Config files

| File                         | Purpose                                  |
| ---------------------------- | ---------------------------------------- |
| `apps/api/pyproject.toml`    | Deps, Ruff, pytest, pyright config       |
| `apps/api/uv.lock`           | Locked transitive deps (commit this)     |
| `apps/api/.python-version`   | Python 3.12                              |
| `apps/api/tests/conftest.py` | pytest setup (env vars)                  |
| `package.json` (root)        | `type-check:api`, `test:api`, `lint:api` |
| `.husky/pre-push`            | Runs API checks on push                  |
