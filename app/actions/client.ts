"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { isClient, isStaff } from "@/lib/session";
import { db } from "@/lib/db";
import { messages, profiles, quotes, requests } from "@/lib/db/schema";
import { isServiceFamily } from "@/lib/command";
import { isClosedRequest, readString, type ActionState } from "@/lib/format";

function refreshRequest(id: string) {
  revalidatePath("/espace");
  revalidatePath("/espace/historique");
  revalidatePath(`/espace/demandes/${id}`);
  revalidatePath("/bureau");
  revalidatePath("/bureau/communications");
  revalidatePath("/bureau/contrats");
  revalidatePath(`/bureau/demandes/${id}`);
}

async function ownedRequest(requestId: string, clientId: string) {
  return db.query.requests.findFirst({
    where: and(eq(requests.id, requestId), eq(requests.clientId, clientId)),
  });
}

export async function updateProfile(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || !isClient(user.role)) return { error: "Connexion client requise." };

  const characterName = readString(formData, "characterName");
  const phone = readString(formData, "phone");
  const description = readString(formData, "description");
  const notes = readString(formData, "notes");

  if (characterName.length < 2 || characterName.length > 80) {
    return { error: "Le nom du personnage doit faire entre 2 et 80 caractères." };
  }
  if (phone.length > 40) return { error: "Le téléphone RP est trop long." };
  if (description.length > 2000 || notes.length > 2000) {
    return { error: "La description et les notes sont limitées à 2000 caractères." };
  }

  await db
    .update(profiles)
    .set({ characterName, phone, description, notes, updatedAt: new Date() })
    .where(eq(profiles.userId, user.id));

  revalidatePath("/espace/profil");
  return { ok: "Fiche enregistrée." };
}

export async function createRequest(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || !isClient(user.role)) return { error: "Connexion client requise." };

  const title = readString(formData, "title");
  const body = readString(formData, "body");
  const family = readString(formData, "serviceFamily");
  const location = readString(formData, "location");
  const deadline = readString(formData, "deadline");
  const budgetNote = readString(formData, "budgetNote");
  if (!isServiceFamily(family)) return { error: "Choisissez un type de prestation." };
  if (title.length < 3 || title.length > 120) {
    return { error: "Le titre doit faire entre 3 et 120 caractères." };
  }
  if (body.length < 1 || body.length > 4000) {
    return { error: "Décrivez la demande, en 4000 caractères maximum." };
  }
  if (location.length > 160 || deadline.length > 160 || budgetNote.length > 500) {
    return { error: "Le lieu, l'échéance et le budget sont trop longs." };
  }

  const requestId = crypto.randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(requests).values({
      id: requestId,
      clientId: user.id,
      title,
      serviceFamily: family,
      location,
      deadline,
      budgetNote,
    });
    await tx.insert(messages).values({
      requestId,
      authorId: user.id,
      body,
    });
  });

  refreshRequest(requestId);
  redirect(`/espace/demandes/${requestId}`);
}

export async function sendMessage(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Connexion requise." };

  const requestId = readString(formData, "requestId");
  const body = readString(formData, "body");
  if (body.length < 1 || body.length > 4000) {
    return { error: "Le message doit faire entre 1 et 4000 caractères." };
  }

  const request = await db.query.requests.findFirst({ where: eq(requests.id, requestId) });
  if (!request) return { error: "Demande introuvable." };
  if (isClient(user.role) && request.clientId !== user.id) {
    return { error: "Cette demande ne vous appartient pas." };
  }
  if (!isClient(user.role) && !isStaff(user.role)) {
    return { error: "Connexion requise." };
  }
  if (isClosedRequest(request.status)) {
    return { error: "Cette demande est close." };
  }

  await db.transaction(async (tx) => {
    await tx.insert(messages).values({ requestId, authorId: user.id, body });
    await tx.update(requests).set({ updatedAt: new Date() }).where(eq(requests.id, requestId));
  });

  refreshRequest(requestId);
  return { ok: "Message envoyé." };
}

export async function cancelRequest(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || !isClient(user.role)) return { error: "Connexion client requise." };

  const requestId = readString(formData, "requestId");
  const request = await ownedRequest(requestId, user.id);
  if (!request) return { error: "Demande introuvable." };
  if (request.channel) return { error: "Le canal permanent reste ouvert." };
  if (request.status !== "open" && request.status !== "quoted") {
    return { error: "Cette demande ne peut plus être annulée." };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(quotes)
      .set({ status: "refused" })
      .where(and(eq(quotes.requestId, requestId), eq(quotes.status, "sent")));
    await tx
      .update(requests)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(requests.id, requestId));
  });

  refreshRequest(requestId);
  return { ok: "Demande annulée." };
}

export async function markDone(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Connexion requise." };

  const requestId = readString(formData, "requestId");
  const request = await db.query.requests.findFirst({ where: eq(requests.id, requestId) });
  if (!request) return { error: "Demande introuvable." };
  if (isClient(user.role) && request.clientId !== user.id) {
    return { error: "Cette demande ne vous appartient pas." };
  }
  if (!isClient(user.role) && !isStaff(user.role)) {
    return { error: "Connexion requise." };
  }
  if (request.channel) return { error: "Le canal permanent reste ouvert." };
  if (request.status !== "accepted") {
    return { error: "La demande doit être acceptée avant d'être close." };
  }

  await db
    .update(requests)
    .set({ status: "done", finalizedAt: new Date(), suspended: false, updatedAt: new Date() })
    .where(eq(requests.id, requestId));

  refreshRequest(requestId);
  return { ok: "Demande marquée comme terminée." };
}
