import { type ComponentPropsWithoutRef, forwardRef, useId } from "react";

import styles from "./input.module.css";

export type InputProps = Omit<ComponentPropsWithoutRef<"input">, "id"> & {
  id?: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id: idProp, label, optional, hint, error, className, ...inputProps },
  ref
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, !error ? hintId : undefined].filter(Boolean).join(" ");

  const inputClassName = [styles.input, error ? styles.inputError : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {optional ? <span className={styles.optional}> (optional)</span> : null}
      </label>
      <input
        ref={ref}
        id={id}
        className={inputClassName}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...inputProps}
      />
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
});
