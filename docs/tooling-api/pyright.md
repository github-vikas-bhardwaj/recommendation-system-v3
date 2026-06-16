# pyright

**Index:** [../TOOLING-API.md](../TOOLING-API.md)

[pyright](https://github.com/microsoft/pyright) = static type checker for Python (like `tsc --noEmit` on web).

## Install

```bash
cd apps/api
uv add --dev pyright
```

## Config

File: `apps/api/pyproject.toml`

```toml
[tool.pyright]
include = ["chains", "main.py", "tests"]
exclude = [".venv", "**/__pycache__"]
pythonVersion = "3.12"
typeCheckingMode = "basic"
venvPath = "."
venv = ".venv"
```

| Setting                      | Purpose                                           |
| ---------------------------- | ------------------------------------------------- |
| `include`                    | Files to type-check                               |
| `typeCheckingMode = "basic"` | Starter strictness — increase later if needed     |
| `venv`                       | Use `apps/api/.venv` so third-party types resolve |

## What it catches (Ruff does not)

| Example                                         | Issue                                 |
| ----------------------------------------------- | ------------------------------------- |
| `os.getenv("X")` passed where `str` is required | `str \| None` not assignable to `str` |
| Wrong function argument types                   | `reportArgumentType`                  |
| Missing attributes on objects                   | Type errors before runtime            |

**Fix example** — use defaults so type is always `str`:

```python
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
```

## Commands

| Task           | Command                         |
| -------------- | ------------------------------- |
| Type-check     | `cd apps/api && uv run pyright` |
| From repo root | `npm run type-check:api`        |

## When it runs

**pre-push only** — not on pre-commit (same as web `tsc`).

```
npm run type-check:api
```

Runs right after `npm run type-check` (web). See [hooks.md](./hooks.md).

## Web vs API

|             | Web                  | API                                  |
| ----------- | -------------------- | ------------------------------------ |
| Tool        | TypeScript (`tsc`)   | pyright                              |
| Config      | `tsconfig.json`      | `[tool.pyright]` in `pyproject.toml` |
| Root script | `npm run type-check` | `npm run type-check:api`             |

## Ruff vs pyright

| Tool    | Role                                        |
| ------- | ------------------------------------------- |
| Ruff    | Lint + format (style, imports, unused vars) |
| pyright | Types (`None` vs `str`, bad args, etc.)     |

Both run on pre-push.
