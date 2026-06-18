import { signupPromoContent } from "../signup-content";
import styles from "./signup-promo.module.css";

export function SignupPromoPanel() {
  const { eyebrow, title, description, benefits } = signupPromoContent;

  return (
    <aside className={styles.panel} aria-label="Why join Recommend">
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
