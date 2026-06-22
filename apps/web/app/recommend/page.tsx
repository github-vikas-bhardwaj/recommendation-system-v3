import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session/get-session";

import styles from "./recommend.module.css";

export default async function RecommendPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/signup");
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <h1 className={styles.title}>Welcome, {user.firstName}</h1>
        <p className={styles.subtitle}>You&apos;re signed in. Recommendation UI will go here.</p>
      </div>
    </div>
  );
}
