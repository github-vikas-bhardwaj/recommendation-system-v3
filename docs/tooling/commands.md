# Commands & config files

**Index:** [../TOOLING-WEB.md](../TOOLING-WEB.md)

## Commands

Run from **repo root** unless noted.

| Task            | Command                             |
| --------------- | ----------------------------------- |
| Switch Node     | `nvm use`                           |
| Install deps    | `npm install`                       |
| Dev server      | `npm run dev -w web`                |
| Lint            | `cd apps/web && npm run lint`       |
| Format          | `cd apps/web && npm run format`     |
| Type-check      | `npm run type-check`                |
| Test            | `npm run test`                      |
| Test (watch)    | `cd apps/web && npm run test:watch` |
| Knip            | `npm run knip`                      |
| Validate branch | `npm run validate:branch`           |

## Config files

| File                             | Purpose                          |
| -------------------------------- | -------------------------------- |
| `.nvmrc`                         | Node version for nvm             |
| `.npmrc`                         | `engine-strict=true`             |
| `package.json` (root)            | workspaces, engines, lint-staged |
| `apps/web/package.json`          | App scripts and deps             |
| `.husky/pre-commit`              | Branch check + lint-staged       |
| `.husky/commit-msg`              | commitlint                       |
| `.husky/pre-push`                | type-check, test, knip           |
| `.husky/validate-branch-name.sh` | Branch rules                     |
| `commitlint.config.ts`           | Commit message rules             |
| `.prettierrc`                    | Prettier options                 |
| `apps/web/eslint.config.mjs`     | ESLint config                    |
| `apps/web/tsconfig.json`         | TypeScript config                |
| `apps/web/vitest.config.ts`      | Vitest config                    |
| `apps/web/knip.json`             | Knip config                      |
