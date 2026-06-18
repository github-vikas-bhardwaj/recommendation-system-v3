import "server-only";

import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { ACCESS_TOKEN_COOKIE } from "./cookies";
import { verifyAccessToken } from "./jwt";
import type { SessionUser } from "./session.types";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function requireAuth(req: NextRequest): Promise<SessionUser> {
  const accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    throw new UnauthorizedError();
  }

  let userId: string;
  try {
    ({ sub: userId } = await verifyAccessToken(accessToken));
  } catch {
    throw new UnauthorizedError();
  }

  const [user] = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}
