// ─── Session token helpers (via jose) ────────────────────────────────────────
// jose is a first-class JWT library that handles signing, verification,
// expiry, and encoding without manual crypto workarounds.

import { SignJWT, jwtVerify } from "jose";

export interface SessionPayload {
  supervisorId: string;
  email: string;
  name: string;
  iat: number;
}

export const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  payload: Omit<SessionPayload, "iat">
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch (e) {
    console.error("Failed to verify session token:", e);
    return null;
  }
}