import "server-only";

import type { NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "./cookies";
import { resolveSession } from "./resolve-session";
import type { SessionTokens, SessionUser } from "./session.types";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export type RequireAuthResult = {
  user: SessionUser;
  tokens?: SessionTokens;
  refreshExpiresAt?: Date;
};

export async function requireAuth(req: NextRequest): Promise<RequireAuthResult> {
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  const result = await resolveSession(accessToken, refreshToken);

  if (result.status === "unauthenticated") {
    throw new UnauthorizedError();
  }

  return {
    user: result.user,
    tokens: result.refreshed ? result.tokens : undefined,
    refreshExpiresAt: result.refreshed ? result.refreshExpiresAt : undefined,
  };
}
