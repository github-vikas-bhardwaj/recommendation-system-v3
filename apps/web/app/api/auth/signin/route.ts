import { signinSchema } from "@/lib/auth/signin/signin.schema";
import { authenticateUser, SigninInvalidCredentialsError } from "@/lib/auth/signin/signin.server";
import type { SigninResponse } from "@/lib/auth/signin/signin.types";
import { setSessionCookies } from "@/lib/auth/session/cookies";
import { createSession } from "@/lib/auth/session/session.server";
import { NextRequest, NextResponse } from "next/server";
import { flattenError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = signinSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: flattenError(result.error).fieldErrors,
        },
        { status: 400 }
      );
    }

    const { user } = await authenticateUser(result.data);
    const tokens = await createSession(user.id);

    const response = NextResponse.json({ user } satisfies SigninResponse, { status: 200 });
    setSessionCookies(response, tokens);
    return response;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    if (error instanceof SigninInvalidCredentialsError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[/api/auth/signin]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
