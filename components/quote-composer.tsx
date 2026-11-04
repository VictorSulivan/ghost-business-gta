"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { saveQuoteComposition } from "@/app/actions/member";
import { formatMoney, formatPercent, type ActionState } from "@/lib/format";
import {
  dangerLevels,
  parseSurcharge,
  quoteEstimate,
  surchargeBps,
  surchargeOptions,
  type DangerId,
} from "@/lib/quote-estimate";
import { buttonClass, buttonGhostClass } from "./ui";

type Choice = { id: string; name: string; priceCents: number };
type Line = { kind: string; refId: string | null; quantity: number; unitPriceCents: number };

function Feedback({ state }: { state: ActionState }) {
  if (!state?.error && !state?.ok) return null;
  return <p className={state.error ? "text-sm text-danger" : "text-sm text-ok"}>{state.error ?? state.ok}</p>;
}

function MissionPicker({
  label,
  name,
  items,
  selected,
  onChange,
  empty,
}: {
  label: string;
  name: string;
  items: Choice[];
  selected: string[];
  onChange: (ids: string[]) => void;
  empty: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const chosen = items.filter((item) => selected.includes(item.id));
  const summary = chosen.length === 0 ? "Choisir" : chosen.length === 1 ? chosen[0].name : `${chosen.length} sélectionnés`;

  useEffect(() => {
    if (!open) return;
    function close(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  }

  return (
    <div ref={root} className={`relative grid gap-2 ${open ? "z-30" : ""}`}>
      {chosen.map((item) => (
        <input key={item.id} type="hidden" name={name} value={item.id} />
      ))}
      <span className="text-sm">{label}</span>
      <button
        type="button"
        className="flex items-center justify-between rounded-xl border border-white/15 bg-black px-4 py-3 text-left text-sm"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        disabled={items.length === 0}
      >
        <span className={chosen.length === 0 ? "text-muted" : ""}>{items.length === 0 ? empty : summary}</span>
        <span aria-hidden className="text-muted">▾</span>
      </button>
      {open && items.length > 0 ? (
        <ul id={listId} className="absolute top-full z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-white/10 bg-[#2a2a2e] py-2 shadow-2xl">
          {items.map((item) => {
            const checked = selected.includes(item.id);
            return (
              <li key={item.id}>
                <label className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm ${checked ? "text-foreground" : "text-white/75"}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggle(item.id)} className="sr-only" />
                  <span className="w-4 shrink-0 text-accent">{checked ? "✓" : ""}</span>
                  <span>{item.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function QuoteComposer({
  quoteId,
  note,
  services,
  staffItems,
  equipmentItems,
  lines,
  adjustmentReason,
  vipDiscountCents = 0,
}: {
  quoteId: string;
  note: string;
  services: Choice[];
  staffItems: Choice[];
  equipmentItems: Choice[];
  lines: Line[];
  adjustmentReason: string;
  vipDiscountCents?: number;
}) {
  const initial = parseSurcharge(adjustmentReason);
  const [serviceIds, setServiceIds] = useState(() =>
    lines.filter((line) => line.kind === "service" && line.refId).map((line) => line.refId as string),
  );
  const [equipmentIds, setEquipmentIds] = useState(() =>
    lines.filter((line) => line.kind === "equipment" && line.refId).map((line) => line.refId as string),
  );
  const [staffIds, setStaffIds] = useState(() =>
    lines.filter((line) => line.kind === "staff" && line.refId && line.quantity > 0).map((line) => line.refId as string),
  );
  const [danger, setDanger] = useState<DangerId>(initial.dangerId);
  const [extras, setExtras] = useState<string[]>(initial.extraIds);
  const [state, action, pending] = useActionState(saveQuoteComposition, null);

  const serviceCents = services.filter((item) => serviceIds.includes(item.id)).reduce((sum, item) => sum + item.priceCents, 0);
  const staffCents = staffItems.filter((item) => staffIds.includes(item.id)).reduce((sum, item) => sum + item.priceCents, 0);
  const equipmentCents = equipmentItems
    .filter((item) => equipmentIds.includes(item.id))
    .reduce((sum, item) => sum + item.priceCents, 0);
  const bps = surchargeBps(danger, extras);
  const estimate = quoteEstimate(serviceCents, staffCents, equipmentCents, bps);
  const vipDiscount = Math.min(Math.max(0, vipDiscountCents), Math.max(0, estimate.totalCents));

  function toggleExtra(id: string) {
    setExtras((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  return (
    <form action={action} className="grid gap-5 border border-white/10 bg-black p-4 text-foreground">
      <input type="hidden" name="quoteId" value={quoteId} />
      <MissionPicker
        label="Type de mission"
        name="serviceId"
        items={services}
        selected={serviceIds}
        onChange={setServiceIds}
        empty="Aucune prestation au catalogue."
      />

      <MissionPicker
        label="Agents mobilisés"
        name="staffId"
        items={staffItems}
        selected={staffIds}
        onChange={setStaffIds}
        empty="Aucun effectif au catalogue."
      />

      <MissionPicker
        label="Matériel"
        name="equipmentId"
        items={equipmentItems}
        selected={equipmentIds}
        onChange={setEquipmentIds}
        empty="Aucun matériel au catalogue."
      />

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm">Dangerosité</legend>
        {dangerLevels.map((level) => (
          <label key={level.id} className="flex items-center gap-3 text-sm">
            <input
              type="radio"
              name="danger"
              value={level.id}
              checked={danger === level.id}
              onChange={() => setDanger(level.id)}
            />
            {level.label} — +{formatPercent(level.bps)}
          </label>
        ))}
        {surchargeOptions.map((option) => (
          <label key={option.id} className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              name="extra"
              value={option.id}
              checked={extras.includes(option.id)}
              onChange={() => toggleExtra(option.id)}
            />
            {option.label} (+{formatPercent(option.bps)})
          </label>
        ))}
      </fieldset>

      <QuoteFigures
        serviceCents={serviceCents}
        staffCents={staffCents}
        equipmentCents={equipmentCents}
        surchargeCents={estimate.surchargeCents}
        vipDiscountCents={vipDiscount}
        totalCents={estimate.totalCents - vipDiscount}
      />

      <label className="grid gap-2 text-sm text-muted">
        Note pour le client
        <textarea name="note" rows={3} maxLength={2000} defaultValue={note} />
      </label>
      <Feedback state={state} />
      <div className="flex flex-wrap gap-3">
        <button name="intent" value="save" className={buttonGhostClass} disabled={pending}>
          Enregistrer
        </button>
        <button name="intent" value="send" className={buttonClass} disabled={pending}>
          Envoyer le devis
        </button>
      </div>
    </form>
  );
}

export function QuoteFigures({
  serviceCents,
  staffCents,
  equipmentCents,
  surchargeCents,
  vipDiscountCents = 0,
  totalCents,
}: {
  serviceCents: number;
  staffCents: number;
  equipmentCents: number;
  surchargeCents: number;
  vipDiscountCents?: number;
  totalCents: number;
}) {
  const rows = [
    ["Prestation", serviceCents],
    ["Personnel", staffCents],
    ["Matériel", equipmentCents],
    [surchargeCents < 0 ? "Ristourne" : "Majorations", surchargeCents],
    ["Réduction VIP", vipDiscountCents > 0 ? -vipDiscountCents : 0],
  ].filter(([, amount]) => amount !== 0);

  return (
    <div className="grid gap-2 border-t border-white/10 pt-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">Estimation confidentielle</p>
      {rows.map(([label, amount]) => (
        <p key={String(label)} className="flex items-baseline justify-between gap-4 text-sm">
          <span>{label}</span>
          <span>{formatMoney(Number(amount))}</span>
        </p>
      ))}
      <p className="mt-2 font-sans text-4xl font-semibold tracking-tight">{formatMoney(totalCents)}</p>
      <p className="text-sm text-muted">
        Les majorations portent sur les prestations et les effectifs. Le matériel est ajouté ensuite.
        {vipDiscountCents > 0 ? " La réduction VIP est retirée du total." : ""}
      </p>
    </div>
  );
}
