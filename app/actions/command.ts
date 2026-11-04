"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser, requireGradeManager } from "@/lib/auth";
import { accessForFunction, isStaffFunction, recordAudit } from "@/lib/access";
import { ensureVipChannel } from "@/lib/channels";
import {
  canReviewReports,
  hasPermission,
  isDossierKind,
  isOperationStatus,
  isReportStatus,
  isVipState,
  isVipTier,
  permissionKeys,
  staffFunctions,
  type DossierKind,
} from "@/lib/command";
import { db } from "@/lib/db";
import {
  dossiers,
  functionPermissions,
  operations,
  reportEvents,
  reports,
  requests,
  units,
  users,
  vipEvents,
} from "@/lib/db/schema";
import { eurosToCents, isClosedRequest, readString, type ActionState } from "@/lib/format";
import { canManageGrades, isClient, isStaff } from "@/lib/session";

function refreshCommand() {
  for (const path of [
    "/bureau",
    "/bureau/communications",
    "/bureau/contrats",
    "/bureau/operations",
    "/bureau/effectifs",
    "/bureau/vip",
    "/bureau/rapports",
    "/bureau/renseignement",
    "/bureau/administration",
    "/bureau/membres",
  ]) {
    revalidatePath(path);
  }
}

async function staffActor() {
  const user = await getCurrentUser();
  if (!user || !isStaff(user.role)) return null;
  return user;
}

function personName(user: { profile?: { characterName: string } | null; discordUsername: string }) {
  return user.profile?.characterName || user.discordUsername || "Compte";
}

export async function saveContractSheet(_state: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await staffActor();
  if (!actor || !hasPermission(actor, "contracts")) return { error: "Droit contrats requis." };

  const requestId = readString(formData, "requestId");
  const terms = readString(formData, "terms");
  const ownerId = readString(formData, "ownerId");
  const suspended = readString(formData, "suspended") === "yes";
  if (terms.length > 2000) return { error: "Les conditions sont limitées à 2000 caractères." };

  const request = await db.query.requests.findFirst({ where: eq(requests.id, requestId) });
  if (!request || request.channel) return { error: "Contrat introuvable." };
  if (isClosedRequest(request.status)) return { error: "Ce contrat est clos." };

  let nextOwner: string | null = null;
  if (ownerId) {
    const owner = await db.query.users.findFirst({ where: eq(users.id, ownerId) });
    if (!owner || !isStaff(owner.role)) return { error: "Le responsable doit être un Ghost." };
    nextOwner = owner.id;
  }

  await db
    .update(requests)
    .set({ terms, ownerId: nextOwner, suspended, updatedAt: new Date() })
    .where(eq(requests.id, requestId));
  await recordAudit(actor.id, `${suspended ? "Suspension" : "Mise à jour"} du contrat ${request.reference}.`);
  refreshCommand();
  revalidatePath(`/bureau/demandes/${requestId}`);
  revalidatePath(`/espace/demandes/${requestId}`);
  return { ok: "Fiche de contrat enregistrée." };
}

export async function finalizeContract(_state: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await staffActor();
  if (!actor || !hasPermission(actor, "contracts")) return { error: "Droit contrats requis." };

  const requestId = readString(formData, "requestId");
  const request = await db.query.requests.findFirst({ where: eq(requests.id, requestId) });
  if (!request || request.channel) return { error: "Contrat introuvable." };
  if (request.status !== "accepted") return { error: "Le client doit d'abord accepter la proposition." };

  await db
    .update(requests)
    .set({ status: "done", finalizedAt: new Date(), suspended: false, updatedAt: new Date() })
    .where(eq(requests.id, requestId));
  await recordAudit(actor.id, `Contrat ${request.reference} finalisé.`);
  refreshCommand();
  revalidatePath(`/bureau/demandes/${requestId}`);
  revalidatePath(`/espace/demandes/${requestId}`);
  revalidatePath("/espace/historique");
  return { ok: "Contrat finalisé." };
}

export async function saveOperation(_state: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await staffActor();
  if (!actor || !hasPermission(actor, "operations")) return { error: "Droit opérations requis." };

  const id = readString(formData, "id");
  const name = readString(formData, "name");
  const objective = readString(formData, "objective");
  const status = readString(formData, "status");
  const ownerId = readString(formData, "ownerId");
  if (name.length < 3 || name.length > 120) return { error: "Le nom de l'opération doit faire entre 3 et 120 caractères." };
  if (objective.length > 2000) return { error: "L'objectif est limité à 2000 caractères." };
  if (!isOperationStatus(status)) return { error: "Statut d'opération inconnu." };

  let nextOwner: string | null = null;
  if (ownerId) {
    const owner = await db.query.users.findFirst({ where: eq(users.id, ownerId) });
    if (!owner || !isStaff(owner.role)) return { error: "Le responsable doit être un Ghost." };
    nextOwner = owner.id;
  }

  if (id) {
    const current = await db.query.operations.findFirst({ where: eq(operations.id, id) });
    if (!current) return { error: "Opération introuvable." };
    await db
      .update(operations)
      .set({ name, objective, status, ownerId: nextOwner, updatedAt: new Date() })
      .where(eq(operations.id, id));
  } else {
    await db.insert(operations).values({ name, objective, status, ownerId: nextOwner });
  }
  await recordAudit(actor.id, id ? `Opération mise à jour : ${name}.` : `Opération ouverte : ${name}.`);
  refreshCommand();
  return { ok: "Opération enregistrée." };
}

export async function saveUnit(_state: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await staffActor();
  if (!actor || !hasPermission(actor, "staff")) return { error: "Droit effectifs requis." };

  const name = readString(formData, "name");
  const kind = readString(formData, "kind");
  const description = readString(formData, "description");
  const leaderId = readString(formData, "leaderId");
  if (name.length < 2 || name.length > 80) return { error: "Le nom de l'unité doit faire entre 2 et 80 caractères." };
  if (kind !== "alpha" && kind !== "specialized") return { error: "Type d'unité inconnu." };
  if (description.length > 500) return { error: "La description est limitée à 500 caractères." };

  let nextLeader: string | null = null;
  if (leaderId) {
    const leader = await db.query.users.findFirst({ where: eq(users.id, leaderId) });
    if (!leader || !isStaff(leader.role)) return { error: "Le chef d'unité doit être un Ghost." };
    nextLeader = leader.id;
  }

  await db.insert(units).values({ name, kind, description, leaderId: nextLeader });
  await recordAudit(actor.id, `Unité créée : ${name}.`);
  refreshCommand();
  return { ok: "Unité enregistrée." };
}

export async function assignMember(_state: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await staffActor();
  if (!actor || !hasPermission(actor, "staff")) return { error: "Droit effectifs requis." };

  const id = readString(formData, "id");
  const staffFunction = readString(formData, "staffFunction");
  const rpTitle = readString(formData, "rpTitle");
  const unitId = readString(formData, "unitId");
  if (!isStaffFunction(staffFunction)) return { error: "Fonction inconnue." };
  if (rpTitle.length > 80) return { error: "La fonction RP est limitée à 80 caractères." };

  const account = await db.query.users.findFirst({ where: eq(users.id, id), with: { profile: true } });
  if (!account || (account.role !== "member" && account.role !== "officer")) {
    return { error: "Seuls les Ghost peuvent être affectés." };
  }
  if (unitId) {
    const unit = await db.query.units.findFirst({ where: eq(units.id, unitId) });
    if (!unit) return { error: "Unité introuvable." };
  }

  const access = await accessForFunction(staffFunction);
  await db
    .update(users)
    .set({ ...access, rpTitle, unitId: unitId || null })
    .where(eq(users.id, id));
  await recordAudit(actor.id, `${personName(account)} affecté : ${staffFunction}.`);
  refreshCommand();
  return { ok: "Affectation enregistrée." };
}

export async function saveVipFiche(_state: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await getCurrentUser();
  if (!actor || (!canManageGrades(actor.role) && !hasPermission(actor, "access"))) {
    return { error: "Réservé au commandement." };
  }

  const id = readString(formData, "id");
  const tier = readString(formData, "tier");
  const state = readString(formData, "state");
  const expires = readString(formData, "expires");
  const benefits = readString(formData, "benefits");
  const notes = readString(formData, "notes");
  const rawDiscount = readString(formData, "vipDiscount");
  if (!isVipTier(tier) || !isVipState(state)) return { error: "Niveau ou statut VIP inconnu." };
  if (expires && !/^\d{4}-\d{2}-\d{2}$/.test(expires)) return { error: "La date de fin n'est pas valide." };
  if (benefits.length > 2000 || notes.length > 2000) return { error: "Les textes VIP sont limités à 2000 caractères." };
  const cents = rawDiscount ? eurosToCents(rawDiscount) : 0;
  if (cents === null) return { error: "Indiquez la réduction VIP en euros, jusqu'à 1 000 000." };

  const account = await db.query.users.findFirst({ where: eq(users.id, id), with: { profile: true } });
  if (!account || account.role === "admin" || isStaff(account.role)) return { error: "Client introuvable." };
  if (account.role !== "client" && account.role !== "vip") return { error: "Ce compte ne peut pas devenir VIP." };

  await db
    .update(users)
    .set({
      role: "vip",
      vipTier: tier,
      vipState: state,
      vipExpiresOn: expires || null,
      vipBenefits: benefits,
      vipNotes: notes,
      vipDiscountCents: cents,
    })
    .where(eq(users.id, id));
  if (account.role !== "vip") await ensureVipChannel(id);
  await db.insert(vipEvents).values({
    userId: id,
    actorId: actor.id,
    text: `${personName(account)} : ${tier}, ${state}${expires ? `, jusqu'au ${expires}` : ""}.`,
  });
  await recordAudit(actor.id, `Fiche VIP enregistrée pour ${personName(account)}.`);
  refreshCommand();
  revalidatePath("/espace");
  return { ok: "Fiche VIP enregistrée. Le client se reconnecte pour prendre le grade." };
}

export async function saveReport(_state: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await staffActor();
  if (!actor) return { error: "Connexion Ghost requise." };

  const requestId = readString(formData, "requestId");
  const title = readString(formData, "title");
  const summary = readString(formData, "summary");
  const outcome = readString(formData, "outcome");
  const nextSteps = readString(formData, "nextSteps");
  if (title.length < 3 || title.length > 140) return { error: "Le titre doit faire entre 3 et 140 caractères." };
  if (summary.length < 1 || summary.length > 4000) return { error: "Le résumé des faits est limité à 4000 caractères." };
  if (outcome.length > 4000 || nextSteps.length > 4000) return { error: "Les suites sont limitées à 4000 caractères." };

  let linked: string | null = null;
  if (requestId) {
    const request = await db.query.requests.findFirst({ where: eq(requests.id, requestId) });
    if (!request) return { error: "Contrat lié introuvable." };
    linked = request.id;
  }

  const [created] = await db
    .insert(reports)
    .values({
      authorId: actor.id,
      kind: "mission",
      classification: "internal",
      requestId: linked,
      title,
      summary,
      outcome,
      nextSteps,
    })
    .returning({ id: reports.id, reference: reports.reference });
  if (created) {
    await db.insert(reportEvents).values({
      reportId: created.id,
      actorId: actor.id,
      text: `${created.reference} transmis.`,
    });
  }
  await recordAudit(actor.id, `Rapport transmis : ${title}.`);
  refreshCommand();
  return { ok: "Rapport transmis au commandement." };
}

export async function reviewReport(_state: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await staffActor();
  if (!actor || !canReviewReports(actor)) return { error: "Réservé au commandement." };

  const id = readString(formData, "id");
  const status = readString(formData, "status");
  const review = readString(formData, "review");
  if (!isReportStatus(status)) return { error: "Statut de rapport inconnu." };
  if (review.length > 2000) return { error: "Les observations sont limitées à 2000 caractères." };

  const report = await db.query.reports.findFirst({ where: eq(reports.id, id) });
  if (!report) return { error: "Rapport introuvable." };

  await db
    .update(reports)
    .set({ status, review, reviewerId: actor.id, updatedAt: new Date() })
    .where(eq(reports.id, id));
  await db.insert(reportEvents).values({
    reportId: id,
    actorId: actor.id,
    text: `${report.reference} : ${status}.`,
  });
  await recordAudit(actor.id, `Rapport ${report.reference} passé à ${status}.`);
  refreshCommand();
  return { ok: "Rapport traité." };
}

export async function saveDossier(_state: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await staffActor();
  if (!actor) return { error: "Connexion Ghost requise." };

  const kind = readString(formData, "kind");
  const title = readString(formData, "title");
  const body = readString(formData, "body");
  if (!isDossierKind(kind)) return { error: "Catégorie inconnue." };
  if (kind === "classified" && !hasPermission(actor, "classified")) {
    return { error: "Les dossiers confidentiels sont réservés aux accès classifiés." };
  }
  if (title.length < 3 || title.length > 140) return { error: "Le titre doit faire entre 3 et 140 caractères." };
  if (body.length < 1 || body.length > 4000) return { error: "Le dossier est limité à 4000 caractères." };

  await db.insert(dossiers).values({ kind: kind as DossierKind, title, body, authorId: actor.id });
  await recordAudit(actor.id, `Dossier ${kind} ajouté : ${title}.`);
  refreshCommand();
  return { ok: "Dossier archivé." };
}

export async function savePermissions(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireGradeManager();
  const actor = await getCurrentUser();
  if (!actor || !canManageGrades(actor.role)) return { error: "Réservé au commandement." };

  const current = await db.query.functionPermissions.findMany();
  for (const staffFunction of staffFunctions) {
    const existing = current.find((row) => row.staffFunction === staffFunction);
    const flags = Object.fromEntries(
      permissionKeys
        .filter((key) => key !== "staff" && key !== "classified" && key !== "operations")
        .map((key) => [key, formData.get(`${staffFunction}:${key}`) === "on"]),
    ) as Record<(typeof permissionKeys)[number], boolean>;
    await db
      .update(functionPermissions)
      .set({
        contracts: flags.contracts,
        operations: existing?.operations ?? false,
        staff: existing?.staff ?? false,
        communications: flags.communications,
        panel: flags.panel,
        access: flags.access,
        classified: existing?.classified ?? false,
      })
      .where(eq(functionPermissions.staffFunction, staffFunction));
    await db
      .update(users)
      .set({
        permContracts: flags.contracts,
        permOperations: existing?.operations ?? false,
        permStaff: existing?.staff ?? false,
        permCommunications: flags.communications,
        permPanel: flags.panel,
        permAccess: flags.access,
        permClassified: existing?.classified ?? false,
      })
      .where(eq(users.staffFunction, staffFunction));
  }

  await recordAudit(actor.id, "Matrice des droits mise à jour.");
  refreshCommand();
  return { ok: "Droits enregistrés." };
}
