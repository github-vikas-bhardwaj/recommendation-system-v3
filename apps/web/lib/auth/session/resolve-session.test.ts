import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const USER_ID = "851b2dd4-17ad-4d83-8df4-59c4abb3feb8";
const storedUser = {
  id: USER_ID,
  firstName: "Vikas",
  lastName: "Bhardwaj",
  email: "vikas@example.com",
};

const {
  limit,
  where,
  from,
  select,
  verifyAccessToken,
  refreshSession,
  getUserIdFromValidRefreshToken,
} = vi.hoisted(() => ({
  limit: vi.fn(),
  where: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  verifyAccessToken: vi.fn(),
  refreshSession: vi.fn(),
  getUserIdFromValidRefreshToken: vi.fn(),
}));

limit.mockResolvedValue([storedUser]);
where.mockImplementation(() => ({ limit }));
from.mockImplementation(() => ({ where }));
select.mockImplementation(() => ({ from }));

vi.mock("@/lib/db", () => ({ db: { select } }));
vi.mock("@/lib/db/schema", () => ({
  users: { id: "id", firstName: "first_name", lastName: "last_name", email: "email" },
}));
vi.mock("./verify-access-token", () => ({ verifyAccessToken }));
vi.mock("./session.server", () => ({
  refreshSession,
  getUserIdFromValidRefreshToken,
  SessionInvalidError: class SessionInvalidError extends Error {
    constructor(message = "Invalid session") {
      super(message);
      this.name = "SessionInvalidError";
    }
  },
}));

import { getSessionUserReadOnly, resolveSession } from "./resolve-session";
import { SessionInvalidError } from "./session.server";

describe("resolveSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limit.mockResolvedValue([storedUser]);
    verifyAccessToken.mockResolvedValue({ sub: USER_ID });
  });

  it("returns user when access token is valid", async () => {
    const result = await resolveSession("valid-access", "refresh-token");

    expect(result).toEqual({
      status: "authenticated",
      user: storedUser,
      refreshed: false,
    });
    expect(refreshSession).not.toHaveBeenCalled();
  });

  it("refreshes session when access token is expired", async () => {
    verifyAccessToken
      .mockRejectedValueOnce(new Error("expired"))
      .mockResolvedValueOnce({ sub: USER_ID });
    refreshSession.mockResolvedValue({
      accessToken: "new-access",
      refreshToken: "new-refresh",
      refreshExpiresAt: new Date(Date.now() + 60_000),
    });

    const result = await resolveSession("expired-access", "valid-refresh");

    expect(result).toEqual({
      status: "authenticated",
      user: storedUser,
      refreshed: true,
      tokens: { accessToken: "new-access", refreshToken: "new-refresh" },
      refreshExpiresAt: expect.any(Date),
    });
  });

  it("returns unauthenticated when both tokens are missing", async () => {
    const result = await resolveSession(undefined, undefined);

    expect(result).toEqual({ status: "unauthenticated", cleared: false });
  });

  it("returns unauthenticated and cleared when refresh token is invalid", async () => {
    verifyAccessToken.mockRejectedValue(new Error("expired"));
    refreshSession.mockRejectedValue(new SessionInvalidError());

    const result = await resolveSession("expired-access", "invalid-refresh");

    expect(result).toEqual({ status: "unauthenticated", cleared: true });
  });
});

describe("getSessionUserReadOnly", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limit.mockResolvedValue([storedUser]);
    verifyAccessToken.mockResolvedValue({ sub: USER_ID });
  });

  it("returns user from a valid access token", async () => {
    const user = await getSessionUserReadOnly("valid-access", "refresh-token");

    expect(user).toEqual(storedUser);
    expect(getUserIdFromValidRefreshToken).not.toHaveBeenCalled();
  });

  it("falls back to refresh token without rotating session", async () => {
    verifyAccessToken.mockRejectedValue(new Error("expired"));
    getUserIdFromValidRefreshToken.mockResolvedValue(USER_ID);

    const user = await getSessionUserReadOnly("expired-access", "valid-refresh");

    expect(user).toEqual(storedUser);
    expect(getUserIdFromValidRefreshToken).toHaveBeenCalledWith("valid-refresh");
    expect(refreshSession).not.toHaveBeenCalled();
  });

  it("returns null when both tokens are missing or invalid", async () => {
    verifyAccessToken.mockRejectedValue(new Error("expired"));
    getUserIdFromValidRefreshToken.mockResolvedValue(null);

    const user = await getSessionUserReadOnly("expired-access", "invalid-refresh");

    expect(user).toBeNull();
  });
});
