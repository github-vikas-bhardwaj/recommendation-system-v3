# Git hooks (API)

**Index:** [../TOOLING-API.md](../TOOLING-API.md)

API lint runs via root Husky hooks (same as web). Config in root `package.json`.

## pre-commit

When any `apps/api/**/*.py` file is staged, lint-staged runs:

```bash
uv run --directory apps/api ruff check --fix .
uv run --directory apps/api ruff format .
```

Auto-fixes on commit:

| Issue            | Tool               |
| ---------------- | ------------------ |
| Indentation      | `ruff format`      |
| Trailing newline | `ruff format`      |
| Import order     | `ruff check --fix` |
| Unused imports   | `ruff check --fix` |

**E501** (line > 100 chars) is **not** auto-fixed — split strings manually.

Checks the **whole** `apps/api` folder when any `.py` file is staged.

## pre-push

After web checks, `.husky/pre-push` runs:

```bash
npm run lint:api
```

Check-only (no writes):

```bash
ruff check .
ruff format --check .
```

Full pre-push order:

```
type-check → test → test:api → knip → lint:api
```

## Workflow

```bash
git add apps/api/
git commit -m "feat(api): ..."   # auto-fixes style, re-stage if needed
git push                         # check-only gate
```

If pre-commit reformats files, review the diff and commit again if new changes appear.
