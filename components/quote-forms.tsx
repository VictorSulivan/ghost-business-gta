"use client";

import { useActionState, useEffect, useState } from "react";
import {
  acceptQuote,
  addQuoteLine,
  prepareQuote,
  refuseQuote,
  removeQuoteLine,
  sendQuote,
} from "@/app/actions/member";
import { applyAdjustment, formatMoney, formatPercent, type ActionState, type QuoteAdjustment } from "@/lib/format";
import { buttonClass, buttonDangerClass, buttonGhostClass } from "./ui";

function Feedback({ state }: { state: ActionState }) {
  if (!state?.error && !state?.ok) return null;
  return <p className={state.error ? "text-sm text-danger" : "text-sm text-ok"}>{state.error ?? state.ok}</p>;
}

export function PrepareQuoteButton({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState(prepareQuote, null);
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="requestId" value={requestId} />
      <button className={buttonClass} disabled={pending}>
        Préparer un devis
      </button>
      <Feedback state={state} />
    </form>
  );
}

type CatalogChoice = { id: string; name: string; priceCents: number };

function ChoiceSelect({ label, items }: { label: string; items: CatalogChoice[] }) {
  return (
    <label className="grid gap-2 text-sm text-muted">
      {label}
      <select name="refId" required defaultValue="">
        <option value="" disabled>
          Choisir
        </option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name} — {formatMoney(item.priceCents)}
          </option>
        ))}
      </select>
    </label>
  );
}

export function QuoteLineForm({
  quoteId,
  services,
  staffItems,
  equipmentItems,
}: {
  quoteId: string;
  services: CatalogChoice[];
  staffItems: CatalogChoice[];
  equipmentItems: CatalogChoice[];
}) {
  const [kind, setKind] = useState("service");
  const [state, action, pending] = useActionState(addQuoteLine, null);

  useEffect(() => {
    if (state?.ok) setKind("service");
  }, [state]);

  return (
    <form action={action} className="grid gap-3 rounded-2xl border border-line p-4">
      <input type="hidden" name="quoteId" value={quoteId} />
      <label className="grid gap-2 text-sm text-muted">
        Type de ligne
        <select name="kind" value={kind} onChange={(event) => setKind(event.target.value)}>
          <option value="service">Prestation</option>
          <option value="staff">Effectif</option>
          <option value="equipment">Matériel</option>
          <option value="custom">Ligne libre</option>
        </select>
      </label>
      {kind === "service" ? <ChoiceSelect key="service" label="Prestation" items={services} /> : null}
      {kind === "staff" ? <ChoiceSelect key="staff" label="Effectif" items={staffItems} /> : null}
      {kind === "equipment" ? <ChoiceSelect key="equipment" label="Matériel" items={equipmentItems} /> : null}
      {kind === "custom" ? (
        <label className="grid gap-2 text-sm text-muted">
          Libellé
          <input name="label" maxLength={120} />
        </label>
      ) : null}
      <label className="grid gap-2 text-sm text-muted">
        Coût (€)
        <input name="unitPrice" inputMode="decimal" placeholder="Coût du catalogue si vide" />
      </label>
      <Feedback state={state} />
      <button className={buttonGhostClass} disabled={pending}>
        Ajouter la ligne
      </button>
    </form>
  );
}

export function RemoveLineButton({ lineId }: { lineId: string }) {
  const [state, action, pending] = useActionState(removeQuoteLine, null);
  return (
    <form action={action}>
      <input type="hidden" name="lineId" value={lineId} />
      <button className="text-sm text-danger disabled:opacity-60" disabled={pending}>
        Retirer
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function SendQuoteForm({ quoteId, note, subtotalCents }: { quoteId: string; note: string; subtotalCents: number }) {
  const [state, action, pending] = useActionState(sendQuote, null);
  const [adjustment, setAdjustment] = useState<QuoteAdjustment>("none");
  const [percent, setPercent] = useState("");
  const bps = Math.round(Number(percent.replace(",", ".")) * 100);
  const validBps = Number.isFinite(bps) && bps > 0 && bps <= 100_000 && (adjustment !== "discount" || bps <= 10_000);
  const totalCents = adjustment === "none" || !validBps ? subtotalCents : applyAdjustment(subtotalCents, adjustment, bps);

  return (
    <form action={action} className="grid gap-3">
      <input type="hidden" name="quoteId" value={quoteId} />
      <fieldset className="grid gap-3 rounded-2xl border border-line p-4">
        <legend className="px-1 text-sm uppercase tracking-[0.16em] text-accent">Ajustement</legend>
        <label className="grid gap-2 text-sm text-muted">
          Type
          <select name="adjustment" value={adjustment} onChange={(event) => setAdjustment(event.target.value as QuoteAdjustment)}>
            <option value="none">Aucun</option>
            <option value="discount">Ristourne</option>
            <option value="increase">Augmentation</option>
          </select>
        </label>
        {adjustment === "none" ? null : (
          <>
            <label className="grid gap-2 text-sm text-muted">
              Pourcentage
              <input
                name="adjustmentPercent"
                inputMode="decimal"
                required
                value={percent}
                onChange={(event) => setPercent(event.target.value)}
                placeholder="30"
              />
            </label>
            <label className="grid gap-2 text-sm text-muted">
              Raison
              <textarea name="adjustmentReason" rows={3} maxLength={2000} required placeholder="Pourquoi ce modificateur s'applique" />
            </label>
          </>
        )}
        <p className="text-right text-sm">
          {adjustment !== "none" && validBps ? (
            <span className="mr-3 text-muted">
              {adjustment === "discount" ? "−" : "+"}
              {formatPercent(bps)}
            </span>
          ) : null}
          Total {formatMoney(totalCents)}
        </p>
      </fieldset>
      <label className="grid gap-2 text-sm text-muted">
        Note pour le client
        <textarea name="note" rows={3} maxLength={2000} defaultValue={note} />
      </label>
      <Feedback state={state} />
      <button className={buttonClass} disabled={pending}>
        Envoyer le devis
      </button>
    </form>
  );
}

export function AcceptQuoteButton({ quoteId }: { quoteId: string }) {
  const [state, action, pending] = useActionState(acceptQuote, null);
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="quoteId" value={quoteId} />
      <button className={buttonClass} disabled={pending}>
        Accepter le devis
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function RefuseQuoteButton({ quoteId }: { quoteId: string }) {
  const [state, action, pending] = useActionState(refuseQuote, null);
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="quoteId" value={quoteId} />
      <button className={buttonDangerClass} disabled={pending}>
        Refuser le devis
      </button>
      <Feedback state={state} />
    </form>
  );
}
