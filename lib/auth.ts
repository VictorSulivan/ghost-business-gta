import "server-only";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "./db";
import { users } from "./db/schema";
import { decrypt, encrypt, isStaff, type Role, type SessionPayload } from "./session";

const COOKIE = "session";

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export async function sealSession(userId: string, role: Role) {
  return encrypt({ userId, role });
}

export async function createSession(userId: string, role: Role) {
  const token = await sealSession(userId, role);
  const jar = await cookies();
  jar.set(COOKIE, token, sessionCookieOptions);
}

export async function deleteSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const jar = await cookies();
  return decrypt(jar.get(COOKIE)?.value);
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
    with: { profile: true },
  });
  if (!user || !user.active || user.role !== session.role) return null;
  return user;
});

function endSession(): never {
  redirect("/auth/session");
}

export async function requireUser(role: Role) {
  const user = await getCurrentUser();
  if (!user) endSession();
  if (user.role !== role) redirect(user.role === "client" ? "/espace" : "/bureau");
  return user;
}

export async function requireStaff() {
  const user = await getCurrentUser();
  if (!user) endSession();
  if (!isStaff(user.role)) redirect("/espace");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) endSession();
  if (user.role !== "admin") redirect(user.role === "client" ? "/espace" : "/bureau");
  return user;
}
