export type FlowFile = {
  path: string;
  role: string;
};

export type AuthFlowStep = {
  number: number;
  title: string;
  summary: string;
  transport: string;
  entryPoint: string;
  callChain: string;
  files: FlowFile[];
  tryIt?: string;
  note?: string;
};

export const authOverview = {
  intro: "Technical E2E reference for auth in apps/web. Full markdown doc: docs/AUTH-FLOW.md",
  flows: [
    "Signup → create user + session → redirect /recommend",
    "Signin → verify password + session → redirect /recommend",
    "Pages/Header → getSessionUser() reads access_token cookie",
    "POST /api/recommend → requireAuth() → FastAPI with X-User-Id",
    "POST /api/auth/refresh → rotate refresh token, new cookies",
    "Sign out → revoke refresh + clear cookies → redirect /",
  ],
};

export const sessionFiles: FlowFile[] = [
  { path: "apps/web/lib/auth/session/session.types.ts", role: "SessionUser, SessionTokens types" },
  { path: "apps/web/lib/auth/session/jwt.ts", role: "Sign / verify access JWT (HS256)" },
  {
    path: "apps/web/lib/auth/session/refresh-token.ts",
    role: "Generate + SHA-256 hash refresh token",
  },
  {
    path: "apps/web/lib/auth/session/session.server.ts",
    role: "createSession, refreshSession, revokeSession",
  },
  { path: "apps/web/lib/auth/session/cookies.ts", role: "Set/clear httpOnly cookies" },
  { path: "apps/web/lib/auth/session/get-session.ts", role: "getSessionUser() for pages + Header" },
  { path: "apps/web/lib/auth/session/require-auth.ts", role: "requireAuth(req) for API routes" },
];

export const dbFiles: FlowFile[] = [
  { path: "apps/web/lib/db/schema.ts", role: "users + refresh_tokens tables" },
  { path: "apps/web/lib/db/index.ts", role: "Drizzle client (DATABASE_URL)" },
  { path: "apps/web/drizzle/0000_create_users.sql", role: "Users migration" },
  { path: "apps/web/drizzle/0001_clever_robin_chapel.sql", role: "Refresh tokens migration" },
];

export const authFlowSteps: AuthFlowStep[] = [
  {
    number: 1,
    title: "Signup (auto-login)",
    summary: "Form submit creates user, session cookies, redirects to /recommend.",
    transport: "Server Action",
    entryPoint: "apps/web/app/(auth)/signup/_components/SignupForm.tsx",
    callChain: `SignupForm (useActionState)
  → signup.action.ts
    → signup.schema.ts (Zod validate)
    → signup.server.ts (bcrypt + INSERT users)
    → session.server.ts createSession()
    → cookies.ts setSessionCookiesInStore()
  → redirect("/recommend")`,
    files: [
      {
        path: "apps/web/app/(auth)/signup/page.tsx",
        role: "Page guard: getSessionUser → redirect if logged in",
      },
      {
        path: "apps/web/app/(auth)/signup/_components/SignupForm.tsx",
        role: "Client form, Spinner, field errors",
      },
      {
        path: "apps/web/app/(auth)/signup/actions/signup/signup.action.ts",
        role: '"use server" handler',
      },
      { path: "apps/web/lib/auth/signup/signup.schema.ts", role: "Validation + password rules" },
      { path: "apps/web/lib/auth/signup/signup.server.ts", role: "createUser(), bcrypt cost 12" },
      { path: "apps/web/lib/auth/signup/signup.types.ts", role: "SignupResponse type" },
      { path: "apps/web/lib/auth/db-errors.ts", role: "Duplicate email detection" },
    ],
    tryIt:
      "Open https://localhost:3000/signup → submit form → lands on /recommend with cookies set",
  },
  {
    number: 2,
    title: "Signin",
    summary: "Verify email/password, create session, redirect to /recommend.",
    transport: "Server Action",
    entryPoint: "apps/web/app/(auth)/signin/_components/SigninForm.tsx",
    callChain: `SigninForm (useActionState)
  → signin.action.ts
    → signin.schema.ts (Zod validate)
    → signin.server.ts authenticateUser()
    → session.server.ts createSession()
    → cookies.ts setSessionCookiesInStore()
  → redirect("/recommend")`,
    files: [
      { path: "apps/web/app/(auth)/signin/page.tsx", role: "Page guard: redirect if logged in" },
      { path: "apps/web/app/(auth)/signin/_components/SigninForm.tsx", role: "Client form" },
      {
        path: "apps/web/app/(auth)/signin/actions/signin/signin.action.ts",
        role: '"use server" handler',
      },
      { path: "apps/web/lib/auth/signin/signin.schema.ts", role: "Email + password validation" },
      {
        path: "apps/web/lib/auth/signin/signin.server.ts",
        role: "authenticateUser(), bcrypt compare",
      },
      { path: "apps/web/lib/auth/signin/signin.types.ts", role: "SigninResponse type" },
    ],
    tryIt: "Open https://localhost:3000/signin → submit → /recommend",
  },
  {
    number: 3,
    title: "Session read (pages & header)",
    summary: "Server components read access_token cookie — no API call.",
    transport: "Direct cookie read",
    entryPoint: "apps/web/lib/auth/session/get-session.ts",
    callChain: `getSessionUser()
  → cookies().get("access_token")
  → jwt.ts verifyAccessToken() → sub = userId
  → SELECT users WHERE id = userId
  → SessionUser | null`,
    files: [
      { path: "apps/web/lib/auth/session/get-session.ts", role: "Core session reader" },
      { path: "apps/web/components/header/Header.tsx", role: "Guest nav vs Sign out button" },
      { path: "apps/web/app/recommend/page.tsx", role: "Redirect to /signup if null" },
      { path: "apps/web/app/layout.tsx", role: "Renders Header on every page" },
    ],
    note: "Gap: expired access JWT returns null even if refresh cookie is valid. No auto-refresh on page load yet.",
  },
  {
    number: 4,
    title: "POST /api/recommend (protected BFF)",
    summary: "Requires session; proxies to FastAPI with X-User-Id.",
    transport: "API Route",
    entryPoint: "apps/web/app/recommend/_components/RecommendPanel.tsx",
    callChain: `RecommendPanel fetch POST /api/recommend
  → app/api/recommend/route.ts
    → requireAuth(req)
    → fetch(AI_API_URL/recommend/invoke)
       header: X-User-Id = user.id  (server-set, not from browser)`,
    files: [
      { path: "apps/web/app/recommend/_components/RecommendPanel.tsx", role: "Client fetch" },
      { path: "apps/web/app/recommend/page.tsx", role: "Server page guard" },
      { path: "apps/web/app/api/recommend/route.ts", role: "BFF proxy" },
      { path: "apps/web/app/api/recommend/route.test.ts", role: "Tests" },
    ],
    tryIt: `curl -b cookies.txt -X POST https://localhost:3000/api/recommend \\
  -H "Content-Type: application/json" -d '{"input":"sci-fi"}'`,
  },
  {
    number: 5,
    title: "POST /api/auth/refresh",
    summary: "Rotate refresh token; issue new cookie pair.",
    transport: "API Route",
    entryPoint: "apps/web/app/api/auth/refresh/route.ts",
    callChain: `POST /api/auth/refresh
  → read refresh_token cookie
  → session.server.ts refreshSession()
     → revoke old refresh_tokens row
     → createSession() new pair
  → setSessionCookies(response, tokens)`,
    files: [
      { path: "apps/web/app/api/auth/refresh/route.ts", role: "Route handler" },
      {
        path: "apps/web/lib/auth/session/session.server.ts",
        role: "refreshSession rotation logic",
      },
      { path: "apps/web/app/api/auth/refresh/route.test.ts", role: "Tests" },
    ],
    tryIt: "curl -b cookies.txt -c cookies.txt -X POST https://localhost:3000/api/auth/refresh",
    note: "Not called automatically by UI today — manual or future client hook.",
  },
  {
    number: 6,
    title: "Sign out",
    summary: "Revoke refresh token in DB, clear cookies, redirect home.",
    transport: "Server Action",
    entryPoint: "apps/web/components/header/Header.tsx",
    callChain: `Header form action={signoutAction}
  → app/actions/signout/signout.action.ts
    → session.server.ts revokeSession()
    → cookies.ts clearSessionCookiesInStore()
  → redirect("/")`,
    files: [
      { path: "apps/web/components/header/Header.tsx", role: "Sign out form submit" },
      { path: "apps/web/app/actions/signout/signout.action.ts", role: '"use server" handler' },
      { path: "apps/web/app/actions/signout/signout.action.test.ts", role: "Tests" },
    ],
    tryIt: 'Click "Sign out" in header → home → Sign up / Sign in return',
  },
];

export const transportTable = [
  {
    feature: "Signup",
    transport: "Server Action",
    path: "app/(auth)/signup/actions/signup/signup.action.ts",
  },
  {
    feature: "Signin",
    transport: "Server Action",
    path: "app/(auth)/signin/actions/signin/signin.action.ts",
  },
  {
    feature: "Sign out",
    transport: "Server Action",
    path: "app/actions/signout/signout.action.ts",
  },
  { feature: "Refresh", transport: "API POST", path: "app/api/auth/refresh/route.ts" },
  { feature: "Recommend", transport: "API POST", path: "app/api/recommend/route.ts" },
];
