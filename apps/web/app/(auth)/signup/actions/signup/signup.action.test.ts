import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { createUser, createSession, setSessionCookiesInStore, redirect } = vi.hoisted(() => ({
  createUser: vi.fn(),
  createSession: vi.fn(),
  setSessionCookiesInStore: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("@/lib/auth/session/cookies", () => ({
  setSessionCookiesInStore,
}));

vi.mock("@/lib/auth/session/session.server", () => ({
  createSession,
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

import { SignupConflictError } from "@/lib/auth/signup/signup.server";

import { signupAction } from "./signup.action";
import { initialSignupActionState } from "./signup.action.types";

function signupFormData(overrides: Record<string, string> = {}) {
  const data = new FormData();
  const values = {
    firstName: "Vikas",
    lastName: "Bhardwaj",
    email: "vikas@example.com",
    password: "Password123!",
    confirmPassword: "Password123!",
    ...overrides,
  };

  for (const [key, value] of Object.entries(values)) {
    data.set(key, value);
  }

  return data;
}

describe("signupAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a session and redirects to recommend on success", async () => {
    createUser.mockResolvedValue({
      user: {
        id: "851b2dd4-17ad-4d83-8df4-59c4abb3feb8",
        firstName: "Vikas",
        lastName: "Bhardwaj",
        email: "vikas@example.com",
      },
    });
    const refreshExpiresAt = new Date("2030-01-01T00:00:00.000Z");
    createSession.mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      refreshExpiresAt,
    });

    await expect(signupAction(initialSignupActionState, signupFormData())).rejects.toThrow(
      "REDIRECT:/recommend"
    );

    expect(createUser).toHaveBeenCalledOnce();
    expect(createSession).toHaveBeenCalledWith("851b2dd4-17ad-4d83-8df4-59c4abb3feb8");
    expect(setSessionCookiesInStore).toHaveBeenCalledWith(
      {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        refreshExpiresAt,
      },
      refreshExpiresAt
    );
    expect(redirect).toHaveBeenCalledWith("/recommend");
  });

  it("returns field errors when validation fails", async () => {
    const result = await signupAction(
      initialSignupActionState,
      signupFormData({ password: "weak", confirmPassword: "weak" })
    );

    expect(createUser).not.toHaveBeenCalled();
    expect(result.fieldErrors?.password).toBeDefined();
  });

  it("returns email field error when email is already registered", async () => {
    createUser.mockRejectedValue(new SignupConflictError("Email already registered"));

    const result = await signupAction(initialSignupActionState, signupFormData());

    expect(result.fieldErrors?.email).toEqual(["Email already registered"]);
  });

  it("returns a generic error for unexpected failures", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    createUser.mockRejectedValue(new Error("database unavailable"));

    const result = await signupAction(initialSignupActionState, signupFormData());

    expect(result.error).toBe("Something went wrong. Please try again.");
    consoleError.mockRestore();
  });
});
