import "server-only";

import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { isUniqueViolation } from "@/lib/auth/db-errors";
import type { SignupInput } from "./signup.schema";
import type { SignupResponse } from "./signup.types";

export async function createUser(input: SignupInput): Promise<SignupResponse> {
  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    const [user] = await db
      .insert(users)
      .values({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        passwordHash,
      })
      .returning({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      });

    return { user };
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new SignupConflictError("Email already registered");
    }
    throw error;
  }
}

export class SignupConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SignupConflictError";
  }
}
