import { signinSchema } from "@/lib/auth/signin.schema";
import { authenticateUser, SigninInvalidCredentialsError } from "@/lib/auth/signin.server";
import { SigninResponse } from "@/lib/auth/signin.types";
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
        {
          status: 400,
        }
      );
    }

    const response: SigninResponse = await authenticateUser(result.data);
    return NextResponse.json(response, { status: 200 });
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
