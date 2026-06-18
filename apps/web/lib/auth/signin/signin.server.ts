import "server-only";

import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

import type { SigninInput } from "./signin.schema";
import type { SigninResponse } from "./signin.types";

export async function authenticateUser(input: SigninInput): Promise<SigninResponse> {
  const [user] = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (!user) {
    throw new SigninInvalidCredentialsError();
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new SigninInvalidCredentialsError();
  }

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  };
}

export class SigninInvalidCredentialsError extends Error {
  constructor(message = "Invalid email or password") {
    super(message);
    this.name = "SigninInvalidCredentialsError";
  }
}
