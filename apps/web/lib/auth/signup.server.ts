import "server-only";

import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import type { SignupInput } from "./signup.schema";
import type { SignupResponse } from "./signup.types";

type StoredUser = SignupResponse["user"] & {
  passwordHash: string;
};
// Temporary in-memory store — replace with DB later
const usersByEmail = new Map<string, StoredUser>();

export async function createUser(input: SignupInput): Promise<SignupResponse> {
  if (usersByEmail.has(input.email)) {
    throw new SignupConflictError("Email already registered");
  }
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user: StoredUser = {
    id: randomUUID(),
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    passwordHash,
  };
  usersByEmail.set(user.email, user);
  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  };
}

export class SignupConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SignupConflictError";
  }
}
