"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";

import { signupAction } from "../actions/signup/signup.action";
import { initialSignupActionState } from "../actions/signup/signup.action.types";
import { signupFields, signupFormContent } from "../signup-content";
import styles from "./signup-form.module.css";

function fieldError(
  fieldErrors: typeof initialSignupActionState.fieldErrors,
  field: keyof NonNullable<typeof initialSignupActionState.fieldErrors>
) {
  return fieldErrors?.[field]?.[0];
}

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, initialSignupActionState);

  const {
    title,
    subtitle,
    submitLabel,
    submittingLabel,
    footerText,
    footerLinkLabel,
    footerLinkHref,
    passwordHint,
  } = signupFormContent;

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

        <div className={styles.fieldRow}>
          <Input
            id="firstName"
            name="firstName"
            label={signupFields.firstName.label}
            placeholder={signupFields.firstName.placeholder}
            autoComplete={signupFields.firstName.autoComplete}
            error={fieldError(state.fieldErrors, "firstName")}
            disabled={isPending}
          />
          <Input
            id="lastName"
            name="lastName"
            label={signupFields.lastName.label}
            placeholder={signupFields.lastName.placeholder}
            autoComplete={signupFields.lastName.autoComplete}
            optional={signupFields.lastName.optional}
            error={fieldError(state.fieldErrors, "lastName")}
            disabled={isPending}
          />
        </div>

        <Input
          id="email"
          name="email"
          type="email"
          label={signupFields.email.label}
          placeholder={signupFields.email.placeholder}
          autoComplete={signupFields.email.autoComplete}
          error={fieldError(state.fieldErrors, "email")}
          disabled={isPending}
        />

        <Input
          id="password"
          name="password"
          type="password"
          label={signupFields.password.label}
          placeholder={signupFields.password.placeholder}
          autoComplete={signupFields.password.autoComplete}
          hint={passwordHint}
          error={fieldError(state.fieldErrors, "password")}
          disabled={isPending}
        />

        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label={signupFields.confirmPassword.label}
          placeholder={signupFields.confirmPassword.placeholder}
          autoComplete={signupFields.confirmPassword.autoComplete}
          error={fieldError(state.fieldErrors, "confirmPassword")}
          disabled={isPending}
        />

        <button type="submit" className={styles.submit} disabled={isPending}>
          {isPending ? (
            <>
              <Spinner size="sm" label="Creating account" />
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
