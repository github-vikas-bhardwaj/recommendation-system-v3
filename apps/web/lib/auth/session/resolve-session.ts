import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

import {
  getUserIdFromValidRefreshToken,
  refreshSession,
  SessionInvalidError,
} from "./session.server";
import type { SessionTokens, SessionUser } from "./session.types";
import { verifyAccessToken } from "./verify-access-token";

export type ResolvedSession =
  | { status: "authenticated"; user: SessionUser; refreshed: false }
  | {
      status: "authenticated";
      user: SessionUser;
      refreshed: true;
      tokens: SessionTokens;
      refreshExpiresAt: Date;
    }
  | { status: "unauthenticated"; cleared: boolean };

async function loadUserById(userId: string): Promise<SessionUser | null> {
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

async function resolveUserFromAccessToken(
  accessToken: string | undefined
): Promise<SessionUser | null> {
  if (!accessToken) {
    return null;
  }

  let userId: string;
  try {
    ({ sub: userId } = await verifyAccessToken(accessToken));
  } catch {
    return null;
  }

  return loadUserById(userId);
}

export async function resolveSession(
  accessToken: string | undefined,
  refreshToken: string | undefined
): Promise<ResolvedSession> {
  const userFromAccess = await resolveUserFromAccessToken(accessToken);

  if (userFromAccess) {
    return { status: "authenticated", user: userFromAccess, refreshed: false };
  }

  if (!refreshToken) {
    return { status: "unauthenticated", cleared: Boolean(accessToken) };
  }

  try {
    const session = await refreshSession(refreshToken);
    const user = await resolveUserFromAccessToken(session.accessToken);

    if (!user) {
      return { status: "unauthenticated", cleared: true };
    }

    return {
      status: "authenticated",
      user,
      refreshed: true,
      tokens: {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      },
      refreshExpiresAt: session.refreshExpiresAt,
    };
  } catch (error) {
    if (error instanceof SessionInvalidError) {
      return { status: "unauthenticated", cleared: true };
    }

    throw error;
  }
}

export async function getSessionUserReadOnly(
  accessToken: string | undefined,
  refreshToken: string | undefined
): Promise<SessionUser | null> {
  const userFromAccess = await resolveUserFromAccessToken(accessToken);

  if (userFromAccess) {
    return userFromAccess;
  }

  if (!refreshToken) {
    return null;
  }

  const userId = await getUserIdFromValidRefreshToken(refreshToken);

  if (!userId) {
    return null;
  }

  return loadUserById(userId);
}
