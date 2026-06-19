import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { refreshTokens } from "@/lib/db/schema";

import { signAccessToken } from "./jwt";
import { generateRefreshToken, hashRefreshToken } from "./refresh-token";
import type { IssuedSession } from "./session.types";
import { getAccessTokenMaxAgeSeconds, getRefreshTokenMaxAgeSeconds } from "./token-expiry";

export class SessionInvalidError extends Error {
  constructor(message = "Invalid session") {
    super(message);
    this.name = "SessionInvalidError";
  }
}

function getRefreshExpiresAt(): Date {
  const expiresAt = new Date();
  // Absolute session end = access lifetime + refresh grace after access expires.
  expiresAt.setSeconds(
    expiresAt.getSeconds() + getAccessTokenMaxAgeSeconds() + getRefreshTokenMaxAgeSeconds()
  );
  return expiresAt;
}

export async function createSession(
  userId: string,
  options?: { refreshExpiresAt?: Date }
): Promise<IssuedSession> {
  const refreshExpiresAt = options?.refreshExpiresAt ?? getRefreshExpiresAt();
  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);

  await db.insert(refreshTokens).values({
    userId,
    tokenHash,
    expiresAt: refreshExpiresAt,
  });

  const accessToken = await signAccessToken(userId);

  return { accessToken, refreshToken, refreshExpiresAt };
}

export async function refreshSession(plainRefreshToken: string): Promise<IssuedSession> {
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

  // Issue a new pair but keep the original absolute refresh expiry.
  return createSession(storedToken.userId, { refreshExpiresAt: storedToken.expiresAt });
}

export async function revokeSession(plainRefreshToken: string): Promise<void> {
  const tokenHash = hashRefreshToken(plainRefreshToken);

  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt)));
}
