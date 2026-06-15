# Lint & format

**Index:** [../TOOLING-WEB.md](../TOOLING-WEB.md)

Hooks are **check-only** — they block the commit but do not auto-fix. Devs fix issues manually.

## lint-staged

Runs on **staged files** at commit time (root `package.json`).

| Glob                                | Actions                                                                      |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| `apps/web/**/*.{js,jsx,ts,tsx,mjs}` | ESLint (check), Prettier `--check`                                           |
| `apps/web/**/*.{json,css,md}`       | Prettier `--check`                                                           |
| `apps/api/**/*.py`                  | Ruff check + `ruff format --check` — see [TOOLING-API.md](../TOOLING-API.md) |
| `package.json`                      | Prettier `--check`                                                           |
| `commitlint.config.{js,ts,mjs,cjs}` | Prettier `--check`                                                           |
| `docs/**/*.md`                      | Prettier `--check`                                                           |

## ESLint

Config: `apps/web/eslint.config.mjs`

| Piece                       | Purpose                                  |
| --------------------------- | ---------------------------------------- |
| `eslint-config-next`        | Next.js + TypeScript rules               |
| `eslint-plugin-react-hooks` | Hooks rules                              |
| `eslint-config-prettier`    | No conflict with Prettier                |
| `no-console`                | Blocks log/debug/info; allows warn/error |

`settings.next.rootDir: "apps/web"` — fixes monorepo ESLint path issues.

```bash
cd apps/web && npm run lint
```

## Prettier

Single config at repo root: `.prettierrc` + `.prettierignore`

```bash
cd apps/web && npm run format:check  # check (used by hooks)
cd apps/web && npm run format        # fix locally (optional)
```

## Manual fix workflow

```bash
# 1. See issues
cd apps/web && npm run lint && npm run format:check

# 2. Fix in your editor (or run format/lint --fix locally)

# 3. Commit again
```
