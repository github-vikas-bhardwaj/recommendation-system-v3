import Link from "next/link";

import styles from "./auth-flow.module.css";
import {
  authFlowSteps,
  authOverview,
  dbFiles,
  sessionFiles,
  transportTable,
} from "./auth-flow-content";

function Code({ children }: { children: string }) {
  return <pre className={styles.codeBlock}>{children}</pre>;
}

function FileList({ files }: { files: { path: string; role: string }[] }) {
  return (
    <ul className={styles.fileList}>
      {files.map((file) => (
        <li key={file.path}>
          <code className={styles.filePath}>{file.path}</code>
          <span className={styles.fileRole}>{file.role}</span>
        </li>
      ))}
    </ul>
  );
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
    <section className={styles.card} id={`step-${number}`}>
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
          <h1>Auth flow — technical reference</h1>
          <p>
            E2E trace through signup, signin, session cookies, protected APIs, refresh, and sign
            out. Every step lists file paths to inspect in the repo.
          </p>
          <p className={styles.heroNote}>
            Full markdown doc (for IDE analysis):{" "}
            <code className={styles.inlineCode}>docs/AUTH-FLOW.md</code>
          </p>
        </header>

        <section className={styles.card}>
          <h2>Overview</h2>
          <p className={styles.bodyText}>{authOverview.intro}</p>
          <ol className={styles.overviewList}>
            {authOverview.flows.map((text, i) => (
              <li key={text}>
                <span className={styles.overviewNum}>{i + 1}.</span>
                <span>{text}</span>
              </li>
            ))}
          </ol>

          <div className={styles.tokenGrid}>
            <div className={styles.tokenBox}>
              <strong>access_token</strong>
              <p>JWT · HS256 · ~15 min · lib/auth/session/jwt.ts · not in DB</p>
            </div>
            <div className={styles.tokenBox}>
              <strong>refresh_token</strong>
              <p>Opaque · 7 days · SHA-256 in refresh_tokens · rotation on refresh</p>
            </div>
          </div>

          <div className={styles.block} style={{ marginTop: "1.5rem" }}>
            <p className={styles.sectionLabel}>Architecture</p>
            <Code>{`Browser ──[httpOnly cookies]──► Next.js (apps/web)
                                  │
                    Server Actions: signup, signin, signout
                    API Routes:     me, refresh, recommend
                                  │
                                  ▼
                              PostgreSQL (users, refresh_tokens)
                                  │
                    POST /api/recommend ──► FastAPI (X-User-Id header)`}</Code>
          </div>
        </section>

        <section className={styles.card}>
          <h2>Transport layer</h2>
          <p className={styles.cardSummary}>
            Forms use server actions. Session APIs use route handlers.
          </p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Transport</th>
                <th>Entry file</th>
              </tr>
            </thead>
            <tbody>
              {transportTable.map((row) => (
                <tr key={row.feature}>
                  <td>{row.feature}</td>
                  <td>
                    <span className={styles.tag}>{row.transport}</span>
                  </td>
                  <td>
                    <code className={styles.tablePath}>apps/web/{row.path}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.card}>
          <h2>Session core files</h2>
          <p className={styles.cardSummary}>Read these first to understand the session model.</p>
          <FileList files={sessionFiles} />
        </section>

        <section className={styles.card}>
          <h2>Database files</h2>
          <FileList files={dbFiles} />
        </section>

        <nav className={styles.jumpNav} aria-label="Flow steps">
          {authFlowSteps.map((step) => (
            <a key={step.number} href={`#step-${step.number}`} className={styles.jumpLink}>
              {step.number}. {step.title}
            </a>
          ))}
        </nav>

        {authFlowSteps.map((step) => (
          <Step key={step.number} number={step.number} title={step.title} summary={step.summary}>
            <p className={styles.bodyText}>
              <strong>Transport:</strong> <span className={styles.tag}>{step.transport}</span>
            </p>
            <p className={styles.bodyText}>
              <strong>Entry point:</strong>{" "}
              <code className={styles.inlineCode}>{step.entryPoint}</code>
            </p>

            <div className={styles.block}>
              <p className={styles.sectionLabel}>Call chain</p>
              <Code>{step.callChain}</Code>
            </div>

            <div className={styles.block}>
              <p className={styles.sectionLabel}>Files to inspect</p>
              <FileList files={step.files} />
            </div>

            {step.tryIt ? (
              <div className={styles.block}>
                <p className={styles.sectionLabel}>Try it</p>
                <Code>{step.tryIt}</Code>
              </div>
            ) : null}

            {step.note ? <div className={styles.callout}>{step.note}</div> : null}
          </Step>
        ))}

        <section className={styles.card}>
          <h2>Environment variables</h2>
          <Code>{`apps/web/.env.example

JWT_SECRET              → lib/auth/session/jwt.ts
JWT_ACCESS_EXPIRES_IN   → jwt.ts, token-expiry.ts, cookies.ts (default 15m)
JWT_REFRESH_EXPIRES_IN  → token-expiry.ts, session.server.ts (refresh grace after access)
DATABASE_URL            → lib/db/index.ts
COOKIE_SECURE=true      → lib/auth/session/cookies.ts (npm run dev:https sets this)
AI_API_URL              → app/api/recommend/route.ts

Testing: JWT_ACCESS_EXPIRES_IN=30s + JWT_REFRESH_EXPIRES_IN=30s → ~60s total session`}</Code>
        </section>

        <section className={styles.card}>
          <h2>Test files</h2>
          <p className={styles.cardSummary}>
            Mirror the flows above — start here when changing auth logic.
          </p>
          <FileList
            files={[
              { path: "apps/web/lib/auth/session/jwt.test.ts", role: "JWT sign/verify" },
              {
                path: "apps/web/lib/auth/session/session.server.test.ts",
                role: "create/refresh/revoke",
              },
              {
                path: "apps/web/lib/auth/session/require-auth.test.ts",
                role: "API auth gate",
              },
              {
                path: "apps/web/app/(auth)/signup/actions/signup/signup.action.test.ts",
                role: "Signup action",
              },
              {
                path: "apps/web/app/(auth)/signin/actions/signin/signin.action.test.ts",
                role: "Signin action",
              },
              {
                path: "apps/web/app/actions/signout/signout.action.test.ts",
                role: "Signout action",
              },
              { path: "apps/web/app/api/auth/refresh/route.test.ts", role: "Refresh API" },
              { path: "apps/web/app/api/recommend/route.test.ts", role: "Recommend BFF" },
            ]}
          />
        </section>
      </div>
    </div>
  );
}
