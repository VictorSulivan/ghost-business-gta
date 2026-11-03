"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { equipment, quoteLines, quotes, requests, services, staff } from "@/lib/db/schema";
import {
  applyAdjustment,
  eurosToCents,
  isClosedRequest,
  readPercentBps,
  readString,
  type QuoteAdjustment,
  type ActionState,
} from "@/lib/format";

function refreshCatalog() {
  revalidatePath("/bureau/catalogue");
  revalidatePath("/bureau/demandes", "layout");
}

function refreshRequest(id: string) {
  revalidatePath("/espace");
  revalidatePath("/espace/historique");
  revalidatePath(`/espace/demandes/${id}`);
  revalidatePath("/bureau");
  revalidatePath(`/bureau/demandes/${id}`);
  revalidatePath("/bureau/catalogue");
}

async function requireMember() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "member" && user.role !== "admin")) return null;
  return user;
}

export async function saveService(_state: ActionState, formData: FormData): Promise<ActionState> {
  const member = await requireMember();
  if (!member) return { error: "Connexion membre requise." };

  const id = readString(formData, "id");
  const name = readString(formData, "name");
  const description = readString(formData, "description");
  const price = eurosToCents(readString(formData, "price"));
  const active = readString(formData, "active") === "yes";

  if (name.length < 2 || name.length > 80) {
    return { error: "Le nom de la prestation doit faire entre 2 et 80 caractères." };
  }
  if (description.length > 2000) return { error: "La description est trop longue." };
  if (price === null) return { error: "Indiquez un prix de base valide." };

  if (id) {
    const existing = await db.query.services.findFirst({ where: eq(services.id, id) });
    if (!existing) return { error: "Prestation introuvable." };
    await db
      .update(services)
      .set({ name, description, basePriceCents: price, active })
      .where(eq(services.id, id));
  } else {
    await db.insert(services).values({
      name,
      description,
      basePriceCents: price,
      active,
      createdBy: member.id,
    });
  }

  refreshCatalog();
  return { ok: id ? "Prestation mise à jour." : "Prestation ajoutée." };
}

export async function saveStaff(_state: ActionState, formData: FormData): Promise<ActionState> {
  const member = await requireMember();
  if (!member) return { error: "Connexion membre requise." };

  const id = readString(formData, "id");
  const name = readString(formData, "name");
  const notes = readString(formData, "notes");
  const price = eurosToCents(readString(formData, "price"));
  const active = readString(formData, "active") === "yes";

  if (name.length < 2 || name.length > 80) {
    return { error: "Le nom de l'effectif doit faire entre 2 et 80 caractères." };
  }
  if (notes.length > 2000) return { error: "La note est trop longue." };
  if (price === null) return { error: "Indiquez un coût valide." };

  if (id) {
    const existing = await db.query.staff.findFirst({ where: eq(staff.id, id) });
    if (!existing) return { error: "Effectif introuvable." };
    await db
      .update(staff)
      .set({ name, notes, priceCents: price, active, updatedBy: member.id, updatedAt: new Date() })
      .where(eq(staff.id, id));
  } else {
    await db.insert(staff).values({
      name,
      notes,
      priceCents: price,
      active,
      updatedBy: member.id,
    });
  }

  refreshCatalog();
  return { ok: id ? "Effectif mis à jour." : "Effectif ajouté." };
}

export async function saveEquipment(_state: ActionState, formData: FormData): Promise<ActionState> {
  const member = await requireMember();
  if (!member) return { error: "Connexion membre requise." };

  const id = readString(formData, "id");
  const name = readString(formData, "name");
  const notes = readString(formData, "notes");
  const price = eurosToCents(readString(formData, "price"));
  const active = readString(formData, "active") === "yes";

  if (name.length < 2 || name.length > 80) {
    return { error: "Le nom du matériel doit faire entre 2 et 80 caractères." };
  }
  if (notes.length > 2000) return { error: "La note est trop longue." };
  if (price === null) return { error: "Indiquez un coût valide." };

  if (id) {
    const existing = await db.query.equipment.findFirst({ where: eq(equipment.id, id) });
    if (!existing) return { error: "Matériel introuvable." };
    await db
      .update(equipment)
      .set({ name, notes, priceCents: price, active, updatedBy: member.id, updatedAt: new Date() })
      .where(eq(equipment.id, id));
  } else {
    await db.insert(equipment).values({
      name,
      notes,
      priceCents: price,
      active,
      updatedBy: member.id,
    });
  }

  refreshCatalog();
  return { ok: id ? "Matériel mis à jour." : "Matériel ajouté." };
}

export async function refuseRequest(_state: ActionState, formData: FormData): Promise<ActionState> {
  const member = await requireMember();
  if (!member) return { error: "Connexion membre requise." };

  const requestId = readString(formData, "requestId");
  const request = await db.query.requests.findFirst({ where: eq(requests.id, requestId) });
  if (!request) return { error: "Demande introuvable." };
  if (request.status !== "open" && request.status !== "quoted") {
    return { error: "Cette demande ne peut plus être refusée." };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(quotes)
      .set({ status: "refused" })
      .where(and(eq(quotes.requestId, requestId), eq(quotes.status, "sent")));
    await tx
      .update(quotes)
      .set({ status: "refused" })
      .where(and(eq(quotes.requestId, requestId), eq(quotes.status, "draft")));
    await tx
      .update(requests)
      .set({ status: "refused", updatedAt: new Date() })
      .where(eq(requests.id, requestId));
  });

  refreshRequest(requestId);
  return { ok: "Demande refusée." };
}

export async function prepareQuote(_state: ActionState, formData: FormData): Promise<ActionState> {
  const member = await requireMember();
  if (!member) return { error: "Connexion membre requise." };

  const requestId = readString(formData, "requestId");
  const request = await db.query.requests.findFirst({
    where: eq(requests.id, requestId),
    with: { quotes: true },
  });
  if (!request) return { error: "Demande introuvable." };
  if (isClosedRequest(request.status) || request.status === "accepted") {
    return { error: "Cette demande n'accepte plus de devis." };
  }
  if (request.quotes.some((quote) => quote.status === "draft")) {
    return { error: "Un brouillon de devis existe déjà." };
  }
  if (request.quotes.some((quote) => quote.status === "sent")) {
    return { error: "Un devis attend déjà la réponse du client." };
  }

  await db.insert(quotes).values({
    requestId,
    authorId: member.id,
    status: "draft",
  });
  refreshRequest(requestId);
  return { ok: "Brouillon de devis ouvert." };
}

export async function addQuoteLine(_state: ActionState, formData: FormData): Promise<ActionState> {
  const member = await requireMember();
  if (!member) return { error: "Connexion membre requise." };

  const quoteId = readString(formData, "quoteId");
  const kind = readString(formData, "kind");
  const refId = readString(formData, "refId");
  const customLabel = readString(formData, "label");
  const typedPrice = readString(formData, "unitPrice");

  if (kind !== "service" && kind !== "staff" && kind !== "equipment" && kind !== "custom") {
    return { error: "Type de ligne invalide." };
  }

  const quote = await db.query.quotes.findFirst({ where: eq(quotes.id, quoteId) });
  if (!quote || quote.status !== "draft") {
    return { error: "Ce devis n'est plus modifiable." };
  }

  let label = customLabel;
  let unitPriceCents = eurosToCents(typedPrice);
  let storedRef: string | null = null;

  if (kind === "service") {
    const service = await db.query.services.findFirst({ where: eq(services.id, refId) });
    if (!service || !service.active) return { error: "Choisissez une prestation active." };
    label = service.name;
    storedRef = service.id;
    if (unitPriceCents === null) unitPriceCents = service.basePriceCents;
  } else if (kind === "staff") {
    const role = await db.query.staff.findFirst({ where: eq(staff.id, refId) });
    if (!role || !role.active) return { error: "Choisissez un effectif actif." };
    label = role.name;
    storedRef = role.id;
    if (unitPriceCents === null) unitPriceCents = role.priceCents;
  } else if (kind === "equipment") {
    const item = await db.query.equipment.findFirst({ where: eq(equipment.id, refId) });
    if (!item || !item.active) return { error: "Choisissez un matériel actif." };
    label = item.name;
    storedRef = item.id;
    if (unitPriceCents === null) unitPriceCents = item.priceCents;
  } else {
    if (label.length < 2 || label.length > 120) {
      return { error: "Le libellé doit faire entre 2 et 120 caractères." };
    }
    if (unitPriceCents === null) return { error: "Indiquez un prix unitaire." };
  }

  await db.insert(quoteLines).values({
    quoteId,
    kind,
    refId: storedRef,
    label,
    quantity: 1,
    unitPriceCents,
  });
  refreshRequest(quote.requestId);
  return { ok: "Ligne ajoutée." };
}

export async function removeQuoteLine(_state: ActionState, formData: FormData): Promise<ActionState> {
  const member = await requireMember();
  if (!member) return { error: "Connexion membre requise." };

  const lineId = readString(formData, "lineId");
  const line = await db.query.quoteLines.findFirst({
    where: eq(quoteLines.id, lineId),
    with: { quote: true },
  });
  if (!line || line.quote.status !== "draft") {
    return { error: "Cette ligne ne peut plus être retirée." };
  }

  await db.delete(quoteLines).where(eq(quoteLines.id, lineId));
  refreshRequest(line.quote.requestId);
  return { ok: "Ligne retirée." };
}

export async function sendQuote(_state: ActionState, formData: FormData): Promise<ActionState> {
  const member = await requireMember();
  if (!member) return { error: "Connexion membre requise." };

  const quoteId = readString(formData, "quoteId");
  const note = readString(formData, "note");
  const adjustmentRaw = readString(formData, "adjustment");
  const reason = readString(formData, "adjustmentReason");
  if (note.length > 2000) return { error: "La note est limitée à 2000 caractères." };
  if (adjustmentRaw !== "none" && adjustmentRaw !== "discount" && adjustmentRaw !== "increase") {
    return { error: "Choisissez un type d'ajustement." };
  }
  const adjustment = adjustmentRaw as QuoteAdjustment;
  let adjustmentBps = 0;
  if (adjustment !== "none") {
    const bps = readPercentBps(readString(formData, "adjustmentPercent"));
    if (bps === null) return { error: "Indiquez un pourcentage supérieur à 0, jusqu'à 1 000." };
    if (adjustment === "discount" && bps > 10_000) {
      return { error: "Une ristourne ne peut pas dépasser 100 %." };
    }
    if (reason.length < 2) return { error: "Indiquez la raison de cet ajustement." };
    if (reason.length > 2000) return { error: "La raison est limitée à 2000 caractères." };
    adjustmentBps = bps;
  }

  const quote = await db.query.quotes.findFirst({
    where: eq(quotes.id, quoteId),
    with: { lines: true, request: true },
  });
  if (!quote || quote.status !== "draft") return { error: "Ce devis n'est plus un brouillon." };
  if (quote.lines.length === 0) return { error: "Ajoutez au moins une ligne." };
  if (isClosedRequest(quote.request.status) || quote.request.status === "accepted") {
    return { error: "Cette demande n'accepte plus de devis." };
  }

  const subtotalCents = quote.lines.reduce((sum, line) => sum + line.quantity * line.unitPriceCents, 0);
  const totalCents = applyAdjustment(subtotalCents, adjustment, adjustmentBps);
  await db.transaction(async (tx) => {
    await tx
      .update(quotes)
      .set({
        status: "sent",
        note,
        adjustment,
        adjustmentBps,
        adjustmentReason: adjustment === "none" ? "" : reason,
        totalCents,
      })
      .where(eq(quotes.id, quoteId));
    await tx
      .update(requests)
      .set({ status: "quoted", updatedAt: new Date() })
      .where(eq(requests.id, quote.requestId));
  });

  refreshRequest(quote.requestId);
  return { ok: "Devis envoyé au client." };
}

export async function acceptQuote(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "client") return { error: "Connexion client requise." };

  const quoteId = readString(formData, "quoteId");
  const quote = await db.query.quotes.findFirst({
    where: eq(quotes.id, quoteId),
    with: { lines: true, request: true },
  });
  if (!quote || quote.request.clientId !== user.id) return { error: "Devis introuvable." };
  if (quote.status !== "sent") return { error: "Ce devis n'est pas en attente." };
  if (quote.request.status !== "quoted" && quote.request.status !== "open") {
    return { error: "Cette demande n'accepte plus ce devis." };
  }

  await db.transaction(async (tx) => {
    await tx.update(quotes).set({ status: "accepted" }).where(eq(quotes.id, quoteId));
    await tx
      .update(quotes)
      .set({ status: "refused" })
      .where(and(eq(quotes.requestId, quote.requestId), eq(quotes.status, "sent"), ne(quotes.id, quoteId)));
    await tx
      .update(requests)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(requests.id, quote.requestId));
  });

  refreshRequest(quote.requestId);
  return { ok: "Devis accepté." };
}

export async function refuseQuote(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user || user.role !== "client") return { error: "Connexion client requise." };

  const quoteId = readString(formData, "quoteId");
  const quote = await db.query.quotes.findFirst({
    where: eq(quotes.id, quoteId),
    with: { request: true },
  });
  if (!quote || quote.request.clientId !== user.id) return { error: "Devis introuvable." };
  if (quote.status !== "sent") return { error: "Ce devis n'est pas en attente." };

  await db.transaction(async (tx) => {
    await tx.update(quotes).set({ status: "refused" }).where(eq(quotes.id, quoteId));
    const stillSent = await tx.query.quotes.findFirst({
      where: and(eq(quotes.requestId, quote.requestId), eq(quotes.status, "sent")),
    });
    if (!stillSent && quote.request.status === "quoted") {
      await tx
        .update(requests)
        .set({ status: "open", updatedAt: new Date() })
        .where(eq(requests.id, quote.requestId));
    }
  });

  refreshRequest(quote.requestId);
  return { ok: "Devis refusé." };
}
