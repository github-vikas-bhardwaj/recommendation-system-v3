import { NextRequest, NextResponse } from "next/server";
import { flattenError } from "zod";
import { signupSchema } from "@/lib/auth/signup.schema";
import type { SignupResponse } from "@/lib/auth/signup.types";
import { createUser, SignupConflictError } from "@/lib/auth/signup.server";

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: flattenError(result.error).fieldErrors,
        },
        { status: 400 }
      );
    }
    const response: SignupResponse = await createUser(result.data);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    if (error instanceof SignupConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("[/api/auth/signup]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
