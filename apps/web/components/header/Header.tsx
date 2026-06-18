import Link from "next/link";

import { signoutAction } from "@/app/actions/signout/signout.action";
import { getSessionUser } from "@/lib/auth/session/get-session";

import styles from "./header.module.css";

type NavVariant = "default" | "primary" | "ghost";

type NavItem = {
  label: string;
  href: string;
  variant: NavVariant;
};

const guestNavItems: NavItem[] = [
  { label: "Sign up", href: "/signup", variant: "default" },
  { label: "Sign in", href: "/signin", variant: "primary" },
];

const variantClass: Record<NavVariant, string> = {
  default: styles.navLink,
  primary: styles.navLinkPrimary,
  ghost: styles.navLinkGhost,
};

export async function Header() {
  const user = await getSessionUser();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href={user ? "/recommend" : "/"} className={styles.brand}>
          <span className={styles.brandIcon}>R</span>
          Recommend
        </Link>

        <nav className={styles.nav} aria-label="Account">
          {user ? (
            <form action={signoutAction}>
              <button type="submit" className={styles.navButtonGhost}>
                Sign out
              </button>
            </form>
          ) : (
            guestNavItems.map((item) => (
              <a key={item.label} href={item.href} className={variantClass[item.variant]}>
                {item.label}
              </a>
            ))
          )}
        </nav>
      </div>
    </header>
  );
}
