import "server-only";

import { SignJWT } from "jose";

import { verifyAccessToken } from "./verify-access-token";

export { verifyAccessToken };

const ACCESS_TOKEN_TYPE = "access";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return new TextEncoder().encode(secret);
}

export async function signAccessToken(userId: string): Promise<string> {
  return new SignJWT({ type: ACCESS_TOKEN_TYPE })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_ACCESS_EXPIRES_IN ?? "15m")
    .sign(getSecret());
}
