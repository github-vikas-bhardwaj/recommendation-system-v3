import "server-only";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

import { ACCESS_TOKEN_COOKIE } from "./cookies";
import { verifyAccessToken } from "./jwt";
import type { SessionUser } from "./session.types";

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  let userId: string;
  try {
    ({ sub: userId } = await verifyAccessToken(accessToken));
  } catch {
    return null;
  }

  const [user] = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
}
