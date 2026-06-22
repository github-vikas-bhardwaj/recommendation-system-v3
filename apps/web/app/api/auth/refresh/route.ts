import { NextRequest, NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  clearSessionCookies,
  REFRESH_TOKEN_COOKIE,
  setSessionCookies,
} from "@/lib/auth/session/cookies";
import { resolveSession } from "@/lib/auth/session/resolve-session";
import { protectRefreshRoute, rateLimitMessage } from "@/lib/security/arcjet";

export async function GET(req: NextRequest) {
  const decision = await protectRefreshRoute(req);
  if (decision.isDenied()) {
    return NextResponse.json({ error: rateLimitMessage(decision) }, { status: 429 });
  }

  const redirectTo = req.nextUrl.searchParams.get("redirect") ?? "/";
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  const result = await resolveSession(accessToken, refreshToken);

  if (result.status === "unauthenticated") {
    const response = NextResponse.redirect(new URL("/signin", req.url));
    clearSessionCookies(response);
    return response;
  }

  if (result.refreshed) {
    const response = NextResponse.redirect(new URL(redirectTo, req.url));
    setSessionCookies(response, result.tokens, result.refreshExpiresAt);
    return response;
  }

  return NextResponse.redirect(new URL(redirectTo, req.url));
}
