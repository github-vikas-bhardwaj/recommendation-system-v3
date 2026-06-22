"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { clearSessionCookiesInStore, REFRESH_TOKEN_COOKIE } from "@/lib/auth/session/cookies";
import { revokeSession } from "@/lib/auth/session/session.server";

export async function signoutAction(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

    if (refreshToken) {
      await revokeSession(refreshToken);
    }
  } catch (error) {
    console.error("[signoutAction]", error);
  }

  await clearSessionCookiesInStore();
  redirect("/");
}
