import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const USER_ID = "851b2dd4-17ad-4d83-8df4-59c4abb3feb8";

const mockUser = {
  id: USER_ID,
  firstName: "Vikas",
  lastName: "Bhardwaj",
  email: "vikas@example.com",
};

const { requireAuth } = vi.hoisted(() => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/auth/session/require-auth", () => ({
  requireAuth,
  UnauthorizedError: class UnauthorizedError extends Error {
    constructor(message = "Unauthorized") {
      super(message);
      this.name = "UnauthorizedError";
    }
  },
}));

import { UnauthorizedError } from "@/lib/auth/session/require-auth";

import { POST } from "./route";

function recommendRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/recommend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("AI_API_URL", "http://localhost:8000");
    requireAuth.mockResolvedValue({ user: mockUser });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns 401 and clears cookies when not authenticated", async () => {
    requireAuth.mockRejectedValue(new UnauthorizedError());

    const response = await POST(recommendRequest({ input: "hello" }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(response.cookies.get("access_token")?.value).toBe("");
    expect(response.cookies.get("refresh_token")?.value).toBe("");
  });

  it("returns 400 when input is invalid", async () => {
    const response = await POST(recommendRequest({ input: "" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid input" });
  });

  it("proxies to FastAPI with X-User-Id when authenticated", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ output: "recommendation" }), { status: 200 })
      );
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(recommendRequest({ input: "  sci-fi books  " }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ output: "recommendation" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/recommend/invoke",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": USER_ID,
        },
        body: JSON.stringify({ input: { input: "sci-fi books" } }),
      })
    );
  });

  it("returns 502 when FastAPI fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("upstream error", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(recommendRequest({ input: "hello" }));

    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.error).toBe("Recommendation service failed");
  });
});
