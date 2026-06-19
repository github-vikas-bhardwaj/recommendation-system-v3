# Auth flow — technical reference

End-to-end guide to authentication in `apps/web`. Use this document to trace every request through the codebase.

**UI companion:** [https://localhost:3000/auth-flow](http://localhost:3000/auth-flow) (run `npm run dev:https -w web` for Secure cookies)

**Previous:** [ARCHITECTURE.md](./ARCHITECTURE.md)  
**Index:** [docs/README.md](./README.md)

---

## 1. Architecture at a glance

```
Browser
  │  httpOnly cookies: access_token (JWT), refresh_token (opaque)
  ▼
Next.js BFF (apps/web)
  │  Proxy:         proxy.ts — expired access → GET /api/auth/refresh
  │  Server Actions: signup, signin, signout
  │  API Routes:    GET /api/auth/refresh, POST /api/recommend
  │  Pages:         /signup, /signin, /recommend (session guards)
  ▼
PostgreSQL
  │  users, refresh_tokens
  ▼
FastAPI (apps/api) — only reached after BFF auth
  │  Header: X-User-Id (set by BFF, not by browser)
  ▼
LangServe /recommend/invoke
```

### Transport layer decision

| Feature            | Transport                               | Why                                                 |
| ------------------ | --------------------------------------- | --------------------------------------------------- |
| Signup form        | **Server Action**                       | Form + `useActionState`, field errors               |
| Signin form        | **Server Action**                       | Same                                                |
| Sign out (header)  | **Server Action**                       | Form submit in `Header`                             |
| Current user check | **`getSessionUser()`**                  | Server components (Header, pages) — read-only       |
| Auto token refresh | **Proxy** + **GET** `/api/auth/refresh` | Cookie writes only in route handlers (Next.js rule) |
| Recommendations    | **API** `POST /api/recommend`           | BFF proxy; `requireAuth` may refresh + set cookies  |

There are **no** `POST /api/auth/signup` or `POST /api/auth/signin` routes — removed in favour of server actions.

---

## 2. File map (all auth-related paths)

### Session core (`apps/web/lib/auth/session/`)

| File                     | Role                                                                |
| ------------------------ | ------------------------------------------------------------------- |
| `session.types.ts`       | `SessionUser`, `SessionTokens`, `IssuedSession` types               |
| `jwt.ts`                 | Sign access JWT (HS256, `jose`)                                     |
| `verify-access-token.ts` | Verify access JWT (shared by proxy + server code)                   |
| `refresh-token.ts`       | Generate opaque refresh token, SHA-256 hash                         |
| `token-expiry.ts`        | Parse `JWT_*_EXPIRES_IN` env strings to seconds                     |
| `session.server.ts`      | `createSession`, `refreshSession`, `revokeSession`                  |
| `resolve-session.ts`     | `resolveSession()` — try access, else refresh, else unauthenticated |
| `cookies.ts`             | Cookie names, set/clear (route handlers + server actions)           |
| `cookie-names.ts`        | Cookie name constants (safe for proxy import)                       |
| `get-session.ts`         | `getSessionUser()` — read-only access JWT check for pages/Header    |
| `require-auth.ts`        | `requireAuth(req)` — resolve session for API route handlers         |

### Proxy

| File                | Role                                                                                |
| ------------------- | ----------------------------------------------------------------------------------- |
| `apps/web/proxy.ts` | On page navigation: if access expired but refresh valid → redirect to refresh route |

### Signup (`apps/web/lib/auth/signup/`)

| File               | Role                                           |
| ------------------ | ---------------------------------------------- |
| `signup.schema.ts` | Zod validation (password rules, confirm match) |
| `signup.server.ts` | `createUser()` — bcrypt hash, DB insert        |
| `signup.types.ts`  | `SignupResponse` type                          |

### Signin (`apps/web/lib/auth/signin/`)

| File               | Role                                           |
| ------------------ | ---------------------------------------------- |
| `signin.schema.ts` | Zod validation (email + password)              |
| `signin.server.ts` | `authenticateUser()` — lookup + bcrypt compare |
| `signin.types.ts`  | `SigninResponse` type                          |

### Shared DB helpers

| File                                            | Role                                      |
| ----------------------------------------------- | ----------------------------------------- |
| `apps/web/lib/auth/db-errors.ts`                | `isUniqueViolation()` for duplicate email |
| `apps/web/lib/db/schema.ts`                     | `users`, `refresh_tokens` tables          |
| `apps/web/lib/db/index.ts`                      | Drizzle client (`DATABASE_URL`)           |
| `apps/web/drizzle/0000_create_users.sql`        | Users migration                           |
| `apps/web/drizzle/0001_clever_robin_chapel.sql` | Refresh tokens migration                  |

### UI — signup route group

| File                                                      | Role                                |
| --------------------------------------------------------- | ----------------------------------- |
| `app/(auth)/signup/page.tsx`                              | Server page; redirects if logged in |
| `app/(auth)/signup/_components/SignupForm.tsx`            | Client form + `useActionState`      |
| `app/(auth)/signup/_components/SignupPromoPanel.tsx`      | Left promo panel                    |
| `app/(auth)/signup/signup-content.ts`                     | Copy + field labels                 |
| `app/(auth)/signup/actions/signup/signup.action.ts`       | `"use server"` signup handler       |
| `app/(auth)/signup/actions/signup/signup.action.types.ts` | Action state type                   |

### UI — signin route group

| File                                                      | Role                                |
| --------------------------------------------------------- | ----------------------------------- |
| `app/(auth)/signin/page.tsx`                              | Server page; redirects if logged in |
| `app/(auth)/signin/_components/SigninForm.tsx`            | Client form + `useActionState`      |
| `app/(auth)/signin/_components/SigninPromoPanel.tsx`      | Left promo panel                    |
| `app/(auth)/signin/signin-content.ts`                     | Copy + field labels                 |
| `app/(auth)/signin/actions/signin/signin.action.ts`       | `"use server"` signin handler       |
| `app/(auth)/signin/actions/signin/signin.action.types.ts` | Action state type                   |

### Sign out

| File                                    | Role                                          |
| --------------------------------------- | --------------------------------------------- |
| `app/actions/signout/signout.action.ts` | Revoke refresh + clear cookies + redirect `/` |

### API routes

| File                            | Route                                 |
| ------------------------------- | ------------------------------------- |
| `app/api/auth/refresh/route.ts` | `GET /api/auth/refresh`               |
| `app/api/recommend/route.ts`    | `POST /api/recommend` (protected BFF) |

### Layout & protected pages

| File                                           | Role                                 |
| ---------------------------------------------- | ------------------------------------ |
| `app/layout.tsx`                               | Renders global `Header`              |
| `components/header/Header.tsx`                 | Auth-aware nav; signout form         |
| `components/auth/AuthSplitLayout.tsx`          | Shared signup/signin layout          |
| `app/recommend/page.tsx`                       | Server guard → `getSessionUser()`    |
| `app/recommend/_components/RecommendPanel.tsx` | Client UI; `fetch('/api/recommend')` |

### Config

| File                    | Role                                                        |
| ----------------------- | ----------------------------------------------------------- |
| `apps/web/.env.example` | `JWT_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `DATABASE_URL`, etc. |

### Tests (follow implementation)

| File                                                     | Covers                |
| -------------------------------------------------------- | --------------------- |
| `lib/auth/session/jwt.test.ts`                           | JWT sign/verify       |
| `lib/auth/session/token-expiry.test.ts`                  | Duration parsing      |
| `lib/auth/session/resolve-session.test.ts`               | Session resolution    |
| `lib/auth/session/refresh-token.test.ts`                 | Hashing               |
| `lib/auth/session/session.server.test.ts`                | create/refresh/revoke |
| `lib/auth/session/require-auth.test.ts`                  | API auth gate         |
| `lib/auth/signup/signup.schema.test.ts`                  | Validation            |
| `lib/auth/signup/signup.server.test.ts`                  | createUser            |
| `lib/auth/signin/signin.schema.test.ts`                  | Validation            |
| `lib/auth/signin/signin.server.test.ts`                  | authenticateUser      |
| `app/(auth)/signup/actions/signup/signup.action.test.ts` | Signup action         |
| `app/(auth)/signin/actions/signin/signin.action.test.ts` | Signin action         |
| `app/actions/signout/signout.action.test.ts`             | Signout action        |
| `app/api/auth/refresh/route.test.ts`                     | Refresh endpoint      |
| `app/api/recommend/route.test.ts`                        | Protected BFF         |

---

## 3. Session model

### Two tokens

| Cookie          | Value            | Stored in DB?      | Lifetime                                                                     | Used for                |
| --------------- | ---------------- | ------------------ | ---------------------------------------------------------------------------- | ----------------------- |
| `access_token`  | JWT (HS256)      | No                 | `JWT_ACCESS_EXPIRES_IN` (default `15m`)                                      | Every auth check        |
| `refresh_token` | Random base64url | Yes (SHA-256 hash) | Absolute session end = access TTL + refresh grace (`JWT_REFRESH_EXPIRES_IN`) | Refresh + rotation only |

On **rotation**, the new refresh token keeps the **original absolute `expires_at`** from sign-in (session does not extend indefinitely).

### JWT payload (`lib/auth/session/jwt.ts`)

- Algorithm: **HS256**
- Secret: `JWT_SECRET` env var
- Claims: `sub` = user UUID, `type` = `"access"`, `iat`, `exp`
- Never returned in JSON responses — cookies only

### Refresh token (`lib/auth/session/refresh-token.ts`)

- Generated: `randomBytes(32).toString("base64url")`
- Stored: `SHA-256(plainToken)` in `refresh_tokens.token_hash`
- Plain token only ever lives in the httpOnly cookie

### Cookie options (`lib/auth/session/cookies.ts`)

```
httpOnly: true
sameSite: "lax"
path: "/"
secure: true when NODE_ENV=production OR COOKIE_SECURE=true
maxAge: access from JWT_ACCESS_EXPIRES_IN; refresh from remaining session time
```

Use `npm run dev:https -w web` locally so `COOKIE_SECURE=true` and Secure cookies work.

### Database (`lib/db/schema.ts`)

**`users`**

- `id`, `first_name`, `last_name`, `email` (unique), `password_hash`, timestamps

**`refresh_tokens`**

- `id`, `user_id` → users, `token_hash` (unique), `expires_at`, `revoked_at`, `created_at`
- Rotation: old row gets `revoked_at` set; new row inserted on refresh (same absolute `expires_at`)

---

## 4. Flow 1 — Signup (auto-login)

**URL:** `/signup`  
**Transport:** Server Action  
**Outcome:** User created + session cookies set + redirect `/recommend`

### Call chain

```
1. Browser POST (form) ─────────────────────────────────────────────
   app/(auth)/signup/_components/SignupForm.tsx
     useActionState(signupAction, ...)
     form action={formAction}

2. Server Action ─────────────────────────────────────────────────
   app/(auth)/signup/actions/signup/signup.action.ts
     signupAction(_prevState, formData)
       ├─ Parse FormData fields
       ├─ lib/auth/signup/signup.schema.ts → signupSchema.safeParse()
       │    (on fail → return fieldErrors to form)
       ├─ lib/auth/signup/signup.server.ts → createUser()
       │    ├─ bcrypt.hash(password, 12)
       │    ├─ lib/db/index.ts → insert into users
       │    └─ lib/auth/db-errors.ts → duplicate email → SignupConflictError
       ├─ lib/auth/session/session.server.ts → createSession(user.id)
       │    ├─ lib/auth/session/refresh-token.ts → generate + hash
       │    ├─ insert refresh_tokens row (expires_at = access + refresh grace)
       │    └─ lib/auth/session/jwt.ts → signAccessToken(userId)
       ├─ lib/auth/session/cookies.ts → setSessionCookiesInStore(tokens, refreshExpiresAt)
       └─ redirect("/recommend")

3. Page guard (before form shown) ─────────────────────────────────
   app/(auth)/signup/page.tsx
     getSessionUser() → if user exists, redirect("/recommend")
     lib/auth/session/get-session.ts
```

### Key files to read in order

1. `SignupForm.tsx` — UI entry
2. `signup.action.ts` — orchestration
3. `signup.schema.ts` — validation rules
4. `signup.server.ts` — persistence
5. `session.server.ts` → `createSession`
6. `cookies.ts` → `setSessionCookiesInStore`

---

## 5. Flow 2 — Signin

**URL:** `/signin`  
**Transport:** Server Action  
**Outcome:** Session cookies set + redirect `/recommend`

### Call chain

```
1. Browser POST (form) ─────────────────────────────────────────────
   app/(auth)/signin/_components/SigninForm.tsx
     useActionState(signinAction, ...)

2. Server Action ─────────────────────────────────────────────────
   app/(auth)/signin/actions/signin/signin.action.ts
     signinAction(_prevState, formData)
       ├─ lib/auth/signin/signin.schema.ts → signinSchema.safeParse()
       ├─ lib/auth/signin/signin.server.ts → authenticateUser()
       │    ├─ SELECT user by email
       │    ├─ bcrypt.compare(password, passwordHash)
       │    └─ SigninInvalidCredentialsError (generic message)
       ├─ session.server.ts → createSession(user.id)
       ├─ cookies.ts → setSessionCookiesInStore(tokens, refreshExpiresAt)
       └─ redirect("/recommend")

3. Page guard ────────────────────────────────────────────────────
   app/(auth)/signin/page.tsx
     getSessionUser() → redirect if already logged in
```

### Key files to read in order

1. `SigninForm.tsx`
2. `signin.action.ts`
3. `signin.schema.ts`
4. `signin.server.ts`
5. `session.server.ts` → `createSession`
6. `cookies.ts`

---

## 6. Flow 3 — Session read (pages & header)

**No HTTP round-trip** — server components read cookies directly. **Read-only** (no cookie writes).

### `getSessionUser()` — `lib/auth/session/get-session.ts`

```
cookies().get("access_token")
  → jwt.ts verifyAccessToken()
  → SELECT user from users WHERE id = sub
  → return SessionUser | null
```

**Used by:**

| File                           | Behaviour                          |
| ------------------------------ | ---------------------------------- |
| `components/header/Header.tsx` | Show Sign up / Sign in vs Sign out |
| `app/(auth)/signup/page.tsx`   | Redirect if logged in              |
| `app/(auth)/signin/page.tsx`   | Redirect if logged in              |
| `app/recommend/page.tsx`       | Redirect to `/signup` if null      |

**Important:** `getSessionUser()` does **not** refresh tokens or write cookies. By the time a page renders, `proxy.ts` should have already refreshed expired access tokens (see Flow 4). If both tokens are dead, it returns `null`.

---

## 7. Flow 4 — Auto-refresh (proxy + GET /api/auth/refresh)

**When:** User navigates or refreshes a page while access JWT is expired but refresh cookie is still valid  
**Trigger:** Page load / navigation (not polling)

### Why proxy + route handler?

Next.js only allows cookie writes in **Route Handlers**, **Server Actions**, or **Proxy** — not in Server Components. `getSessionUser()` cannot call `cookies().set()`.

### Call chain

```
1. Browser GET /recommend (access JWT expired, refresh cookie valid)
   ▼
2. apps/web/proxy.ts
     proxy(request)
       ├─ refresh_token cookie present?
       ├─ access_token missing or verifyAccessToken() fails?
       └─ redirect → /api/auth/refresh?redirect=/recommend

3. app/api/auth/refresh/route.ts
     GET(req)
       ├─ resolve-session.ts → resolveSession(access, refresh)
       │    ├─ access valid → refreshed: false
       │    ├─ access expired + refresh valid → refreshSession() → refreshed: true
       │    └─ refresh expired/invalid → unauthenticated, cleared: true
       ├─ refreshed → setSessionCookies(response, tokens) + redirect /recommend
       └─ unauthenticated → clearSessionCookies(response) + redirect /signin

4. Browser GET /recommend (new access_token cookie)
   ▼
5. proxy.ts → access valid → NextResponse.next()
   ▼
6. recommend/page.tsx → getSessionUser() OK → render page
```

**Matcher:** Proxy runs on page routes only (excludes `/api/*`, static assets).

**API routes** (`POST /api/recommend`) are excluded from proxy. They use `requireAuth()` → `resolveSession()` and set refreshed cookies on the JSON response directly.

---

## 8. Flow 5 — Protected page (/recommend)

### Server guard

```
app/recommend/page.tsx
  getSessionUser()
    → null → redirect("/signup")
    → user → render RecommendPanel(firstName)
```

### Client API call

```
app/recommend/_components/RecommendPanel.tsx
  fetch("POST /api/recommend", { body: { input } })
    └─ app/api/recommend/route.ts
         ├─ requireAuth(req)          ← resolve-session.ts
         │    (may return new tokens if access was expired)
         ├─ setSessionCookies on response if refreshed
         ├─ validate body.input
         ├─ fetch(AI_API_URL/recommend/invoke)
         │    headers: { "X-User-Id": user.id }   ← set server-side only
         └─ return LangServe JSON
```

**Trust boundary:** Browser never sends `X-User-Id`. BFF derives it from verified session.

---

## 9. Flow 6 — Sign out

**Trigger:** Header "Sign out" button  
**Transport:** Server Action

### Call chain

```
components/header/Header.tsx
  <form action={signoutAction}>
    <button type="submit">Sign out</button>

app/actions/signout/signout.action.ts
  signoutAction()
    ├─ cookies().get("refresh_token")
    ├─ session.server.ts → revokeSession(plainToken)
    │    └─ SET revoked_at on matching refresh_tokens row
    ├─ cookies.ts → clearSessionCookiesInStore()
    └─ redirect("/")
```

After signout:

- Header shows Sign up / Sign in (`Header.tsx` + `getSessionUser()`)
- `/recommend` redirects to `/signup`

---

## 10. End-to-end happy path (sequence)

```
1. User opens /signup
   → signup/page.tsx (not logged in → show form)

2. Submit signup form
   → signup.action.ts
   → users row INSERT
   → refresh_tokens row INSERT
   → Set-Cookie: access_token, refresh_token
   → redirect /recommend

3. /recommend loads
   → proxy.ts: access valid → pass through
   → recommend/page.tsx → getSessionUser() OK
   → Header shows "Sign out"

4. User submits recommendation
   → RecommendPanel fetch POST /api/recommend
   → requireAuth → proxy to FastAPI with X-User-Id

5. Access JWT expires (e.g. after JWT_ACCESS_EXPIRES_IN)
   → User refreshes page or navigates
   → proxy.ts redirects to GET /api/auth/refresh
   → new cookies set → redirect back to /recommend
   → user stays logged in

6. Refresh grace expires (access TTL + JWT_REFRESH_EXPIRES_IN from sign-in)
   → proxy → GET /api/auth/refresh → refresh invalid
   → cookies cleared → redirect /signin

7. User clicks Sign out
   → signout.action.ts
   → refresh token revoked in DB
   → cookies cleared
   → redirect /
```

---

## 11. Environment variables

| Variable                 | File consumed                             | Purpose                                                                   |
| ------------------------ | ----------------------------------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL`           | `lib/db/index.ts`                         | PostgreSQL connection                                                     |
| `JWT_SECRET`             | `lib/auth/session/jwt.ts`                 | HS256 signing key (≥32 chars)                                             |
| `JWT_ACCESS_EXPIRES_IN`  | `jwt.ts`, `token-expiry.ts`, `cookies.ts` | Access token TTL (default `15m`; e.g. `30s` for testing)                  |
| `JWT_REFRESH_EXPIRES_IN` | `token-expiry.ts`, `session.server.ts`    | Refresh grace after access expires (default `7d`; e.g. `30s` for testing) |
| `COOKIE_SECURE`          | `lib/auth/session/cookies.ts`             | `true` for Secure cookies in dev                                          |
| `AI_API_URL`             | `app/api/recommend/route.ts`              | FastAPI base URL                                                          |

**Testing example** (`apps/web/.env.local`):

```env
JWT_ACCESS_EXPIRES_IN=30s
JWT_REFRESH_EXPIRES_IN=30s
```

Total session lifetime ≈ 60s (30s access + 30s refresh grace). Restart dev server after changing env.

---

## 12. Known gaps (for analysis)

| Gap                                 | Impact                                         | Relevant files     |
| ----------------------------------- | ---------------------------------------------- | ------------------ |
| FastAPI has no auth                 | Direct `:8000` bypasses BFF                    | `apps/api/main.py` |
| `X-User-Id` not validated in Python | Header is trust-on-first-use                   | `apps/api/`        |
| No rate limiting                    | Brute-force signup/signin                      | actions only       |
| No client-side session polling      | Logout/refresh only on navigation or API calls | by design          |

---

## 13. Quick file lookup by question

| Question                          | Start here                                                 |
| --------------------------------- | ---------------------------------------------------------- |
| How is password hashed?           | `lib/auth/signup/signup.server.ts`                         |
| How is JWT verified?              | `lib/auth/session/verify-access-token.ts`                  |
| Where does auto-refresh happen?   | `apps/web/proxy.ts` + `app/api/auth/refresh/route.ts`      |
| Where is refresh logic shared?    | `lib/auth/session/resolve-session.ts`                      |
| Where are cookies set from forms? | `lib/auth/session/cookies.ts` → `setSessionCookiesInStore` |
| Where are cookies set from API?   | `cookies.ts` → `setSessionCookies`                         |
| How does refresh rotation work?   | `lib/auth/session/session.server.ts` → `refreshSession`    |
| How does signout revoke?          | `session.server.ts` → `revokeSession`                      |
| Who checks auth on API routes?    | `lib/auth/session/require-auth.ts`                         |
| Who checks auth on pages?         | `lib/auth/session/get-session.ts`                          |
| Signup validation rules?          | `lib/auth/signup/signup.schema.ts`                         |
| Signin validation rules?          | `lib/auth/signin/signin.schema.ts`                         |
| DB tables?                        | `lib/db/schema.ts`                                         |
