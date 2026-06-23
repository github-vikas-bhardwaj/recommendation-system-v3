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

async function findValidRefreshToken(plainRefreshToken: string) {
  const refreshTokenHash = hashRefreshToken(plainRefreshToken);
  const [storedToken] = await db
    .select({
      id: refreshTokens.id,
      userId: refreshTokens.userId,
      expiresAt: refreshTokens.expiresAt,
    })
    .from(refreshTokens)
    .where(
      and(eq(refreshTokens.refreshTokenHash, refreshTokenHash), isNull(refreshTokens.revokedAt))
    )
    .limit(1);

  if (!storedToken || storedToken.expiresAt < new Date()) {
    return null;
  }

  return storedToken;
}

export async function getUserIdFromValidRefreshToken(
  plainRefreshToken: string
): Promise<string | null> {
  const storedToken = await findValidRefreshToken(plainRefreshToken);

  return storedToken?.userId ?? null;
}

export async function createSession(
  userId: string,
  options?: { refreshExpiresAt?: Date }
): Promise<IssuedSession> {
  const refreshExpiresAt = options?.refreshExpiresAt ?? getRefreshExpiresAt();
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);

  await db.insert(refreshTokens).values({
    userId,
    refreshTokenHash,
    expiresAt: refreshExpiresAt,
  });

  const accessToken = await signAccessToken(userId);

  return { accessToken, refreshToken, refreshExpiresAt };
}

export async function refreshSession(plainRefreshToken: string): Promise<IssuedSession> {
  const storedToken = await findValidRefreshToken(plainRefreshToken);

  if (!storedToken) {
    throw new SessionInvalidError();
  }

  // rotate: revoke old refresh token
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.id, storedToken.id));

  // Issue a new pair but keep the original absolute refresh expiry.
  return createSession(storedToken.userId, { refreshExpiresAt: storedToken.expiresAt });
}

export async function revokeSession(plainRefreshToken: string): Promise<void> {
  const refreshTokenHash = hashRefreshToken(plainRefreshToken);

  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(refreshTokens.refreshTokenHash, refreshTokenHash), isNull(refreshTokens.revokedAt))
    );
}
