import "server-only";

import { cookies } from "next/headers";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "./cookie-names";
import { getSessionUserReadOnly } from "./resolve-session";
import type { SessionUser } from "./session.types";

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();

  return getSessionUserReadOnly(
    cookieStore.get(ACCESS_TOKEN_COOKIE)?.value,
    cookieStore.get(REFRESH_TOKEN_COOKIE)?.value
  );
}
