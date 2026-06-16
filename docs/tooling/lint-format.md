# Lint & format

**Index:** [../TOOLING-WEB.md](../TOOLING-WEB.md)

On **pre-commit**, style issues are **auto-fixed** where the tool supports it. Devs review staged changes before committing.

## lint-staged

Runs on **staged files** at commit time (root `package.json`).

| Glob                                | Actions                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `apps/web/**/*.{js,jsx,ts,tsx,mjs}` | ESLint `--fix`, Prettier `--write`                                      |
| `apps/web/**/*.{json,css,md}`       | Prettier `--write`                                                      |
| `apps/api/**/*.py`                  | Ruff `check --fix` + `format` — see [TOOLING-API.md](../TOOLING-API.md) |
| `package.json`                      | Prettier `--write`                                                      |
| `commitlint.config.{js,ts,mjs,cjs}` | Prettier `--write`                                                      |
| `docs/**/*.md`                      | Prettier `--write`                                                      |

## Auto-fixed on commit

| Issue              | Web                         | API                             |
| ------------------ | --------------------------- | ------------------------------- |
| Indentation        | Prettier                    | Ruff format                     |
| Trailing newline   | Prettier                    | Ruff format                     |
| Import order       | ESLint `--fix`              | Ruff `check --fix`              |
| Unused imports     | ESLint `--fix`              | Ruff `check --fix`              |
| Line length (E501) | Prettier (when it can wrap) | **Manual** — split long strings |

**E501** in Python (long prompt strings) cannot be auto-fixed — split across lines by hand.

## ESLint

Config: `apps/web/eslint.config.mjs`

```bash
cd apps/web && npm run lint
cd apps/web && npm run format
```

## Pre-push

pre-commit **fixes** style; pre-push **checks** only (`lint:api`, `npm run lint`, etc.).
