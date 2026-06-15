# Lint & format

**Index:** [../TOOLING-WEB.md](../TOOLING-WEB.md)

## lint-staged

Runs on **staged files** at commit time (root `package.json`).

| Glob                                | Actions                       |
| ----------------------------------- | ----------------------------- |
| `apps/web/**/*.{js,jsx,ts,tsx,mjs}` | ESLint `--fix`, then Prettier |
| `apps/web/**/*.{json,css,md}`       | Prettier                      |
| `package.json`                      | Prettier                      |
| `commitlint.config.{js,ts,mjs,cjs}` | Prettier                      |
| `docs/**/*.md`                      | Prettier                      |

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
cd apps/web && npm run format        # write
cd apps/web && npm run format:check  # check only
```
