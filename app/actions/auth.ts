"use server";

import { compare } from "bcrypt";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSession, deleteSession, getCurrentUser } from "@/lib/auth";
import { accessForFunction, clearedStaffAccess, isStaffFunction, recordAudit } from "@/lib/access";
import { closeVipChannel, ensureVipChannel } from "@/lib/channels";
import { isVipState, isVipTier } from "@/lib/command";
import { db } from "@/lib/db";
import { users, vipEvents } from "@/lib/db/schema";
import { eurosToCents, isEmail, readString, type ActionState } from "@/lib/format";
import { assignableRoles, isStaff, type Role } from "@/lib/session";

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

  const nextRole = role as Role;
  const next: {
    role: Role;
    active?: boolean;
    vipDiscountCents?: number;
    vipTier?: "argent" | "or" | "obsidienne";
    vipState?: "actif" | "suspendu";
    vipExpiresOn?: string | null;
    vipBenefits?: string;
    vipNotes?: string;
  } = { role: nextRole };
  if (actor.role === "admin") next.active = readString(formData, "active") === "yes";
  if (nextRole === "vip") {
    const raw = readString(formData, "vipDiscount");
    const cents = raw ? eurosToCents(raw) : 0;
    const tier = readString(formData, "tier");
    const state = readString(formData, "state");
    const expires = readString(formData, "expires");
    const benefits = readString(formData, "benefits");
    const notes = readString(formData, "notes");
    if (cents === null) return { error: "Indiquez la réduction VIP en euros, jusqu'à 1 000 000." };
    if (!isVipTier(tier) || !isVipState(state)) return { error: "Niveau ou statut VIP inconnu." };
    if (expires && !/^\d{4}-\d{2}-\d{2}$/.test(expires)) return { error: "La date de fin n'est pas valide." };
    if (benefits.length > 2000 || notes.length > 2000) return { error: "Les textes VIP sont limités à 2000 caractères." };
    next.vipDiscountCents = cents;
    next.vipTier = tier;
    next.vipState = state;
    next.vipExpiresOn = expires || null;
    next.vipBenefits = benefits;
    next.vipNotes = notes;
  }
  const requestedFunction = readString(formData, "staffFunction");
  const access = isStaff(nextRole)
    ? await accessForFunction(
        isStaffFunction(requestedFunction)
          ? requestedFunction
          : account.staffFunction && isStaffFunction(account.staffFunction)
            ? account.staffFunction
            : nextRole === "officer"
              ? "commandement"
              : "operations",
      )
    : clearedStaffAccess();

  await db.update(users).set({ ...next, ...access }).where(eq(users.id, id));
  await recordAudit(actor.id, `Grade de ${id.slice(0, 8)} passé à ${nextRole}.`);
  if (nextRole === "vip") {
    await ensureVipChannel(id);
    await db.insert(vipEvents).values({
      userId: id,
      actorId: actor.id,
      text: `Fiche VIP : ${next.vipTier}, ${next.vipState}.`,
    });
  } else if (account.role === "vip") await closeVipChannel(id);
  revalidatePath("/bureau/membres");
  revalidatePath("/bureau");
  revalidatePath("/espace");
  return { ok: "Accès mis à jour." };
}
