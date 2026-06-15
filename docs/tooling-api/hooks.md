# Git hooks (API)

**Index:** [../TOOLING-API.md](../TOOLING-API.md)

API lint runs via root Husky hooks (same as web). Config in root `package.json`.

## pre-commit

When any `apps/api/**/*.py` file is staged, lint-staged runs:

```bash
uv run --directory apps/api ruff check .
uv run --directory apps/api ruff format --check .
```

- Checks the **whole** `apps/api` folder (not just staged lines)
- **Blocks** the commit on failure
- **Does not** auto-fix

## pre-push

After web checks, `.husky/pre-push` runs:

```bash
npm run lint:api
```

Full pre-push order:

```
type-check → test → knip → lint:api
```

## Manual fix workflow

```bash
# 1. See issues
npm run lint:api

# 2. Fix in your editor

# 3. Verify
npm run lint:api

# 4. Commit
git add apps/api/
git commit -m "fix(api): ..."
```

Optional local auto-fix (not in hooks):

```bash
cd apps/api
uv run ruff check --fix .
uv run ruff format .
```
