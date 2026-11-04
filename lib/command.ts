import type { Role } from "./session";

export const staffFunctions = [
  "commandement",
  "renseignement",
  "operations",
  "cyber",
  "alpha",
  "logistique",
] as const;

export type StaffFunction = (typeof staffFunctions)[number];

export const staffFunctionLabel: Record<StaffFunction, string> = {
  commandement: "Commandement",
  renseignement: "Renseignement",
  operations: "Opérations",
  cyber: "Cyber / IT",
  alpha: "Alpha",
  logistique: "Logistique",
};

export const permissionKeys = [
  "contracts",
  "operations",
  "staff",
  "communications",
  "panel",
  "access",
  "classified",
] as const;

export type PermissionKey = (typeof permissionKeys)[number];

export const permissionLabel: Record<PermissionKey, string> = {
  contracts: "Gestion des contrats",
  operations: "Gestion des opérations",
  staff: "Gestion des effectifs",
  communications: "Gestion des communications",
  panel: "Administration du panel",
  access: "Gestion des accès",
  classified: "Dossiers classifiés",
};

export type PermissionUser = {
  role: Role;
  permContracts: boolean;
  permOperations: boolean;
  permStaff: boolean;
  permCommunications: boolean;
  permPanel: boolean;
  permAccess: boolean;
  permClassified: boolean;
};

const permissionField: Record<PermissionKey, keyof PermissionUser> = {
  contracts: "permContracts",
  operations: "permOperations",
  staff: "permStaff",
  communications: "permCommunications",
  panel: "permPanel",
  access: "permAccess",
  classified: "permClassified",
};

export function hasPermission(user: PermissionUser, key: PermissionKey) {
  if (user.role === "admin" || user.role === "officer") return true;
  if (user.role !== "member") return false;
  return Boolean(user[permissionField[key]]);
}

export function canReviewReports(user: PermissionUser) {
  return user.role === "admin" || user.role === "officer" || hasPermission(user, "access");
}

export const serviceFamilies = [
  { id: "protection", label: "Protection & sécurité" },
  { id: "intel", label: "Renseignement & investigation" },
  { id: "tracking", label: "Traque & recherche" },
  { id: "intervention", label: "Interventions spécialisées" },
  { id: "special", label: "Services spéciaux" },
] as const;

export type ServiceFamily = (typeof serviceFamilies)[number]["id"];

export function serviceFamilyLabel(id: string | null | undefined) {
  return serviceFamilies.find((item) => item.id === id)?.label ?? "—";
}

export function isServiceFamily(value: string): value is ServiceFamily {
  return serviceFamilies.some((item) => item.id === value);
}

export const vipTiers = [
  { id: "argent", label: "Argent" },
  { id: "or", label: "Or" },
  { id: "obsidienne", label: "Obsidienne" },
] as const;

export type VipTier = (typeof vipTiers)[number]["id"];

export const vipStates = [
  { id: "actif", label: "Actif" },
  { id: "suspendu", label: "Suspendu" },
] as const;

export type VipState = (typeof vipStates)[number]["id"];

export function isVipTier(value: string): value is VipTier {
  return vipTiers.some((item) => item.id === value);
}

export function isVipState(value: string): value is VipState {
  return vipStates.some((item) => item.id === value);
}

export const operationStatuses = [
  { id: "planned", label: "Planifiée" },
  { id: "active", label: "En cours" },
  { id: "done", label: "Terminée" },
  { id: "suspended", label: "Suspendu" },
] as const;

export type OperationStatus = (typeof operationStatuses)[number]["id"];

export function operationStatusLabel(id: string) {
  return operationStatuses.find((item) => item.id === id)?.label ?? id;
}

export function isOperationStatus(value: string): value is OperationStatus {
  return operationStatuses.some((item) => item.id === value);
}

export const reportUnits = ["Alpha", "Opérations", "Renseignement", "Logistique", "Autre"] as const;

export const reportKinds = [
  { id: "mission", label: "Rapport de mission" },
  { id: "intel", label: "Renseignement" },
  { id: "incident", label: "Incident" },
  { id: "account", label: "Compte rendu" },
] as const;

export type ReportKind = (typeof reportKinds)[number]["id"];

export const reportClasses = [
  { id: "internal", label: "Interne" },
  { id: "confidential", label: "Confidentiel" },
  { id: "classified", label: "Classifié" },
] as const;

export type ReportClass = (typeof reportClasses)[number]["id"];

export const reportStatuses = [
  { id: "pending", label: "En attente" },
  { id: "review", label: "En révision" },
  { id: "validated", label: "Validé" },
  { id: "archived", label: "Archivé" },
] as const;

export type ReportStatus = (typeof reportStatuses)[number]["id"];

export function reportKindLabel(id: string) {
  return reportKinds.find((item) => item.id === id)?.label ?? id;
}

export function reportClassLabel(id: string) {
  return reportClasses.find((item) => item.id === id)?.label ?? id;
}

export function reportStatusLabel(id: string) {
  return reportStatuses.find((item) => item.id === id)?.label ?? id;
}

export function isReportKind(value: string): value is ReportKind {
  return reportKinds.some((item) => item.id === value);
}

export function isReportClass(value: string): value is ReportClass {
  return reportClasses.some((item) => item.id === value);
}

export function isReportStatus(value: string): value is ReportStatus {
  return reportStatuses.some((item) => item.id === value);
}

export const dossierKinds = [
  { id: "intel", label: "Renseignement" },
  { id: "surveillance", label: "Surveillance" },
  { id: "classified", label: "Confidentiel" },
] as const;

export type DossierKind = (typeof dossierKinds)[number]["id"];

export function isDossierKind(value: string): value is DossierKind {
  return dossierKinds.some((item) => item.id === value);
}

export function contractLabel(request: { status: string; suspended: boolean; channel: boolean }) {
  if (request.channel) return "Canal VIP";
  if (request.suspended) return "Suspendu";
  if (request.status === "done") return "Validé";
  if (request.status === "accepted") return "En cours";
  if (request.status === "open" || request.status === "quoted") return "En attente";
  if (request.status === "refused") return "Refusée";
  if (request.status === "cancelled") return "Annulée";
  return request.status;
}

export function vipDiscountActive(role: string, state: string) {
  return role === "vip" && state !== "suspendu";
}

export function accountName(user: { profile?: { characterName: string } | null; discordUsername?: string | null }) {
  return user.profile?.characterName || user.discordUsername || "Compte";
}
