import { beforeEach, describe, expect, it, vi } from "vitest";

import type { SigninInput } from "./signin.schema";

vi.mock("server-only", () => ({}));

const { limit, where, from, select, compare } = vi.hoisted(() => ({
  limit: vi.fn(),
  where: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  compare: vi.fn(),
}));

where.mockImplementation(() => ({ limit }));
from.mockImplementation(() => ({ where }));
select.mockImplementation(() => ({ from }));
compare.mockResolvedValue(true);

vi.mock("@/lib/db", () => ({
  db: { select },
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
  default: { compare },
}));

import { authenticateUser, SigninInvalidCredentialsError } from "./signin.server";

const signinInput: SigninInput = {
  email: "vikas@example.com",
  password: "Password123!",
};

const storedUser = {
  id: "851b2dd4-17ad-4d83-8df4-59c4abb3feb8",
  firstName: "Vikas",
  lastName: "Bhardwaj",
  email: "vikas@example.com",
  passwordHash: "hashed-password",
};

describe("authenticateUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limit.mockResolvedValue([storedUser]);
    where.mockImplementation(() => ({ limit }));
    from.mockImplementation(() => ({ where }));
    select.mockImplementation(() => ({ from }));
    compare.mockResolvedValue(true);
  });

  it("returns user without passwordHash when credentials are valid", async () => {
    const response = await authenticateUser(signinInput);

    expect(compare).toHaveBeenCalledWith("Password123!", "hashed-password");
    expect(response).toEqual({
      user: {
        id: storedUser.id,
        firstName: storedUser.firstName,
        lastName: storedUser.lastName,
        email: storedUser.email,
      },
    });
  });

  it("throws SigninInvalidCredentialsError when user is not found", async () => {
    limit.mockResolvedValue([]);

    await expect(authenticateUser(signinInput)).rejects.toBeInstanceOf(
      SigninInvalidCredentialsError
    );
    await expect(authenticateUser(signinInput)).rejects.toThrow("Invalid email or password");
    expect(compare).not.toHaveBeenCalled();
  });

  it("throws SigninInvalidCredentialsError when password does not match", async () => {
    compare.mockResolvedValue(false);

    await expect(authenticateUser(signinInput)).rejects.toBeInstanceOf(
      SigninInvalidCredentialsError
    );
    await expect(authenticateUser(signinInput)).rejects.toThrow("Invalid email or password");
  });
});
