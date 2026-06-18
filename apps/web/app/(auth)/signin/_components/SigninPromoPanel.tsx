import { signinPromoContent } from "../signin-content";
import styles from "./signin-promo.module.css";

export function SigninPromoPanel() {
  const { eyebrow, title, description, benefits } = signinPromoContent;

  return (
    <aside className={styles.panel} aria-label="Why sign in to Recommend">
      <div className={styles.panelGlow} aria-hidden="true" />
      <div className={styles.panelGlow2} aria-hidden="true" />

      <div className={styles.content}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>{description}</p>

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
  );
}
