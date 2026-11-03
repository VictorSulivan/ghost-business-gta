import { applyAdjustment } from "./format";

export const dangerLevels = [
  { id: "faible", label: "Faible", bps: 0 },
  { id: "elevee", label: "Élevée", bps: 3_000 },
  { id: "extreme", label: "Extrême", bps: 5_000 },
] as const;

export const surchargeOptions = [
  { id: "urgence", label: "Mobilisation urgente", bps: 2_500 },
  { id: "confidentialite", label: "Confidentialité renforcée", bps: 2_000 },
  { id: "exclusivite", label: "Exclusivité des renseignements", bps: 5_000 },
  { id: "argent", label: "Paiement en argent sale RP", bps: 2_500 },
] as const;

export type DangerId = (typeof dangerLevels)[number]["id"];
export type SurchargeId = (typeof surchargeOptions)[number]["id"];

export function dangerLevel(id: string) {
  return dangerLevels.find((level) => level.id === id) ?? dangerLevels[0];
}

export function selectedSurcharges(ids: string[]) {
  return surchargeOptions.filter((option) => ids.includes(option.id));
}

export function surchargeBps(dangerId: string, extraIds: string[]) {
  return dangerLevel(dangerId).bps + selectedSurcharges(extraIds).reduce((sum, option) => sum + option.bps, 0);
}

export function surchargeReason(dangerId: string, extraIds: string[]) {
  const danger = dangerLevel(dangerId);
  const parts = danger.bps > 0 ? [`${danger.label} — +${danger.bps / 100} %`] : [];
  for (const option of selectedSurcharges(extraIds)) {
    parts.push(`${option.label} (+${option.bps / 100} %)`);
  }
  return parts.join(" · ");
}

export function parseSurcharge(reason: string) {
  let dangerId: DangerId = "faible";
  for (const level of dangerLevels) {
    if (level.bps > 0 && reason.includes(level.label)) dangerId = level.id;
  }
  const extraIds = surchargeOptions.filter((option) => reason.includes(option.label)).map((option) => option.id);
  return { dangerId, extraIds };
}

export function quoteEstimate(serviceCents: number, staffCents: number, equipmentCents: number, bps: number) {
  const covered = serviceCents + staffCents;
  const withSurcharge = applyAdjustment(covered, bps > 0 ? "increase" : "none", bps);
  const surchargeCents = withSurcharge - covered;
  return {
    surchargeCents,
    totalCents: withSurcharge + equipmentCents,
  };
}
