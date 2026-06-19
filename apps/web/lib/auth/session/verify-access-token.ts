import { jwtVerify } from "jose";

const ACCESS_TOKEN_TYPE = "access";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return new TextEncoder().encode(secret);
}

export async function verifyAccessToken(token: string): Promise<{ sub: string }> {
  const { payload } = await jwtVerify(token, getSecret());

  if (payload.type !== ACCESS_TOKEN_TYPE || typeof payload.sub !== "string") {
    throw new Error("Invalid access token");
  }

  return { sub: payload.sub };
}
