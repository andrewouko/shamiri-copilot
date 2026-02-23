import { cookies } from "next/headers";
import { db } from "./db";
import { SESSION_MAX_AGE, SessionPayload, verifySessionToken } from "./session";

export type { SessionPayload } from "./session";
export { createSessionToken, verifySessionToken } from "./session";

const SESSION_COOKIE = "shamiri_session";

// ─── Cookie Helpers ───────────────────────────────────────────────────────────

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// ─── Auth Guard ───────────────────────────────────────────────────────────────
// Use this in Server Components or Route Handlers to get the current supervisor.

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSessionFromCookies();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

// ─── Supervisor Lookup ────────────────────────────────────────────────────────

export async function getSupervisorById(id: string) {
  return db.supervisor.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  });
}
