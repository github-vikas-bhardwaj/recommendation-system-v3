import Link from "next/link";
import styles from "./auth-flow.module.css";

function Code({ children }: { children: string }) {
  return <pre className={styles.codeBlock}>{children}</pre>;
}

function Step({
  number,
  title,
  summary,
  children,
}: {
  number: number;
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.card}>
      <div className={styles.stepHeader}>
        <div className={styles.stepNum}>{number}</div>
        <div>
          <h2>{title}</h2>
          <p className={styles.cardSummary}>{summary}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function AuthFlowPage() {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <Link href="/" className={styles.back}>
          ← Back to home
        </Link>

        <header className={styles.hero}>
          <h1>How auth works</h1>
          <p>
            Step-by-step guide: signup → signin → session cookies → protected APIs → refresh →
            logout. Run <span className={styles.tag}>npm run dev:https -w web</span> first.
          </p>
        </header>

        <section className={styles.card}>
          <h2>Overview (30 seconds)</h2>
          <ol className={styles.overviewList}>
            {[
              "Signup creates a user. No cookies.",
              "Signin checks password and sets two httpOnly cookies.",
              "Protected routes read the access cookie on every request.",
              "Refresh gets new cookies when access expires (~15 min).",
              "Logout revokes refresh token and clears cookies.",
            ].map((text, i) => (
              <li key={text}>
                <span className={styles.overviewNum}>{i + 1}.</span>
                <span>{text}</span>
              </li>
            ))}
          </ol>

          <div className={styles.tokenGrid}>
            <div className={styles.tokenBox}>
              <strong>access_token</strong>
              <p>JWT · 15 min · every API call · not in DB</p>
            </div>
            <div className={styles.tokenBox}>
              <strong>refresh_token</strong>
              <p>Random string · 7 days · only /refresh · hashed in DB</p>
            </div>
          </div>

          <div className={styles.block} style={{ marginTop: "1.5rem" }}>
            <p className={styles.sectionLabel}>Architecture</p>
            <Code>{`Browser  →  Next.js https://localhost:3000  →  FastAPI :8000
(cookies)     verifies JWT      gets X-User-Id`}</Code>
          </div>
        </section>

        <Step number={1} title="Signup" summary="Create account. You are NOT logged in yet.">
          <p className={styles.bodyText}>
            <span className={styles.tag}>POST /api/auth/signup</span> — validates input, hashes
            password, saves to <code>users</code> table.
          </p>
          <div className={styles.callout}>
            Signup returns JSON only. <strong>No cookies.</strong> Sign in next.
          </div>
          <div className={styles.block}>
            <p className={styles.sectionLabel}>Try it</p>
            <Code>{`curl -X POST https://localhost:3000/api/auth/signup \\
  -H "Content-Type: application/json" \\
  -d '{
    "firstName": "Vikas",
    "email": "vikas@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!"
  }'`}</Code>
          </div>
          <div className={styles.block}>
            <p className={styles.sectionLabel}>Response · 201</p>
            <Code>{`{ "user": { "id": "...", "firstName": "Vikas", "email": "..." } }`}</Code>
          </div>
        </Step>

        <Step number={2} title="Signin" summary="Verify password. Get session cookies.">
          <p className={styles.bodyText}>
            <span className={styles.tag}>POST /api/auth/signin</span> — on success:
          </p>
          <ul className={styles.list}>
            <li>
              Insert row in <code>refresh_tokens</code> (hashed)
            </li>
            <li>Sign JWT with your user id</li>
            <li>
              Set <code>access_token</code> + <code>refresh_token</code> cookies
            </li>
          </ul>
          <div className={styles.block}>
            <p className={styles.sectionLabel}>Try it · save cookies</p>
            <Code>{`curl -c cookies.txt -X POST https://localhost:3000/api/auth/signin \\
  -H "Content-Type: application/json" \\
  -d '{"email":"vikas@example.com","password":"Password123!"}'`}</Code>
          </div>
          <div className={styles.block}>
            <p className={styles.sectionLabel}>Response · 200</p>
            <Code>{`Body:    { "user": { ... } }
Headers: Set-Cookie: access_token=...
         Set-Cookie: refresh_token=...`}</Code>
          </div>
        </Step>

        <Step number={3} title="Me" summary="Check who is logged in.">
          <p className={styles.bodyText}>
            <span className={styles.tag}>GET /api/auth/me</span> — verify access JWT, load user from
            DB.
          </p>
          <div className={styles.block}>
            <p className={styles.sectionLabel}>Try it</p>
            <Code>curl -b cookies.txt https://localhost:3000/api/auth/me</Code>
          </div>
          <div className={styles.block}>
            <p className={styles.sectionLabel}>Response</p>
            <Code>{`200 → { "user": { "id": "...", "firstName": "Vikas" } }
401 → { "error": "Unauthorized" }`}</Code>
          </div>
        </Step>

        <Step number={4} title="Protected route" summary="Recommendations need a session.">
          <p className={styles.bodyText}>
            <span className={styles.tag}>POST /api/recommend</span> — calls{" "}
            <code>requireAuth()</code>. No cookie → 401.
          </p>
          <div className={styles.block}>
            <p className={styles.sectionLabel}>Without cookies</p>
            <Code>{`curl -X POST https://localhost:3000/api/recommend \\
  -H "Content-Type: application/json" \\
  -d '{"input":"sci-fi books"}'`}</Code>
          </div>
          <div className={styles.block}>
            <p className={styles.sectionLabel}>With cookies</p>
            <Code>{`curl -b cookies.txt -X POST https://localhost:3000/api/recommend \\
  -H "Content-Type: application/json" \\
  -d '{"input":"sci-fi books"}'`}</Code>
          </div>
          <p className={styles.bodyText}>
            Next.js adds <span className={styles.tag}>X-User-Id</span> when calling FastAPI.
          </p>
        </Step>

        <Step number={5} title="Refresh" summary="New cookies when access expires.">
          <p className={styles.bodyText}>
            <span className={styles.tag}>POST /api/auth/refresh</span> — validates refresh cookie,
            revokes old DB row, issues new tokens.
          </p>
          <div className={styles.block}>
            <p className={styles.sectionLabel}>Try it</p>
            <Code>{`curl -b cookies.txt -c cookies.txt \\
  -X POST https://localhost:3000/api/auth/refresh`}</Code>
          </div>
          <div className={styles.callout}>Each refresh invalidates the previous refresh token.</div>
        </Step>

        <Step number={6} title="Logout" summary="End the session.">
          <p className={styles.bodyText}>
            <span className={styles.tag}>POST /api/auth/signout</span> — revoke refresh token, clear
            cookies.
          </p>
          <div className={styles.block}>
            <p className={styles.sectionLabel}>Try it</p>
            <Code>curl -b cookies.txt -X POST https://localhost:3000/api/auth/signout</Code>
          </div>
          <div className={styles.block}>
            <p className={styles.sectionLabel}>Confirm logged out</p>
            <Code>{`curl -b cookies.txt https://localhost:3000/api/auth/me
# → 401`}</Code>
          </div>
        </Step>

        <section className={styles.card}>
          <h2>Curl cheatsheet</h2>
          <p className={styles.cardSummary}>Run in order. Replace email/password.</p>

          <div style={{ marginTop: "1.5rem" }}>
            {[
              [
                "1. Signup",
                `curl -X POST https://localhost:3000/api/auth/signup -H "Content-Type: application/json" -d '{"firstName":"Vikas","email":"you@example.com","password":"Password123!","confirmPassword":"Password123!"}'`,
              ],
              [
                "2. Signin",
                `curl -c cookies.txt -X POST https://localhost:3000/api/auth/signin -H "Content-Type: application/json" -d '{"email":"you@example.com","password":"Password123!"}'`,
              ],
              ["3. Me", "curl -b cookies.txt https://localhost:3000/api/auth/me"],
              [
                "4. Recommend",
                `curl -b cookies.txt -X POST https://localhost:3000/api/recommend -H "Content-Type: application/json" -d '{"input":"sci-fi"}'`,
              ],
              [
                "5. Refresh",
                "curl -b cookies.txt -c cookies.txt -X POST https://localhost:3000/api/auth/refresh",
              ],
              ["6. Logout", "curl -b cookies.txt -X POST https://localhost:3000/api/auth/signout"],
            ].map(([label, cmd]) => (
              <div key={label} className={styles.cheatItem}>
                <strong>{label}</strong>
                <pre>{cmd}</pre>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
