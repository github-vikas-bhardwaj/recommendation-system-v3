import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SignupInput } from "./signup.schema";

vi.mock("server-only", () => ({}));

const { returning, values, insert, hash } = vi.hoisted(() => ({
  returning: vi.fn(),
  values: vi.fn(),
  insert: vi.fn(),
  hash: vi.fn(),
}));

values.mockImplementation(() => ({ returning }));
insert.mockImplementation(() => ({ values }));
hash.mockResolvedValue("hashed-password");

vi.mock("@/lib/db", () => ({
  db: { insert },
}));

vi.mock("@/lib/db/schema", () => ({
  users: {
    id: "id",
    firstName: "first_name",
    lastName: "last_name",
    email: "email",
    passwordHash: "password_hash",
  },
}));

vi.mock("bcrypt", () => ({
  default: { hash },
}));

import { UNIQUE_VIOLATION_CODE } from "../db-errors";
import { createUser, SignupConflictError } from "./signup.server";

const signupInput: SignupInput = {
  firstName: "Vikas",
  lastName: "Bhardwaj",
  email: "vikas@example.com",
  password: "Password123!",
};

const createdUser = {
  id: "851b2dd4-17ad-4d83-8df4-59c4abb3feb8",
  firstName: "Vikas",
  lastName: "Bhardwaj",
  email: "vikas@example.com",
};

describe("createUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    returning.mockResolvedValue([createdUser]);
    values.mockImplementation(() => ({ returning }));
    insert.mockImplementation(() => ({ values }));
    hash.mockResolvedValue("hashed-password");
  });

  it("hashes password and inserts user without returning passwordHash", async () => {
    const response = await createUser(signupInput);

    expect(hash).toHaveBeenCalledWith("Password123!", 12);
    expect(insert).toHaveBeenCalled();
    expect(values).toHaveBeenCalledWith({
      firstName: "Vikas",
      lastName: "Bhardwaj",
      email: "vikas@example.com",
      passwordHash: "hashed-password",
    });
    expect(response).toEqual({ user: createdUser });
  });

  it("throws SignupConflictError when email is already registered", async () => {
    returning.mockRejectedValue({ code: UNIQUE_VIOLATION_CODE });

    await expect(createUser(signupInput)).rejects.toBeInstanceOf(SignupConflictError);
    await expect(createUser(signupInput)).rejects.toThrow("Email already registered");
  });

  it("rethrows unexpected database errors", async () => {
    returning.mockRejectedValue(new Error("connection refused"));

    await expect(createUser(signupInput)).rejects.toThrow("connection refused");
  });
});
