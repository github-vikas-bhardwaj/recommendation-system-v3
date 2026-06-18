import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUser = {
  id: "851b2dd4-17ad-4d83-8df4-59c4abb3feb8",
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

import { GET } from "./route";

function meRequest(): NextRequest {
  return new NextRequest("http://localhost/api/auth/me");
}

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuth.mockResolvedValue(mockUser);
  });

  it("returns 200 with user when authenticated", async () => {
    const response = await GET(meRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ user: mockUser });
  });

  it("returns 401 when not authenticated", async () => {
    requireAuth.mockRejectedValue(new UnauthorizedError());

    const response = await GET(meRequest());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns 500 for unexpected errors", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    requireAuth.mockRejectedValue(new Error("database unavailable"));

    const response = await GET(meRequest());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Something went wrong" });
    consoleError.mockRestore();
  });
});
