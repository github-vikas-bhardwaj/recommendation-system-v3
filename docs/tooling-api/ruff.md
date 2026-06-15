# Ruff

**Index:** [../TOOLING-API.md](../TOOLING-API.md)

[Ruff](https://docs.astral.sh/ruff/) = lint + format for Python (like ESLint + Prettier for web).

## Install

```bash
cd apps/api
uv add --dev ruff
```

## Config

File: `apps/api/pyproject.toml`

| Setting             | Value                           |
| ------------------- | ------------------------------- |
| `target-version`    | `py312`                         |
| `line-length`       | `100` (matches Prettier on web) |
| `select`            | `E`, `F`, `I`, `UP`, `B`        |
| `known-first-party` | `chains` (import sorting)       |

### Rule groups

| Code | Purpose                                  |
| ---- | ---------------------------------------- |
| `E`  | Style (includes E501 line length)        |
| `F`  | Errors (unused imports, undefined names) |
| `I`  | Import sorting                           |
| `UP` | Modern Python syntax                     |
| `B`  | Common bug patterns                      |

## Check-only policy

Hooks **do not** auto-fix. Devs fix issues manually in the editor.

| Command                 | Used by               | Auto-fixes? |
| ----------------------- | --------------------- | ----------- |
| `ruff check .`          | hooks                 | No          |
| `ruff format --check .` | hooks                 | No          |
| `ruff check --fix .`    | local only (optional) | Yes         |
| `ruff format .`         | local only (optional) | Yes         |

## Common errors

| Code | Meaning          | Fix                       |
| ---- | ---------------- | ------------------------- |
| E501 | Line > 100 chars | Split string across lines |
| F401 | Unused import    | Remove the import         |
| I001 | Import order     | Reorder imports           |

Example — split a long prompt string:

```python
(
    "I have watched {input} and I like it. Please recommend me some "
    "movies & shows that are similar to {input}."
)
```

No comma between strings — Python joins them into one.
