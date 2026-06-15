# Node version & workspaces

**Index:** [../TOOLING-WEB.md](../TOOLING-WEB.md)

## Node 22.22.1

| File                            | Role                                    |
| ------------------------------- | --------------------------------------- |
| `.nvmrc`                        | Tells nvm which Node to use (`nvm use`) |
| `package.json` → `engines.node` | Declares required Node version          |
| `.npmrc` → `engine-strict=true` | Blocks `npm install` on wrong Node      |

```bash
nvm use          # switch to 22.22.1
node -v          # v22.22.1
npm install      # from repo root
```

`.nvmrc` does not auto-switch on `cd` unless you add a shell hook.

## npm workspaces

Root `package.json`: `"workspaces": ["apps/web"]`

- Run `npm install` once at the repo root.
- Python (`apps/api`) uses **uv** separately.

| Root script          | Delegates to                |
| -------------------- | --------------------------- |
| `npm run type-check` | `apps/web` → `tsc --noEmit` |
| `npm run test`       | `apps/web` → `vitest run`   |
| `npm run knip`       | `apps/web` → `knip`         |
