import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const PLAIN_REFRESH = "plain-refresh-token";
const TOKEN_HASH = "hashed-refresh-token";
const USER_ID = "851b2dd4-17ad-4d83-8df4-59c4abb3feb8";

const { limit, where, from, select, set, update, values, insert } = vi.hoisted(() => ({
  limit: vi.fn(),
  where: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
  values: vi.fn(),
  insert: vi.fn(),
}));

// chain: select().from().where().limit()
limit.mockResolvedValue([]);
where.mockImplementation(() => ({ limit }));
from.mockImplementation(() => ({ where }));
select.mockImplementation(() => ({ from }));

// chain: update().set().where()
where.mockImplementation(() => Promise.resolve());
set.mockImplementation(() => ({ where }));
update.mockImplementation(() => ({ set }));

// chain: insert().values()
values.mockResolvedValue(undefined);
insert.mockImplementation(() => ({ values }));

vi.mock("@/lib/db", () => ({
  db: { select, insert, update },
}));

vi.mock("@/lib/db/schema", () => ({
  refreshTokens: {
    id: "id",
    userId: "user_id",
    refreshTokenHash: "token_hash",
    expiresAt: "expires_at",
    revokedAt: "revoked_at",
  },
}));

vi.mock("./refresh-token", () => ({
  generateRefreshToken: () => PLAIN_REFRESH,
  hashRefreshToken: () => TOKEN_HASH,
}));

vi.mock("./jwt", () => ({
  signAccessToken: vi.fn().mockResolvedValue("signed-access-token"),
}));

import {
  createSession,
  refreshSession,
  revokeSession,
  SessionInvalidError,
} from "./session.server";

describe("createSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    values.mockResolvedValue(undefined);
    insert.mockImplementation(() => ({ values }));
  });

  it("inserts refresh token and returns token pair", async () => {
    const tokens = await createSession(USER_ID);

    expect(insert).toHaveBeenCalled();
    expect(tokens.accessToken).toBe("signed-access-token");
    expect(tokens.refreshToken).toBe(PLAIN_REFRESH);
    expect(tokens.refreshExpiresAt).toBeInstanceOf(Date);
  });
});

describe("refreshSession", () => {
  const originalExpiresAt = new Date(Date.now() + 60_000);

  beforeEach(() => {
    vi.clearAllMocks();
    limit.mockResolvedValue([
      {
        id: "token-row-id",
        userId: USER_ID,
        expiresAt: originalExpiresAt,
      },
    ]);
    where.mockImplementation(() => ({ limit }));
    from.mockImplementation(() => ({ where }));
    select.mockImplementation(() => ({ from }));
    set.mockImplementation(() => ({ where: vi.fn().mockResolvedValue(undefined) }));
    update.mockImplementation(() => ({ set }));
    values.mockResolvedValue(undefined);
    insert.mockImplementation(() => ({ values }));
  });

  it("rotates session when refresh token is valid", async () => {
    const tokens = await refreshSession(PLAIN_REFRESH);

    expect(update).toHaveBeenCalled(); // revoke old
    expect(insert).toHaveBeenCalled(); // new row
    expect(tokens.accessToken).toBe("signed-access-token");
    expect(tokens.refreshExpiresAt).toEqual(originalExpiresAt);
  });

  it("throws when refresh token is not found", async () => {
    limit.mockResolvedValue([]);

    await expect(refreshSession(PLAIN_REFRESH)).rejects.toBeInstanceOf(SessionInvalidError);
  });

  it("throws when refresh token is expired", async () => {
    limit.mockResolvedValue([
      {
        id: "token-row-id",
        userId: USER_ID,
        expiresAt: new Date(Date.now() - 60_000),
      },
    ]);

    await expect(refreshSession(PLAIN_REFRESH)).rejects.toBeInstanceOf(SessionInvalidError);
  });
});

describe("revokeSession", () => {
  it("updates revokedAt for matching token", async () => {
    const whereMock = vi.fn().mockResolvedValue(undefined);
    set.mockImplementation(() => ({ where: whereMock }));
    update.mockImplementation(() => ({ set }));

    await revokeSession(PLAIN_REFRESH);

    expect(update).toHaveBeenCalled();
    expect(whereMock).toHaveBeenCalled();
  });
});
