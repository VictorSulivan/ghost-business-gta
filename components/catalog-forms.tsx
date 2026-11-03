"use client";

import { useActionState, useEffect, useState } from "react";
import { saveEquipment, saveService, saveStaff } from "@/app/actions/member";
import type { ActionState } from "@/lib/format";
import { buttonClass, buttonGhostClass } from "./ui";

function Feedback({ state }: { state: ActionState }) {
  if (!state?.error && !state?.ok) return null;
  return <p className={state.error ? "text-sm text-danger" : "text-sm text-ok"}>{state.error ?? state.ok}</p>;
}

export type CatalogEntry = {
  id: string;
  name: string;
  detail: string;
  price: string;
  priceLabel: string;
  active: boolean;
};

const catalogAction = {
  service: saveService,
  staff: saveStaff,
  equipment: saveEquipment,
};

function CatalogEntryForm({
  kind,
  entry,
  detailLabel,
  onClose,
}: {
  kind: keyof typeof catalogAction;
  entry: CatalogEntry | null;
  detailLabel: string;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState(catalogAction[kind], null);
  const detailName = kind === "service" ? "description" : "notes";

  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);

  return (
    <form action={action} className="grid gap-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-xl">{entry ? "Modifier" : "Ajouter"}</h3>
        <button type="button" className="text-sm text-muted hover:text-foreground" onClick={onClose}>
          Fermer
        </button>
      </div>
      {entry ? <input type="hidden" name="id" value={entry.id} /> : null}
      <label className="grid gap-2 text-sm text-muted">
        Nom
        <input name="name" required defaultValue={entry?.name ?? ""} maxLength={80} />
      </label>
      <label className="grid gap-2 text-sm text-muted">
        {detailLabel}
        <textarea name={detailName} rows={3} defaultValue={entry?.detail ?? ""} maxLength={2000} />
      </label>
      <label className="grid gap-2 text-sm text-muted">
        Coût (€)
        <input name="price" required inputMode="decimal" defaultValue={entry?.price ?? ""} />
      </label>
      <label className="grid gap-2 text-sm text-muted">
        Utilisable sur une mission
        <select name="active" defaultValue={entry?.active === false ? "no" : "yes"}>
          <option value="yes">Oui</option>
          <option value="no">Non</option>
        </select>
      </label>
      <Feedback state={state} />
      <button className={buttonClass} disabled={pending}>
        {pending ? "Enregistrement…" : entry ? "Enregistrer" : "Ajouter"}
      </button>
    </form>
  );
}

export function CategoryBoard({
  title,
  kind,
  detailLabel,
  entries,
}: {
  title: string;
  kind: keyof typeof catalogAction;
  detailLabel: string;
  entries: CatalogEntry[];
}) {
  const [draft, setDraft] = useState<CatalogEntry | null | undefined>(undefined);
  const formOpen = draft !== undefined;

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl uppercase tracking-[0.12em]">{title}</h2>
        <button type="button" className={buttonClass} onClick={() => setDraft(null)}>
          Ajouter
        </button>
      </div>
      <div className={formOpen ? "grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]" : "grid"}>
        <div className="overflow-x-auto ghost-panel rounded-3xl">
          <table className="w-full min-w-[48rem] text-left text-base">
            <thead className="text-sm uppercase tracking-[0.16em] text-accent">
              <tr>
                <th className="px-6 py-4 font-medium">Nom</th>
                <th className="px-6 py-4 font-medium">{detailLabel}</th>
                <th className="px-6 py-4 font-medium">Coût</th>
                <th className="px-6 py-4 font-medium">Mission</th>
                <th className="px-6 py-4 font-medium">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-muted">
                    Aucun élément.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="border-t border-accent/20">
                    <td className="px-6 py-5">{entry.name}</td>
                    <td className="px-6 py-5 text-muted">
                      <span className="line-clamp-2">{entry.detail || "—"}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-5 text-accent">{entry.priceLabel}</td>
                    <td className="px-6 py-5">{entry.active ? "Oui" : "Non"}</td>
                    <td className="px-6 py-5 text-right">
                      <button type="button" className={buttonGhostClass} onClick={() => setDraft(entry)}>
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {formOpen ? (
          <div className="ghost-panel rounded-3xl p-5">
            <CatalogEntryForm
              key={draft?.id ?? "new"}
              kind={kind}
              entry={draft}
              detailLabel={detailLabel}
              onClose={() => setDraft(undefined)}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
