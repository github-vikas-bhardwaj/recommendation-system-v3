import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "./cookie-names";
import type { SessionTokens } from "./session.types";
import { getAccessTokenMaxAgeSeconds, getRefreshTokenMaxAgeSeconds } from "./token-expiry";

export { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "./cookie-names";

const isProduction = process.env.NODE_ENV === "production";
const useSecureCookies = isProduction || process.env.COOKIE_SECURE === "true";

function cookieOptions(maxAge: number): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: useSecureCookies,
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

function refreshCookieMaxAge(refreshExpiresAt?: Date): number {
  if (!refreshExpiresAt) {
    return getRefreshTokenMaxAgeSeconds();
  }

  return Math.max(0, Math.floor((refreshExpiresAt.getTime() - Date.now()) / 1000));
}

export function setSessionCookies(
  response: NextResponse,
  tokens: SessionTokens,
  refreshExpiresAt?: Date
): void {
  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    cookieOptions(getAccessTokenMaxAgeSeconds())
  );
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    cookieOptions(refreshCookieMaxAge(refreshExpiresAt))
  );
}

export async function setSessionCookiesInStore(
  tokens: SessionTokens,
  refreshExpiresAt?: Date
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    cookieOptions(getAccessTokenMaxAgeSeconds())
  );
  cookieStore.set(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    cookieOptions(refreshCookieMaxAge(refreshExpiresAt))
  );
}

export async function clearSessionCookiesInStore(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
  cookieStore.set(REFRESH_TOKEN_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
}

export function clearSessionCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
}
