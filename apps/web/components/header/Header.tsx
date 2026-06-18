import Link from "next/link";
import styles from "./header.module.css";

type NavVariant = "default" | "primary" | "ghost";

type NavItem = {
  label: string;
  href: string;
  variant: NavVariant;
};

const navItems: NavItem[] = [
  { label: "Sign up", href: "/signup", variant: "default" },
  { label: "Sign in", href: "#", variant: "primary" },
  { label: "Sign out", href: "#", variant: "ghost" },
];

const variantClass: Record<NavVariant, string> = {
  default: styles.navLink,
  primary: styles.navLinkPrimary,
  ghost: styles.navLinkGhost,
};

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandIcon}>R</span>
          Recommend
        </Link>

        <nav className={styles.nav} aria-label="Account">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} className={variantClass[item.variant]}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
