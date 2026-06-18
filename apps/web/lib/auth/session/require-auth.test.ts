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

const { limit, where, from, select, verifyAccessToken } = vi.hoisted(() => ({
  limit: vi.fn(),
  where: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  verifyAccessToken: vi.fn(),
}));

limit.mockResolvedValue([storedUser]);
where.mockImplementation(() => ({ limit }));
from.mockImplementation(() => ({ where }));
select.mockImplementation(() => ({ from }));

vi.mock("@/lib/db", () => ({ db: { select } }));
vi.mock("@/lib/db/schema", () => ({
  users: { id: "id", firstName: "first_name", lastName: "last_name", email: "email" },
}));
vi.mock("./jwt", () => ({ verifyAccessToken }));

import { requireAuth, UnauthorizedError } from "./require-auth";

function requestWithCookie(token?: string): NextRequest {
  if (token) {
    return new NextRequest("http://localhost/api/auth/me", {
      headers: { Cookie: `access_token=${token}` },
    });
  }
  return new NextRequest("http://localhost/api/auth/me");
}

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limit.mockResolvedValue([storedUser]);
    verifyAccessToken.mockResolvedValue({ sub: USER_ID });
  });

  it("returns user when access token is valid", async () => {
    const user = await requireAuth(requestWithCookie("valid-token"));
    expect(user).toEqual(storedUser);
  });

  it("throws when cookie is missing", async () => {
    await expect(requireAuth(requestWithCookie())).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("throws when JWT verification fails", async () => {
    verifyAccessToken.mockRejectedValue(new Error("invalid"));
    await expect(requireAuth(requestWithCookie("bad-token"))).rejects.toBeInstanceOf(
      UnauthorizedError
    );
  });

  it("throws when user no longer exists", async () => {
    limit.mockResolvedValue([]);
    await expect(requireAuth(requestWithCookie("valid-token"))).rejects.toBeInstanceOf(
      UnauthorizedError
    );
  });
});
