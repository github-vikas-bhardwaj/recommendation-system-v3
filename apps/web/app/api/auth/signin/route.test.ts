import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { authenticateUser } = vi.hoisted(() => ({
  authenticateUser: vi.fn(),
}));

vi.mock("@/lib/auth/signin.server", () => ({
  authenticateUser,
  SigninInvalidCredentialsError: class SigninInvalidCredentialsError extends Error {
    constructor(message = "Invalid email or password") {
      super(message);
      this.name = "SigninInvalidCredentialsError";
    }
  },
}));

import { POST } from "./route";
import { SigninInvalidCredentialsError } from "@/lib/auth/signin.server";

function signinRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  email: "vikas@example.com",
  password: "Password123!",
};

describe("POST /api/auth/signin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with user on successful signin", async () => {
    authenticateUser.mockResolvedValue({
      user: {
        id: "851b2dd4-17ad-4d83-8df4-59c4abb3feb8",
        firstName: "Vikas",
        lastName: "Bhardwaj",
        email: "vikas@example.com",
      },
    });

    const response = await POST(signinRequest(validBody));

    expect(response.status).toBe(200);
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
      signinRequest({
        ...validBody,
        email: "not-an-email",
      })
    );

    expect(response.status).toBe(400);
    expect(authenticateUser).not.toHaveBeenCalled();
    const body = await response.json();
    expect(body.error).toBe("Validation failed");
    expect(body.details.email).toBeDefined();
  });

  it("returns 401 when credentials are invalid", async () => {
    authenticateUser.mockRejectedValue(new SigninInvalidCredentialsError());

    const response = await POST(signinRequest(validBody));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid email or password",
    });
  });

  it("returns 500 for unexpected errors", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    authenticateUser.mockRejectedValue(new Error("database unavailable"));

    const response = await POST(signinRequest(validBody));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Something went wrong",
    });
    consoleError.mockRestore();
  });
});
