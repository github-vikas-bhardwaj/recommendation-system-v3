import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { refreshTokens } from "@/lib/db/schema";

import { signAccessToken } from "./jwt";
import { generateRefreshToken, hashRefreshToken } from "./refresh-token";
import type { SessionTokens } from "./session.types";

export class SessionInvalidError extends Error {
  constructor(message = "Invalid session") {
    super(message);
    this.name = "SessionInvalidError";
  }
}

function getRefreshExpiresAt(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // matches JWT_REFRESH_EXPIRES_IN=7d
  return expiresAt;
}

export async function createSession(userId: string): Promise<SessionTokens> {
  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);

  await db.insert(refreshTokens).values({
    userId,
    tokenHash,
    expiresAt: getRefreshExpiresAt(),
  });

  const accessToken = await signAccessToken(userId);

  return { accessToken, refreshToken };
}

export async function refreshSession(plainRefreshToken: string): Promise<SessionTokens> {
  const tokenHash = hashRefreshToken(plainRefreshToken);

  const [storedToken] = await db
    .select({
      id: refreshTokens.id,
      userId: refreshTokens.userId,
      expiresAt: refreshTokens.expiresAt,
    })
    .from(refreshTokens)
    .where(and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt)))
    .limit(1);

  if (!storedToken) {
    throw new SessionInvalidError();
  }

  if (storedToken.expiresAt < new Date()) {
    throw new SessionInvalidError();
  }

  // rotate: revoke old token
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.id, storedToken.id));

  // issue new pair
  return createSession(storedToken.userId);
}

export async function revokeSession(plainRefreshToken: string): Promise<void> {
  const tokenHash = hashRefreshToken(plainRefreshToken);

  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt)));
}
