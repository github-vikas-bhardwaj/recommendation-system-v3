import { clearSessionCookies, REFRESH_TOKEN_COOKIE } from "@/lib/auth/session/cookies";
import { revokeSession } from "@/lib/auth/session/session.server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (refreshToken) {
      await revokeSession(refreshToken);
    }

    const response = NextResponse.json({ ok: true }, { status: 200 });
    clearSessionCookies(response);
    return response;
  } catch (error) {
    console.error("[/api/auth/signout]", error);
    const response = NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    clearSessionCookies(response);
    return response;
  }
}
