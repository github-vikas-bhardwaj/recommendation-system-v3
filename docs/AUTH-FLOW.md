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
  │  Server Actions: signup, signin, signout
  │  API Routes:    POST /api/auth/refresh, POST /api/recommend
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

| Feature            | Transport                        | Why                                              |
| ------------------ | -------------------------------- | ------------------------------------------------ |
| Signup form        | **Server Action**                | Form + `useActionState`, field errors            |
| Signin form        | **Server Action**                | Same                                             |
| Sign out (header)  | **Server Action**                | Form submit in `Header`                          |
| Current user check | **`getSessionUser()`**           | Server components (Header, pages) — no API route |
| Token refresh      | **API** `POST /api/auth/refresh` | Cookie POST, no form                             |
| Recommendations    | **API** `POST /api/recommend`    | BFF proxy to FastAPI                             |

There are **no** `POST /api/auth/signup` or `POST /api/auth/signin` routes — removed in favour of server actions.

---

## 2. File map (all auth-related paths)

### Session core (`apps/web/lib/auth/session/`)

| File                | Role                                                    |
| ------------------- | ------------------------------------------------------- |
| `session.types.ts`  | `SessionUser`, `SessionTokens` types                    |
| `jwt.ts`            | Sign / verify access JWT (HS256, `jose`)                |
| `refresh-token.ts`  | Generate opaque refresh token, SHA-256 hash             |
| `session.server.ts` | `createSession`, `refreshSession`, `revokeSession`      |
| `cookies.ts`        | Cookie names, set/clear (Route Handler + server action) |
| `get-session.ts`    | `getSessionUser()` — pages + Header                     |
| `require-auth.ts`   | `requireAuth(req)` — API route handlers                 |

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
| `app/api/auth/refresh/route.ts` | `POST /api/auth/refresh`              |
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

| Cookie          | Value            | Stored in DB?      | Lifetime                          | Used for                      |
| --------------- | ---------------- | ------------------ | --------------------------------- | ----------------------------- |
| `access_token`  | JWT (HS256)      | No                 | ~15 min (`JWT_ACCESS_EXPIRES_IN`) | Every auth check              |
| `refresh_token` | Random base64url | Yes (SHA-256 hash) | 7 days (hardcoded in code)        | `POST /api/auth/refresh` only |

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
maxAge: access 15min, refresh 7 days
```

Use `npm run dev:https -w web` locally so `COOKIE_SECURE=true` and Secure cookies work.

### Database (`lib/db/schema.ts`)

**`users`**

- `id`, `first_name`, `last_name`, `email` (unique), `password_hash`, timestamps

**`refresh_tokens`**

- `id`, `user_id` → users, `token_hash` (unique), `expires_at`, `revoked_at`, `created_at`
- Rotation: old row gets `revoked_at` set; new row inserted on refresh

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
       │    ├─ insert refresh_tokens row
       │    └─ lib/auth/session/jwt.ts → signAccessToken(userId)
       ├─ lib/auth/session/cookies.ts → setSessionCookiesInStore(tokens)
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
       ├─ cookies.ts → setSessionCookiesInStore(tokens)
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

**No HTTP round-trip** — server components read cookies directly.

### `getSessionUser()` — `lib/auth/session/get-session.ts`

```
cookies().get("access_token")
  → jwt.ts verifyAccessToken()
  → SELECT user from users WHERE id = sub
  → return SessionUser | null
```

**Used by:**

| File                           | Behaviour                        |
| ------------------------------ | -------------------------------- |
| `components/header/Header.tsx` | Show Sign up/Sign in vs Sign out |
| `app/(auth)/signup/page.tsx`   | Redirect if logged in            |
| `app/(auth)/signin/page.tsx`   | Redirect if logged in            |
| `app/recommend/page.tsx`       | Redirect to `/signup` if null    |

**Important gap:** If access JWT is **expired** but refresh cookie is still valid, `getSessionUser()` returns `null`. There is **no automatic refresh** on page load yet. User appears logged out until they call `POST /api/auth/refresh` or sign in again.

---

## 7. Flow 4 — Protected page (/recommend)

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
         ├─ requireAuth(req)          ← lib/auth/session/require-auth.ts
         ├─ validate body.input
         ├─ fetch(AI_API_URL/recommend/invoke)
         │    headers: { "X-User-Id": user.id }   ← set server-side only
         └─ return LangServe JSON
```

**Trust boundary:** Browser never sends `X-User-Id`. BFF derives it from verified JWT.

---

## 8. Flow 5 — POST /api/auth/refresh

**When:** Access JWT expired (~15 min), refresh cookie still valid  
**Transport:** API Route

### Call chain

```
app/api/auth/refresh/route.ts
  POST(req)
    ├─ req.cookies.get("refresh_token")
    ├─ session.server.ts → refreshSession(plainToken)
    │    ├─ hash token, lookup refresh_tokens (not revoked, not expired)
    │    ├─ SET revoked_at on old row  ← rotation
    │    └─ createSession(userId)      ← new pair
    ├─ cookies.ts → setSessionCookies(response, newTokens)
    └─ 200 { ok: true }

  On failure:
    → 401 + clearSessionCookies(response)
```

**Note:** No UI calls this automatically today. Manual curl or future client hook required.

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
   → recommend/page.tsx → getSessionUser() OK
   → Header shows "Sign out"

4. User submits recommendation
   → RecommendPanel fetch POST /api/recommend
   → requireAuth → proxy to FastAPI with X-User-Id

5. ~15 min later access JWT expires
   → getSessionUser() returns null
   → /recommend redirects to /signup  ⚠ known gap
   → Fix: call POST /api/auth/refresh or implement auto-refresh

6. User clicks Sign out
   → signout.action.ts
   → refresh token revoked in DB
   → cookies cleared
   → redirect /
```

---

## 11. Environment variables

| Variable                 | File consumed                 | Purpose                                                                    |
| ------------------------ | ----------------------------- | -------------------------------------------------------------------------- |
| `DATABASE_URL`           | `lib/db/index.ts`             | PostgreSQL connection                                                      |
| `JWT_SECRET`             | `lib/auth/session/jwt.ts`     | HS256 signing key (≥32 chars)                                              |
| `JWT_ACCESS_EXPIRES_IN`  | `lib/auth/session/jwt.ts`     | Access token TTL (default `15m`)                                           |
| `JWT_REFRESH_EXPIRES_IN` | `.env.example` only           | **Not read by code** — refresh TTL hardcoded 7 days in `session.server.ts` |
| `COOKIE_SECURE`          | `lib/auth/session/cookies.ts` | `true` for Secure cookies in dev                                           |
| `AI_API_URL`             | `app/api/recommend/route.ts`  | FastAPI base URL                                                           |

---

## 12. Known gaps (for analysis)

| Gap                                 | Impact                                          | Relevant files                        |
| ----------------------------------- | ----------------------------------------------- | ------------------------------------- |
| No auto-refresh on expired access   | User kicked to signup with valid refresh cookie | `get-session.ts`, no middleware       |
| FastAPI has no auth                 | Direct `:8000` bypasses BFF                     | `apps/api/main.py`                    |
| `X-User-Id` not validated in Python | Header is trust-on-first-use                    | `apps/api/`                           |
| No rate limiting                    | Brute-force signup/signin                       | actions only                          |
| Refresh TTL env unused              | Config drift                                    | `session.server.ts` vs `.env.example` |

---

## 13. Quick file lookup by question

| Question                          | Start here                                                 |
| --------------------------------- | ---------------------------------------------------------- |
| How is password hashed?           | `lib/auth/signup/signup.server.ts`                         |
| How is JWT verified?              | `lib/auth/session/jwt.ts`                                  |
| Where are cookies set from forms? | `lib/auth/session/cookies.ts` → `setSessionCookiesInStore` |
| Where are cookies set from API?   | `cookies.ts` → `setSessionCookies`                         |
| How does refresh rotation work?   | `lib/auth/session/session.server.ts` → `refreshSession`    |
| How does signout revoke?          | `session.server.ts` → `revokeSession`                      |
| Who checks auth on API routes?    | `lib/auth/session/require-auth.ts`                         |
| Who checks auth on pages?         | `lib/auth/session/get-session.ts`                          |
| Signup validation rules?          | `lib/auth/signup/signup.schema.ts`                         |
| Signin validation rules?          | `lib/auth/signin/signin.schema.ts`                         |
| DB tables?                        | `lib/db/schema.ts`                                         |
