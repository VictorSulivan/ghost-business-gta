import { SignJWT, jwtVerify } from "jose";

export type Role = "client" | "member" | "admin";

export function isStaff(role: Role) {
  return role === "member" || role === "admin";
}

export type SessionPayload = {
  userId: string;
  role: Role;
};

function getKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET manquant.");
  }
  return new TextEncoder().encode(secret);
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getKey());
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string") return null;
    if (payload.role !== "client" && payload.role !== "member" && payload.role !== "admin") return null;
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}
