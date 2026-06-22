import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { generateRefreshToken, hashRefreshToken } from "./refresh-token";

describe("refresh-token", () => {
  it("generates unique tokens", () => {
    expect(generateRefreshToken()).not.toBe(generateRefreshToken());
  });

  it("hashes deterministically", () => {
    const token = "test-token-value";
    expect(hashRefreshToken(token)).toBe(hashRefreshToken(token));
  });

  it("produces different hashes for different tokens", () => {
    expect(hashRefreshToken("token-a")).not.toBe(hashRefreshToken("token-b"));
  });
});
