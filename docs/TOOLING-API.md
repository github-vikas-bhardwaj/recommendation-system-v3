# API tooling

Developer tooling for `apps/api`. Managed with **uv** — not part of npm workspaces.

**Previous:** [apps/api/README.md](../apps/api/README.md)  
**Index:** [docs/README.md](./README.md)

## Hook flow

```
commit  → lint-staged (ruff check --fix + format)
push    → type-check:api → test:api → lint:api (with web checks)
```

Web hooks: [TOOLING-WEB.md](./TOOLING-WEB.md)

## Topics

| Topic                   | Doc                                                  |
| ----------------------- | ---------------------------------------------------- |
| Ruff (lint + format)    | [tooling-api/ruff.md](./tooling-api/ruff.md)         |
| pytest (tests)          | [tooling-api/pytest.md](./tooling-api/pytest.md)     |
| pyright (type-check)    | [tooling-api/pyright.md](./tooling-api/pyright.md)   |
| Git hooks               | [tooling-api/hooks.md](./tooling-api/hooks.md)       |
| Commands + config files | [tooling-api/commands.md](./tooling-api/commands.md) |

## Web vs API

|                 | Web                    | API                                |
| --------------- | ---------------------- | ---------------------------------- |
| Package manager | npm (workspaces)       | uv                                 |
| Lint            | ESLint                 | `ruff check`                       |
| Format          | Prettier               | `ruff format`                      |
| Type-check      | `tsc --noEmit`         | pyright                            |
| Tests           | Vitest                 | pytest                             |
| On commit       | lint-staged (auto-fix) | lint-staged (Ruff auto-fix)        |
| On push         | type-check, test, knip | type-check:api, test:api, lint:api |
