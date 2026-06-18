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
            <span className={styles.tag}>/signup</span> — server action validates input, hashes
            password, saves to <code>users</code> table.
          </p>
          <div className={styles.callout}>
            Signup does not set cookies. <strong>Sign in next.</strong>
          </div>
          <div className={styles.block}>
            <p className={styles.sectionLabel}>Try it</p>
            <Code>{`Open https://localhost:3000/signup
Fill the form and submit`}</Code>
          </div>
          <div className={styles.block}>
            <p className={styles.sectionLabel}>On success</p>
            <Code>{`Shows confirmation message.
User is created in the database.
No session cookies yet.`}</Code>
          </div>
        </Step>

        <Step number={2} title="Signin" summary="Verify password. Get session cookies.">
          <p className={styles.bodyText}>
            <span className={styles.tag}>/signin</span> — server action on success:
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
            <p className={styles.sectionLabel}>Try it</p>
            <Code>{`Open https://localhost:3000/signin
Enter email + password and submit`}</Code>
          </div>
          <div className={styles.block}>
            <p className={styles.sectionLabel}>On success</p>
            <Code>{`Browser stores httpOnly cookies:
  access_token  (JWT, ~15 min)
  refresh_token (opaque, ~7 days)`}</Code>
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
            <span className={styles.tag}>Sign out</span> in the header — server action revokes the
            refresh token and clears cookies.
          </p>
          <div className={styles.block}>
            <p className={styles.sectionLabel}>Try it</p>
            <Code>{`Click "Sign out" in the header
→ redirects to home
→ signup / sign in links return`}</Code>
          </div>
          <div className={styles.block}>
            <p className={styles.sectionLabel}>Confirm logged out</p>
            <Code>{`Visit https://localhost:3000/recommend
→ redirects to /signup`}</Code>
          </div>
        </Step>

        <section className={styles.card}>
          <h2>Quick reference</h2>
          <p className={styles.cardSummary}>
            Signup and signin use forms (server actions). Session APIs use curl after signing in via
            the browser.
          </p>

          <div style={{ marginTop: "1.5rem" }}>
            {[
              ["1. Signup (UI)", "https://localhost:3000/signup"],
              ["2. Signin (UI)", "https://localhost:3000/signin"],
              ["3. Me", "curl -b cookies.txt https://localhost:3000/api/auth/me"],
              [
                "4. Recommend",
                `curl -b cookies.txt -X POST https://localhost:3000/api/recommend -H "Content-Type: application/json" -d '{"input":"sci-fi"}'`,
              ],
              [
                "5. Refresh",
                "curl -b cookies.txt -c cookies.txt -X POST https://localhost:3000/api/auth/refresh",
              ],
              ["6. Logout", 'Click "Sign out" in the header'],
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
