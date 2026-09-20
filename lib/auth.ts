import "server-only";
import { cookies } from "next/headers";
import { getServerAuth } from "@/lib/firebase/admin";

export interface SessionUser {
  uid: string;
  email: string;
}

export class UnauthorizedError extends Error {
  constructor(message = "No autorizado") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function isAllowedEmail(email: string): boolean {
  const allowed = (process.env.ADMIN_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return allowed.length > 0 && allowed.includes(email.toLowerCase());
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) {
    return null;
  }
  const auth = getServerAuth();
  if (!auth) {
    return null;
  }
  try {
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    return { uid: decoded.uid, email: decoded.email ?? "" };
  } catch {
    return null;
  }
}

export async function verifySession(): Promise<SessionUser | null> {
  const session = await getSessionUser();
  if (!session) {
    return null;
  }
  return isAllowedEmail(session.email) ? session : null;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await verifySession();
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}