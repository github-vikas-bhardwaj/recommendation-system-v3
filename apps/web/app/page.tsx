import Link from "next/link";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Gen AI recommendations</span>

          <h1 className={styles.heroTitle}>
            Discover what you&apos;ll <span className={styles.heroTitleAccent}>love next</span>
          </h1>

          <p className={styles.heroSubtitle}>
            Tell us your tastes — books, films, podcasts, anything — and get personalized
            suggestions powered by AI. Built for curious minds.
          </p>

          <div className={styles.heroActions}>
            <Link href="/signup" className={styles.btnPrimary}>
              Get started free
            </Link>
            <a href="#how-it-works" className={styles.btnSecondary}>
              See how it works
            </a>
          </div>

          <div className={styles.demo} aria-hidden="true">
            <p className={styles.demoLabel}>Preview</p>
            <div className={styles.demoInput}>
              I love sci-fi, philosophical themes, and slow-burn mysteries…
            </div>
            <div className={styles.demoResults}>
              <div className={styles.demoResultItem}>
                <span className={styles.demoResultDot} />
                Dune — epic world-building you might enjoy
              </div>
              <div className={styles.demoResultItem}>
                <span className={styles.demoResultDot} />
                Arrival — thoughtful sci-fi with emotional depth
              </div>
              <div className={styles.demoResultItem}>
                <span className={styles.demoResultDot} />
                Dark (Netflix) — mystery with a sci-fi twist
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className={styles.features}>
        <div className={styles.featuresInner}>
          <h2 className={styles.sectionTitle}>How it works</h2>
          <p className={styles.sectionSubtitle}>
            Simple flow. Secure sessions. Recommendations you can trust.
          </p>

          <div className={styles.featureGrid}>
            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>✦</div>
              <h3 className={styles.featureTitle}>Share your taste</h3>
              <p className={styles.featureText}>
                Describe what you enjoy in plain language — genres, moods, authors, or shows you
                binged last weekend.
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>⚡</div>
              <h3 className={styles.featureTitle}>AI-powered picks</h3>
              <p className={styles.featureText}>
                Our Gen AI engine understands context and nuance to surface recommendations that
                actually fit you.
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>🔒</div>
              <h3 className={styles.featureTitle}>Secure by design</h3>
              <p className={styles.featureText}>
                Sign in with httpOnly session cookies. Your account stays private; only you see your
                history.
              </p>
            </article>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>
          Recommendation System · <Link href="/auth-flow">Auth flow guide</Link>
          {" · "}
          <Link href="/playground">Dev playground</Link>
        </p>
      </footer>
    </div>
  );
}
