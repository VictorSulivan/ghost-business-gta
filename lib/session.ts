import { SignJWT, jwtVerify } from "jose";

export type Role = "client" | "member" | "officer" | "admin";

export function isStaff(role: Role) {
  return role === "member" || role === "officer" || role === "admin";
}

export function canManageGrades(role: Role) {
  return role === "officer" || role === "admin";
}

export function roleLabel(role: Role) {
  if (role === "officer") return "Commandement";
  if (role === "member") return "Membre";
  if (role === "admin") return "Admin";
  return "Client";
}

export function assignableRoles(actor: Role, current: Role): Role[] {
  if (current === "admin") return [];
  if (actor === "admin") return ["client", "member", "officer"];
  if (actor === "officer" && current === "client") return ["client", "member"];
  if (actor === "officer" && current === "member") return ["member", "officer"];
  return [];
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
    if (payload.role !== "client" && payload.role !== "member" && payload.role !== "officer" && payload.role !== "admin") {
      return null;
    }
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}
