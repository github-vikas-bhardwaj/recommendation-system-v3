# Git hooks (API)

**Index:** [../TOOLING-API.md](../TOOLING-API.md)

API checks run via root Husky hooks (same as web). Config in root `package.json`.

## pre-commit

When any `apps/api/**/*.py` file is staged, lint-staged runs:

```bash
uv run --directory apps/api ruff check --fix .
uv run --directory apps/api ruff format .
```

Auto-fixes on commit: indentation, newlines, import order, unused imports.

**E501** (line > 100 chars) is **not** auto-fixed — split strings manually.

## pre-push

API scripts (after web `type-check`):

```bash
npm run type-check:api   # pyright
npm run test:api         # pytest
npm run lint:api         # ruff check + format --check
```

Full pre-push order (web + API):

```
type-check → type-check:api → test → test:api → knip → lint:api
```

All check-only on push — no auto-fix.

## Workflow

```bash
git add apps/api/
git commit -m "feat(api): ..."   # Ruff auto-fixes style
git push                         # pyright, pytest, ruff check
```

If pre-commit reformats files, review the diff and commit again.
