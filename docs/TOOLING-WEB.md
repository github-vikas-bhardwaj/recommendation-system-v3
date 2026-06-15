# Web tooling

Developer tooling for `apps/web` and the root monorepo.

**Previous:** [apps/web/README.md](../apps/web/README.md)  
**Index:** [docs/README.md](./README.md)

## Hook flow

```
commit  → branch check → lint-staged (check only — no auto-fix)
commit  → commitlint
push    → type-check → test → knip
```

## Topics

| Topic                         | Doc                                                  |
| ----------------------------- | ---------------------------------------------------- |
| Node version + workspaces     | [tooling/node-version.md](./tooling/node-version.md) |
| Git hooks, branches, commits  | [tooling/git-workflow.md](./tooling/git-workflow.md) |
| ESLint, Prettier, lint-staged | [tooling/lint-format.md](./tooling/lint-format.md)   |
| Type-check, tests, Knip       | [tooling/checks.md](./tooling/checks.md)             |
| Commands + config files       | [tooling/commands.md](./tooling/commands.md)         |

API tooling: [TOOLING-API.md](./TOOLING-API.md)
