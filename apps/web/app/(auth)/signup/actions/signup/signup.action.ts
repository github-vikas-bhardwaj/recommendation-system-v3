"use server";

import { redirect } from "next/navigation";
import { flattenError } from "zod";

import { setSessionCookiesInStore } from "@/lib/auth/session/cookies";
import { createSession } from "@/lib/auth/session/session.server";
import { signupSchema } from "@/lib/auth/signup/signup.schema";
import { createUser, SignupConflictError } from "@/lib/auth/signup/signup.server";
import { protectAuthAction, rateLimitMessage } from "@/lib/security/arcjet";

import type { SignupActionState } from "./signup.action.types";

function formValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function signupAction(
  _prevState: SignupActionState,
  formData: FormData
): Promise<SignupActionState> {
  const decision = await protectAuthAction();
  if (decision.isDenied()) {
    return { error: rateLimitMessage(decision) };
  }

  const lastName = formValue(formData, "lastName");

  const result = signupSchema.safeParse({
    firstName: formValue(formData, "firstName"),
    lastName: lastName || undefined,
    email: formValue(formData, "email"),
    password: formValue(formData, "password"),
    confirmPassword: formValue(formData, "confirmPassword"),
  });

  if (!result.success) {
    return {
      fieldErrors: flattenError(result.error).fieldErrors,
    };
  }

  try {
    const { user } = await createUser(result.data);
    const tokens = await createSession(user.id);
    await setSessionCookiesInStore(tokens, tokens.refreshExpiresAt);
  } catch (error) {
    if (error instanceof SignupConflictError) {
      return { fieldErrors: { email: [error.message] } };
    }
    console.error("[signupAction]", error);
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/shows");
}
