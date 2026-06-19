import { type NextRequest, NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/session/cookie-names";
import { verifyAccessToken } from "@/lib/auth/session/verify-access-token";

export async function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (accessToken) {
    try {
      await verifyAccessToken(accessToken);
      return NextResponse.next();
    } catch {
      // Access token expired — refresh via route handler.
    }
  }

  const redirect = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const refreshUrl = new URL("/api/auth/refresh", request.url);
  refreshUrl.searchParams.set("redirect", redirect);

  return NextResponse.redirect(refreshUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
