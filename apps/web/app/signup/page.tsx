import Link from "next/link";
import styles from "./signup.module.css";

const benefits = [
  "Personalized AI recommendations from day one",
  "Secure sessions with encrypted cookies",
  "Save your taste profile across devices",
];

export default function SignupPage() {
  return (
    <div className={styles.page}>
      <div className={styles.split}>
        <aside className={styles.panel} aria-label="Why join Recommend">
          <div className={styles.panelGlow} aria-hidden="true" />
          <div className={styles.panelGlow2} aria-hidden="true" />

          <div className={styles.panelContent}>
            <span className={styles.eyebrow}>Join Recommend</span>
            <h1 className={styles.panelTitle}>
              Start discovering things you&apos;ll actually love
            </h1>
            <p className={styles.panelText}>
              Create a free account and tell us what you enjoy — we&apos;ll handle the rest with
              smart, tailored suggestions.
            </p>

            <ul className={styles.benefits}>
              {benefits.map((text) => (
                <li key={text} className={styles.benefit}>
                  <span className={styles.benefitIcon} aria-hidden="true">
                    ✓
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className={styles.formPanel}>
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Create your account</h2>
            <p className={styles.formSubtitle}>It only takes a minute.</p>

            <form className={styles.form} noValidate>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="firstName">
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    className={styles.input}
                    placeholder="Vikas"
                    autoComplete="given-name"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="lastName">
                    Last name <span className={styles.optional}>(optional)</span>
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    className={styles.input}
                    placeholder="Bhardwaj"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={styles.input}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className={styles.input}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <p className={styles.hint}>
                  At least 8 characters with uppercase, lowercase, number, and special character.
                </p>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="confirmPassword">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className={styles.input}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
              </div>

              <button type="button" className={styles.submit}>
                Create account
              </button>
            </form>

            <p className={styles.footer}>
              Already have an account? <Link href="#">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
