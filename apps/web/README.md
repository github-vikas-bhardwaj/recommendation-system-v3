# Web app (`apps/web`)

Next.js: **UI**, **BFF proxy** to the API, **auth** (planned).

**Previous:** [docs/GETTING-STARTED.md](../../docs/GETTING-STARTED.md)  
**Next:** [docs/TOOLING-WEB.md](../../docs/TOOLING-WEB.md)  
**Index:** [docs/README.md](../../docs/README.md)

## Role

```
Browser → Next.js (:3000) → FastAPI (:8000)
```

- UI at http://localhost:3000
- BFF: `POST /api/recommend` → `POST /recommend/invoke`
- `AI_API_URL` never exposed to the browser

## Setup

```bash
nvm use && npm install    # from repo root
cp .env.example .env.local
npm run dev -w web
```

| Variable     | Purpose                                    |
| ------------ | ------------------------------------------ |
| `AI_API_URL` | FastAPI URL (e.g. `http://localhost:8000`) |

## Key files

| Path                         | Purpose                  |
| ---------------------------- | ------------------------ |
| `app/page.tsx`               | Test UI                  |
| `app/api/recommend/route.ts` | BFF proxy                |
| `lib/`                       | Shared utilities + tests |

## Scripts

| Script            | Use               |
| ----------------- | ----------------- |
| `dev`             | Local development |
| `build` / `start` | Production        |
| `lint`            | ESLint            |
| `type-check`      | `tsc --noEmit`    |
| `test`            | Vitest            |
| `format`          | Prettier          |
| `knip`            | Unused code scan  |

Tooling details: [docs/TOOLING-WEB.md](../../docs/TOOLING-WEB.md)
