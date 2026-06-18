import { NextRequest, NextResponse } from "next/server";

import { requireAuth, UnauthorizedError } from "@/lib/auth/session/require-auth";
import type { SessionUser } from "@/lib/auth/session/session.types";

export type MeResponse = {
  user: SessionUser;
};

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    return NextResponse.json({ user } satisfies MeResponse, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[/api/auth/me]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
