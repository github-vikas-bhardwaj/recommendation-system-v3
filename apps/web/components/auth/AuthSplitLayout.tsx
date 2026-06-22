import type { ReactNode } from "react";

import styles from "./auth-split.module.css";

type AuthSplitLayoutProps = {
  promo: ReactNode;
  form: ReactNode;
};

export function AuthSplitLayout({ promo, form }: AuthSplitLayoutProps) {
  return (
    <div className={styles.page}>
      <div className={styles.split}>
        {promo}
        <div className={styles.formPanel}>{form}</div>
      </div>
    </div>
  );
}
