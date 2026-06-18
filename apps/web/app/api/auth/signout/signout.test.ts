import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { revokeSession } = vi.hoisted(() => ({
  revokeSession: vi.fn(),
}));

vi.mock("@/lib/auth/session/session.server", () => ({
  revokeSession,
}));

import { POST } from "./route";

function logoutRequest(refreshToken?: string): NextRequest {
  if (refreshToken) {
    return new NextRequest("http://localhost/api/auth/logout", {
      method: "POST",
      headers: { Cookie: `refresh_token=${refreshToken}` },
    });
  }
  return new NextRequest("http://localhost/api/auth/logout", { method: "POST" });
}

describe("POST /api/auth/logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    revokeSession.mockResolvedValue(undefined);
  });

  it("revokes session and clears cookies when refresh token is present", async () => {
    const response = await POST(logoutRequest("plain-refresh-token"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(revokeSession).toHaveBeenCalledWith("plain-refresh-token");

    expect(response.cookies.get("access_token")?.value).toBe("");
    expect(response.cookies.get("refresh_token")?.value).toBe("");
  });

  it("returns 200 and clears cookies when refresh token is missing", async () => {
    const response = await POST(logoutRequest());

    expect(response.status).toBe(200);
    expect(revokeSession).not.toHaveBeenCalled();
    expect(response.cookies.get("access_token")?.value).toBe("");
    expect(response.cookies.get("refresh_token")?.value).toBe("");
  });

  it("returns 500 and clears cookies on unexpected errors", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    revokeSession.mockRejectedValue(new Error("database unavailable"));

    const response = await POST(logoutRequest("plain-refresh-token"));

    expect(response.status).toBe(500);
    expect(response.cookies.get("access_token")?.value).toBe("");
    expect(response.cookies.get("refresh_token")?.value).toBe("");
    consoleError.mockRestore();
  });
});
