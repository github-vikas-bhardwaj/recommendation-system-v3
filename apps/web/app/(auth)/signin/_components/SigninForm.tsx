"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";

import { signinAction } from "../actions/signin/signin.action";
import { initialSigninActionState } from "../actions/signin/signin.action.types";
import { signinFields, signinFormContent } from "../signin-content";
import styles from "./signin-form.module.css";

function fieldError(
  fieldErrors: typeof initialSigninActionState.fieldErrors,
  field: keyof NonNullable<typeof initialSigninActionState.fieldErrors>
) {
  return fieldErrors?.[field]?.[0];
}

export function SigninForm() {
  const [state, formAction, isPending] = useActionState(signinAction, initialSigninActionState);

  const {
    title,
    subtitle,
    submitLabel,
    submittingLabel,
    footerText,
    footerLinkLabel,
    footerLinkHref,
  } = signinFormContent;

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.subtitle}>{subtitle}</p>

      <form className={styles.form} action={formAction}>
        {state.error ? (
          <p className={styles.formError} role="alert">
            {state.error}
          </p>
        ) : null}

        <Input
          id="email"
          name="email"
          type="email"
          label={signinFields.email.label}
          placeholder={signinFields.email.placeholder}
          autoComplete={signinFields.email.autoComplete}
          error={fieldError(state.fieldErrors, "email")}
          disabled={isPending}
        />

        <Input
          id="password"
          name="password"
          type="password"
          label={signinFields.password.label}
          placeholder={signinFields.password.placeholder}
          autoComplete={signinFields.password.autoComplete}
          error={fieldError(state.fieldErrors, "password")}
          disabled={isPending}
        />

        <button type="submit" className={styles.submit} disabled={isPending}>
          {isPending ? (
            <>
              <Spinner size="sm" label="Signing in" />
              {submittingLabel}
            </>
          ) : (
            submitLabel
          )}
        </button>
      </form>

      <p className={styles.footer}>
        {footerText} <Link href={footerLinkHref}>{footerLinkLabel}</Link>
      </p>
    </div>
  );
}
