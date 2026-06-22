import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("jwt", () => {
  beforeEach(() => {
    vi.stubEnv("JWT_SECRET", "test-secret-at-least-32-characters-long");
    vi.stubEnv("JWT_ACCESS_EXPIRES_IN", "15m");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("signs and verifies an access token", async () => {
    const { signAccessToken, verifyAccessToken } = await import("./jwt");

    const userId = "851b2dd4-17ad-4d83-8df4-59c4abb3feb8";
    const token = await signAccessToken(userId);
    const payload = await verifyAccessToken(token);

    expect(payload.sub).toBe(userId);
  });

  it("rejects a token signed with a different secret", async () => {
    const { signAccessToken, verifyAccessToken } = await import("./jwt");

    const token = await signAccessToken("851b2dd4-17ad-4d83-8df4-59c4abb3feb8");

    vi.stubEnv("JWT_SECRET", "different-secret-at-least-32-chars");

    await expect(verifyAccessToken(token)).rejects.toThrow();
  });
});
