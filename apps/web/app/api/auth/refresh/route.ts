import {
  clearSessionCookies,
  REFRESH_TOKEN_COOKIE,
  setSessionCookies,
} from "@/lib/auth/session/cookies";
import { refreshSession, SessionInvalidError } from "@/lib/auth/session/session.server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (!refreshToken) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      clearSessionCookies(response);
      return response;
    }

    const tokens = await refreshSession(refreshToken);

    const response = NextResponse.json({ ok: true }, { status: 200 });
    setSessionCookies(response, tokens);
    return response;
  } catch (error) {
    if (error instanceof SessionInvalidError) {
      const response = NextResponse.json({ error: error.message }, { status: 401 });
      clearSessionCookies(response);
      return response;
    }
    console.error("[/api/auth/refresh]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
