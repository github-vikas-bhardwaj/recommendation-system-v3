import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { refreshSession } = vi.hoisted(() => ({
  refreshSession: vi.fn(),
}));

vi.mock("@/lib/auth/session/session.server", () => ({
  refreshSession,
  SessionInvalidError: class SessionInvalidError extends Error {
    constructor(message = "Invalid session") {
      super(message);
      this.name = "SessionInvalidError";
    }
  },
}));

import { SessionInvalidError } from "@/lib/auth/session/session.server";

import { POST } from "./route";

function refreshRequest(refreshToken?: string): NextRequest {
  if (refreshToken) {
    return new NextRequest("http://localhost/api/auth/refresh", {
      method: "POST",
      headers: { Cookie: `refresh_token=${refreshToken}` },
    });
  }
  return new NextRequest("http://localhost/api/auth/refresh", { method: "POST" });
}

describe("POST /api/auth/refresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    refreshSession.mockResolvedValue({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
    });
  });

  it("returns 200 and rotates cookies when refresh token is valid", async () => {
    const response = await POST(refreshRequest("old-refresh-token"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(refreshSession).toHaveBeenCalledWith("old-refresh-token");

    expect(response.cookies.get("access_token")?.value).toBe("new-access-token");
    expect(response.cookies.get("refresh_token")?.value).toBe("new-refresh-token");
  });

  it("returns 401 and clears cookies when refresh token is missing", async () => {
    const response = await POST(refreshRequest());

    expect(response.status).toBe(401);
    expect(refreshSession).not.toHaveBeenCalled();
    expect(response.cookies.get("access_token")?.value).toBe("");
    expect(response.cookies.get("refresh_token")?.value).toBe("");
  });

  it("returns 401 and clears cookies when refresh token is invalid", async () => {
    refreshSession.mockRejectedValue(new SessionInvalidError());

    const response = await POST(refreshRequest("invalid-refresh-token"));

    expect(response.status).toBe(401);
    expect(response.cookies.get("access_token")?.value).toBe("");
    expect(response.cookies.get("refresh_token")?.value).toBe("");
  });

  it("returns 500 for unexpected errors", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    refreshSession.mockRejectedValue(new Error("database unavailable"));

    const response = await POST(refreshRequest("old-refresh-token"));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Something went wrong" });
    consoleError.mockRestore();
  });
});
