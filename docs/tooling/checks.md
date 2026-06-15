# Checks (type-check, test, Knip)

**Index:** [../TOOLING-WEB.md](../TOOLING-WEB.md)

Run on **pre-push** in this order: type-check → test → knip.

## TypeScript

Config: `apps/web/tsconfig.json` (`strict: true`)

ESLint does not replace `tsc` — type errors are caught here.

```bash
npm run type-check          # from root
cd apps/web && npm run type-check
```

## Vitest

Config: `apps/web/vitest.config.ts`

- Environment: `node`
- Pattern: `**/*.{test,spec}.{ts,tsx}`
- Example: `lib/counter.test.ts`

```bash
npm run test                # from root
cd apps/web && npm run test:watch
```

## Knip

Config: `apps/web/knip.json` — finds unused files, deps, exports.

Plugins: `next`, `vitest` (test files treated as entry points).

```bash
npm run knip                # from root
cd apps/web && npm run knip:fix
```
