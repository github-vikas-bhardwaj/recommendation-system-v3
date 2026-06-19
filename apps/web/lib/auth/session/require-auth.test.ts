import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const USER_ID = "851b2dd4-17ad-4d83-8df4-59c4abb3feb8";
const storedUser = {
  id: USER_ID,
  firstName: "Vikas",
  lastName: "Bhardwaj",
  email: "vikas@example.com",
};

const { resolveSession } = vi.hoisted(() => ({
  resolveSession: vi.fn(),
}));

vi.mock("./resolve-session", () => ({ resolveSession }));

import { requireAuth, UnauthorizedError } from "./require-auth";

function requestWithCookies(accessToken?: string, refreshToken?: string): NextRequest {
  const cookieParts = [
    accessToken ? `access_token=${accessToken}` : null,
    refreshToken ? `refresh_token=${refreshToken}` : null,
  ].filter(Boolean);

  return new NextRequest("http://localhost/api/recommend", {
    headers: cookieParts.length > 0 ? { Cookie: cookieParts.join("; ") } : undefined,
  });
}

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveSession.mockResolvedValue({
      status: "authenticated",
      user: storedUser,
      refreshed: false,
    });
  });

  it("returns user when access token is valid", async () => {
    const result = await requireAuth(requestWithCookies("valid-token"));

    expect(result.user).toEqual(storedUser);
    expect(result.tokens).toBeUndefined();
    expect(resolveSession).toHaveBeenCalledWith("valid-token", undefined);
  });

  it("returns refreshed tokens when session was renewed", async () => {
    resolveSession.mockResolvedValue({
      status: "authenticated",
      user: storedUser,
      refreshed: true,
      tokens: { accessToken: "new-access", refreshToken: "new-refresh" },
      refreshExpiresAt: new Date(Date.now() + 60_000),
    });

    const result = await requireAuth(requestWithCookies(undefined, "refresh-token"));

    expect(result.user).toEqual(storedUser);
    expect(result.tokens).toEqual({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    });
    expect(result.refreshExpiresAt).toBeInstanceOf(Date);
  });

  it("throws when session cannot be resolved", async () => {
    resolveSession.mockResolvedValue({ status: "unauthenticated", cleared: true });

    await expect(requireAuth(requestWithCookies())).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
