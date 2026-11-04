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
  onClose,
}: {
  kind: keyof typeof catalogAction;
  entry: CatalogEntry | null;
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
        Description
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

function CatalogDetail({
  entry,
  onEdit,
  onClose,
}: {
  entry: CatalogEntry;
  onEdit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-xl">{entry.name}</h3>
        <button type="button" className="text-sm text-muted hover:text-foreground" onClick={onClose}>
          Fermer
        </button>
      </div>
      <dl className="grid gap-3 text-sm">
        <div>
          <dt className="text-muted">Description</dt>
          <dd className="mt-1 whitespace-pre-wrap">{entry.detail || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted">Coût</dt>
          <dd className="mt-1 text-accent">{entry.priceLabel}</dd>
        </div>
        <div>
          <dt className="text-muted">Utilisable sur une mission</dt>
          <dd className="mt-1">{entry.active ? "Oui" : "Non"}</dd>
        </div>
      </dl>
      <button type="button" className={buttonClass} onClick={onEdit}>
        Modifier
      </button>
    </div>
  );
}

export function CategoryBoard({
  title,
  kind,
  entries,
}: {
  title: string;
  kind: keyof typeof catalogAction;
  entries: CatalogEntry[];
}) {
  const [panel, setPanel] = useState<
    { mode: "create" } | { mode: "detail"; entry: CatalogEntry } | { mode: "edit"; entry: CatalogEntry } | null
  >(null);

  return (
    <section className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-2xl uppercase tracking-[0.12em]">{title}</h2>
        <button type="button" className={`${buttonClass} shrink-0 px-3 py-2 text-sm`} onClick={() => setPanel({ mode: "create" })}>
          Ajouter
        </button>
      </div>
      <div className="ghost-panel">
        <table className="w-full table-fixed text-left text-base">
          <colgroup>
            <col className="w-[46%]" />
            <col className="w-[27%]" />
            <col className="w-[27%]" />
          </colgroup>
          <thead className="text-sm uppercase tracking-[0.16em] text-accent">
            <tr>
              <th className="px-5 py-4 font-medium">Nom</th>
              <th className="px-5 py-4 font-medium">Coût</th>
              <th className="px-5 py-4 font-medium">
                <span className="sr-only">Détail</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-muted">
                  Aucun élément.
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const open = panel && panel.mode !== "create" && panel.entry.id === entry.id;
                return (
                  <tr key={entry.id} className={`border-t border-accent/20 ${open ? "bg-accent/10" : ""}`}>
                    <td className="px-5 py-4">{entry.name}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-accent">{entry.priceLabel}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        className={`${buttonGhostClass} px-3 py-1.5`}
                        onClick={() => setPanel({ mode: "detail", entry })}
                      >
                        Détail
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {panel ? (
        <div className="ghost-panel p-5">
          {panel.mode === "detail" ? (
            <CatalogDetail
              entry={panel.entry}
              onEdit={() => setPanel({ mode: "edit", entry: panel.entry })}
              onClose={() => setPanel(null)}
            />
          ) : (
            <CatalogEntryForm
              key={panel.mode === "edit" ? panel.entry.id : "new"}
              kind={kind}
              entry={panel.mode === "edit" ? panel.entry : null}
              onClose={() => setPanel(null)}
            />
          )}
        </div>
      ) : null}
    </section>
  );
}
