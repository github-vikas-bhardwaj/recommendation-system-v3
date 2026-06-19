import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { resolveSession } = vi.hoisted(() => ({
  resolveSession: vi.fn(),
}));

vi.mock("@/lib/auth/session/resolve-session", () => ({
  resolveSession,
}));

import { GET } from "./route";

function refreshRequest(path = "/api/auth/refresh?redirect=%2Frecommend", cookies?: string) {
  return new NextRequest(`http://localhost${path}`, {
    headers: cookies ? { Cookie: cookies } : undefined,
  });
}

describe("GET /api/auth/refresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects back with new cookies when session is refreshed", async () => {
    resolveSession.mockResolvedValue({
      status: "authenticated",
      user: { id: "user-id", firstName: "Vikas", lastName: null, email: "v@example.com" },
      refreshed: true,
      tokens: { accessToken: "new-access", refreshToken: "new-refresh" },
      refreshExpiresAt: new Date(Date.now() + 60_000),
    });

    const response = await GET(
      refreshRequest("/api/auth/refresh?redirect=%2Frecommend", "refresh_token=old-refresh")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/recommend");
    expect(response.cookies.get("access_token")?.value).toBe("new-access");
    expect(response.cookies.get("refresh_token")?.value).toBe("new-refresh");
  });

  it("redirects to signin and clears cookies when refresh token is expired", async () => {
    resolveSession.mockResolvedValue({ status: "unauthenticated", cleared: true });

    const response = await GET(
      refreshRequest("/api/auth/refresh?redirect=%2Frecommend", "refresh_token=expired")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/signin");
    expect(response.cookies.get("access_token")?.value).toBe("");
    expect(response.cookies.get("refresh_token")?.value).toBe("");
  });

  it("redirects back without setting cookies when access token is still valid", async () => {
    resolveSession.mockResolvedValue({
      status: "authenticated",
      user: { id: "user-id", firstName: "Vikas", lastName: null, email: "v@example.com" },
      refreshed: false,
    });

    const response = await GET(
      refreshRequest("/api/auth/refresh?redirect=%2Frecommend", "access_token=valid-access")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/recommend");
    expect(response.cookies.get("access_token")).toBeUndefined();
  });
});
