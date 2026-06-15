# API tooling

Developer tooling for `apps/api`. Managed with **uv** — not part of npm workspaces.

**Previous:** [apps/api/README.md](../apps/api/README.md)  
**Index:** [docs/README.md](./README.md)

## Hook flow

```
commit  → lint-staged (ruff check + format --check, no auto-fix)
push    → lint:api (after web checks)
```

Web hooks (ESLint, Vitest, etc.): [TOOLING-WEB.md](./TOOLING-WEB.md)

## Topics

| Topic                            | Doc                                                  |
| -------------------------------- | ---------------------------------------------------- |
| Ruff config + rules              | [tooling-api/ruff.md](./tooling-api/ruff.md)         |
| Git hooks (pre-commit, pre-push) | [tooling-api/hooks.md](./tooling-api/hooks.md)       |
| Commands + config files          | [tooling-api/commands.md](./tooling-api/commands.md) |

## Web vs API

|                 | Web                      | API                      |
| --------------- | ------------------------ | ------------------------ |
| Package manager | npm (workspaces)         | uv                       |
| Lint            | ESLint                   | `ruff check`             |
| Format          | Prettier                 | `ruff format`            |
| On commit       | lint-staged (check only) | lint-staged (check only) |
| On push         | type-check, test, knip   | `lint:api`               |
