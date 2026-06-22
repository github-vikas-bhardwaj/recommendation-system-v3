"use server";

import { redirect } from "next/navigation";
import { flattenError } from "zod";

import { setSessionCookiesInStore } from "@/lib/auth/session/cookies";
import { createSession } from "@/lib/auth/session/session.server";
import { signinSchema } from "@/lib/auth/signin/signin.schema";
import { authenticateUser, SigninInvalidCredentialsError } from "@/lib/auth/signin/signin.server";
import { protectAuthAction, rateLimitMessage } from "@/lib/security/arcjet";

import type { SigninActionState } from "./signin.action.types";

function formValue(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function signinAction(
  _prevState: SigninActionState,
  formData: FormData
): Promise<SigninActionState> {
  const decision = await protectAuthAction();
  if (decision.isDenied()) {
    return { error: rateLimitMessage(decision) };
  }

  const result = signinSchema.safeParse({
    email: formValue(formData, "email"),
    password: formValue(formData, "password"),
  });

  if (!result.success) {
    return {
      fieldErrors: flattenError(result.error).fieldErrors,
    };
  }

  try {
    const { user } = await authenticateUser(result.data);
    const tokens = await createSession(user.id);
    await setSessionCookiesInStore(tokens, tokens.refreshExpiresAt);
  } catch (error) {
    if (error instanceof SigninInvalidCredentialsError) {
      return { error: error.message };
    }
    console.error("[signinAction]", error);
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/recommend");
}
