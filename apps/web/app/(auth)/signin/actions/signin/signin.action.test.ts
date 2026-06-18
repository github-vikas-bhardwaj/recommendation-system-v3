import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { authenticateUser, createSession, setSessionCookiesInStore, redirect } = vi.hoisted(() => ({
  authenticateUser: vi.fn(),
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

vi.mock("@/lib/auth/signin/signin.server", () => ({
  authenticateUser,
  SigninInvalidCredentialsError: class SigninInvalidCredentialsError extends Error {
    constructor(message = "Invalid email or password") {
      super(message);
      this.name = "SigninInvalidCredentialsError";
    }
  },
}));

import { SigninInvalidCredentialsError } from "@/lib/auth/signin/signin.server";

import { signinAction } from "./signin.action";
import { initialSigninActionState } from "./signin.action.types";

function signinFormData(overrides: Record<string, string> = {}) {
  const data = new FormData();
  const values = {
    email: "vikas@example.com",
    password: "Password123!",
    ...overrides,
  };

  for (const [key, value] of Object.entries(values)) {
    data.set(key, value);
  }

  return data;
}

describe("signinAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a session and redirects to recommend on success", async () => {
    authenticateUser.mockResolvedValue({
      user: {
        id: "851b2dd4-17ad-4d83-8df4-59c4abb3feb8",
        firstName: "Vikas",
        lastName: "Bhardwaj",
        email: "vikas@example.com",
      },
    });
    createSession.mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });

    await expect(signinAction(initialSigninActionState, signinFormData())).rejects.toThrow(
      "REDIRECT:/recommend"
    );

    expect(authenticateUser).toHaveBeenCalledOnce();
    expect(createSession).toHaveBeenCalledWith("851b2dd4-17ad-4d83-8df4-59c4abb3feb8");
    expect(setSessionCookiesInStore).toHaveBeenCalledWith({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
    expect(redirect).toHaveBeenCalledWith("/recommend");
  });

  it("returns field errors when validation fails", async () => {
    const result = await signinAction(
      initialSigninActionState,
      signinFormData({ email: "not-an-email", password: "" })
    );

    expect(authenticateUser).not.toHaveBeenCalled();
    expect(result.fieldErrors?.email ?? result.fieldErrors?.password).toBeDefined();
  });

  it("returns an error when credentials are invalid", async () => {
    authenticateUser.mockRejectedValue(new SigninInvalidCredentialsError());

    const result = await signinAction(initialSigninActionState, signinFormData());

    expect(result.error).toBe("Invalid email or password");
  });

  it("returns a generic error for unexpected failures", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    authenticateUser.mockRejectedValue(new Error("database unavailable"));

    const result = await signinAction(initialSigninActionState, signinFormData());

    expect(result.error).toBe("Something went wrong. Please try again.");
    consoleError.mockRestore();
  });
});
