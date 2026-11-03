import type { quoteAdjustment, requestStatus, quoteStatus } from "./db/schema";

type RequestStatus = (typeof requestStatus.enumValues)[number];
type QuoteStatus = (typeof quoteStatus.enumValues)[number];
export type QuoteAdjustment = (typeof quoteAdjustment.enumValues)[number];

export function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function eurosToCents(input: string): number | null {
  const value = input.trim().replace(/\s/g, "").replace(",", ".");
  if (!value) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;
  const cents = Math.round(Number(value) * 100);
  if (!Number.isSafeInteger(cents) || cents < 0 || cents > 100_000_000) return null;
  return cents;
}

export function readPercentBps(input: string): number | null {
  const value = input.trim().replace(/\s/g, "").replace(",", ".");
  if (!value) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return null;
  const bps = Math.round(Number(value) * 100);
  if (!Number.isSafeInteger(bps) || bps <= 0 || bps > 100_000) return null;
  return bps;
}

export function applyAdjustment(subtotalCents: number, kind: QuoteAdjustment, bps: number) {
  if (kind === "none" || bps <= 0) return subtotalCents;
  const factor = kind === "discount" ? 10_000 - bps : 10_000 + bps;
  return Math.round((subtotalCents * factor) / 10_000);
}

export function formatPercent(bps: number) {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(bps / 100)} %`;
}

export const adjustmentLabel: Record<QuoteAdjustment, string> = {
  none: "Aucun",
  discount: "Ristourne",
  increase: "Augmentation",
};

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export const requestStatusLabel: Record<RequestStatus, string> = {
  open: "Ouverte",
  quoted: "Devis envoyé",
  accepted: "Acceptée",
  done: "Terminée",
  refused: "Refusée",
  cancelled: "Annulée",
};

export const quoteStatusLabel: Record<QuoteStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  accepted: "Accepté",
  refused: "Refusé",
};

export function isClosedRequest(status: RequestStatus) {
  return status === "done" || status === "refused" || status === "cancelled";
}

export function isUniqueViolation(error: unknown) {
  const seen = new Set<unknown>();
  let current: unknown = error;
  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    if ("code" in current && current.code === "23505") return true;
    current = "cause" in current ? current.cause : undefined;
  }
  return false;
}

export type ActionState = { error?: string; ok?: string } | null;
