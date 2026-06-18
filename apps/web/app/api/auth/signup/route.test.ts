import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// mock server only
vi.mock("server-only", () => ({}));

const { createUser } = vi.hoisted(() => ({
  createUser: vi.fn(),
}));

vi.mock("@/lib/auth/signup/signup.server", () => ({
  createUser,
  SignupConflictError: class SignupConflictError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "SignupConflictError";
    }
  },
}));

import { POST } from "./route";
import { SignupConflictError } from "@/lib/auth/signup/signup.server";

function signupRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  firstName: "Vikas",
  lastName: "Bhardwaj",
  email: "vikas@example.com",
  password: "Password123!",
  confirmPassword: "Password123!",
};

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 201 with user on successful signup", async () => {
    createUser.mockResolvedValue({
      user: {
        id: "851b2dd4-17ad-4d83-8df4-59c4abb3feb8",
        firstName: "Vikas",
        lastName: "Bhardwaj",
        email: "vikas@example.com",
      },
    });

    const response = await POST(signupRequest(validBody));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      user: {
        id: "851b2dd4-17ad-4d83-8df4-59c4abb3feb8",
        firstName: "Vikas",
        lastName: "Bhardwaj",
        email: "vikas@example.com",
      },
    });
  });

  it("returns 400 when validation fails", async () => {
    const response = await POST(
      signupRequest({
        ...validBody,
        password: "weak",
        confirmPassword: "weak",
      })
    );

    expect(response.status).toBe(400);
    expect(createUser).not.toHaveBeenCalled();
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
    expect(body.details.password).toBeDefined();
  });

  it("returns 409 when email is already registered", async () => {
    createUser.mockRejectedValue(new SignupConflictError("Email already registered"));

    const response = await POST(signupRequest(validBody));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "Email already registered",
    });
  });

  it("returns 500 for unexpected errors", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    createUser.mockRejectedValue(new Error("database unavailable"));

    const response = await POST(signupRequest(validBody));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Something went wrong",
    });
    consoleError.mockRestore();
  });
});
