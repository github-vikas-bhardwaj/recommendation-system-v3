import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { cookies, revokeSession, clearSessionCookiesInStore, redirect } = vi.hoisted(() => ({
  cookies: vi.fn(),
  revokeSession: vi.fn(),
  clearSessionCookiesInStore: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("next/headers", () => ({
  cookies,
}));

vi.mock("@/lib/auth/session/cookies", () => ({
  REFRESH_TOKEN_COOKIE: "refresh_token",
  clearSessionCookiesInStore,
}));

vi.mock("@/lib/auth/session/session.server", () => ({
  revokeSession,
}));

import { signoutAction } from "./signout.action";

describe("signoutAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearSessionCookiesInStore.mockResolvedValue(undefined);
    revokeSession.mockResolvedValue(undefined);
  });

  it("revokes the session, clears cookies, and redirects home", async () => {
    cookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "plain-refresh-token" }),
    });

    await expect(signoutAction()).rejects.toThrow("REDIRECT:/");

    expect(revokeSession).toHaveBeenCalledWith("plain-refresh-token");
    expect(clearSessionCookiesInStore).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("clears cookies and redirects when refresh token is missing", async () => {
    cookies.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    });

    await expect(signoutAction()).rejects.toThrow("REDIRECT:/");

    expect(revokeSession).not.toHaveBeenCalled();
    expect(clearSessionCookiesInStore).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("still clears cookies and redirects when revoke fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    cookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "plain-refresh-token" }),
    });
    revokeSession.mockRejectedValue(new Error("database unavailable"));

    await expect(signoutAction()).rejects.toThrow("REDIRECT:/");

    expect(clearSessionCookiesInStore).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith("/");
    consoleError.mockRestore();
  });
});
