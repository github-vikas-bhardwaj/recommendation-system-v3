# Git workflow

**Index:** [../TOOLING-WEB.md](../TOOLING-WEB.md)

## Husky hooks

Installed via `"prepare": "husky"`. Hooks in `.husky/`.

| Hook         | Runs                                |
| ------------ | ----------------------------------- |
| `pre-commit` | Branch check → lint-staged          |
| `commit-msg` | commitlint                          |
| `pre-push`   | type-check → test → knip → lint:api |

## Branch naming

Script: `.husky/validate-branch-name.sh`

**Blocked:** `main`, `master`, `develop`, `staging`, `release/next`

**Allowed work branches:**

```
<type>/<kebab-case-description>
```

Types: `feat`, `fix`, `refactor`, `tests`, `chore`, `docs`, `ci`, `hotfix`, `perf`, `revert`

**Allowed release branches:** `release/x.y.z` (e.g. `release/0.0.3`)

Examples: `feat/add-recommendations`, `fix/handle-timeout`

## Commitlint

Config: `commitlint.config.ts`

- Conventional commits
- Scopes: `web`, `api`, `root`, `deps`, `ci`, `docs`
- Header max length: 300

```
<type>(<scope>): <subject>
```

Examples:

```
feat(web): add form validation
fix(api): handle Ollama timeout
chore(root): pin Node 22.22.1
```
