import styles from "./spinner.module.css";

type SpinnerSize = "sm" | "md" | "lg";

type SpinnerProps = {
  size?: SpinnerSize;
  className?: string;
  label?: string;
};

const sizeClass: Record<SpinnerSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

export function Spinner({ size = "md", className, label = "Loading" }: SpinnerProps) {
  const spinnerClassName = [styles.spinner, sizeClass[size], className ?? ""]
    .filter(Boolean)
    .join(" ");

  return <span className={spinnerClassName} role="status" aria-label={label} />;
}
