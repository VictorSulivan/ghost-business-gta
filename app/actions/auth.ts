"use server";

import { compare } from "bcrypt";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, deleteSession, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { isEmail, readString, type ActionState } from "@/lib/format";
import { assignableRoles, type Role } from "@/lib/session";

export async function login(_state: ActionState, formData: FormData): Promise<ActionState> {
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");
  if (!isEmail(email) || password.length < 8) {
    return { error: "E-mail ou mot de passe incorrect." };
  }

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user?.passwordHash || !(await compare(password, user.passwordHash))) {
    return { error: "E-mail ou mot de passe incorrect." };
  }
  if (user.role !== "admin") {
    return { error: "Cette entrée est réservée à l'administration. Les autres comptes passent par Discord." };
  }
  if (!user.active) return { error: "Ce compte n'a plus accès." };

  await createSession(user.id, user.role);
  redirect("/bureau");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}

export async function updateMemberAccess(_state: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await getCurrentUser();
  if (!actor) return { error: "Connexion requise." };

  const id = readString(formData, "id");
  const role = readString(formData, "role");
  const account = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!account || account.role === "admin") return { error: "Compte introuvable." };

  const allowed = assignableRoles(actor.role, account.role);
  if (!allowed.includes(role as Role)) return { error: "Ce grade ne peut pas être attribué." };

  const next: { role: Role; active?: boolean } = { role: role as Role };
  if (actor.role === "admin") next.active = readString(formData, "active") === "yes";

  await db.update(users).set(next).where(eq(users.id, id));
  revalidatePath("/bureau/membres");
  return { ok: "Accès mis à jour." };
}
