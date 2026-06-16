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

## Auto-fix policy

| When       | Command                              | Behavior                                                |
| ---------- | ------------------------------------ | ------------------------------------------------------- |
| pre-commit | `ruff check --fix` + `ruff format`   | Auto-fix imports, unused imports, indentation, newlines |
| pre-push   | `ruff check` + `ruff format --check` | Check only                                              |

### Auto-fixed

- Indentation (`ruff format`)
- Trailing newline (`ruff format`)
- Import order (`ruff check --fix`)
- Unused imports (`ruff check --fix`)

### Manual only

**E501** — line longer than 100 chars (common in prompt strings):

```python
(
    "I have watched {input} and I like it. Please recommend me some "
    "movies & shows that are similar to {input}."
)
```

No comma between strings — Python joins them into one.
