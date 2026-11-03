"use client";

import { useActionState, useEffect, useState } from "react";
import { updateMemberAccess } from "@/app/actions/auth";
import type { ActionState } from "@/lib/format";
import { buttonClass, buttonGhostClass } from "./ui";

function Feedback({ state }: { state: ActionState }) {
  if (!state?.error && !state?.ok) return null;
  return <p className={state.error ? "text-sm text-danger" : "text-sm text-ok"}>{state.error ?? state.ok}</p>;
}

export type AccountRow = {
  id: string;
  name: string;
  contact: string;
  since: string;
  role: "client" | "member";
  active: boolean;
};

function AccessForm({ account, onClose }: { account: AccountRow; onClose: () => void }) {
  const [state, action, pending] = useActionState(updateMemberAccess, null);

  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);

  return (
    <form action={action} className="grid gap-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-xl">Accès</h3>
        <button type="button" className="text-sm text-muted hover:text-foreground" onClick={onClose}>
          Fermer
        </button>
      </div>
      <input type="hidden" name="id" value={account.id} />
      <p className="text-sm">
        {account.name}
        <span className="mt-1 block text-muted">{account.contact}</span>
      </p>
      <label className="grid gap-2 text-sm text-muted">
        Espace
        <select name="role" defaultValue={account.role}>
          <option value="client">Client</option>
          <option value="member">Membre</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm text-muted">
        Accès
        <select name="active" defaultValue={account.active ? "yes" : "no"}>
          <option value="yes">Ouvert</option>
          <option value="no">Fermé</option>
        </select>
      </label>
      <Feedback state={state} />
      <button className={buttonClass} disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}

export function MemberBoard({ accounts }: { accounts: AccountRow[] }) {
  const [draft, setDraft] = useState<AccountRow | undefined>(undefined);

  return (
    <section className="grid gap-4">
      <h2 className="font-serif text-2xl uppercase tracking-[0.12em]">Comptes Discord</h2>
      <div className={draft ? "grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]" : "grid"}>
        <div className="overflow-x-auto ghost-panel rounded-3xl">
          <table className="w-full min-w-[48rem] text-left text-base">
            <thead className="text-sm uppercase tracking-[0.16em] text-accent">
              <tr>
                <th className="px-6 py-4 font-medium">Personnage</th>
                <th className="px-6 py-4 font-medium">Discord</th>
                <th className="px-6 py-4 font-medium">Depuis</th>
                <th className="px-6 py-4 font-medium">Espace</th>
                <th className="px-6 py-4 font-medium">Accès</th>
                <th className="px-6 py-4 font-medium">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-muted">
                    Aucun compte pour le moment. Ils apparaissent après une première connexion Discord.
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.id} className="border-t border-accent/20">
                    <td className="px-6 py-5">{account.name}</td>
                    <td className="px-6 py-5 text-muted">{account.contact}</td>
                    <td className="whitespace-nowrap px-6 py-5">{account.since}</td>
                    <td className="px-6 py-5">{account.role === "member" ? "Membre" : "Client"}</td>
                    <td className="px-6 py-5">{account.active ? "Ouvert" : "Fermé"}</td>
                    <td className="px-6 py-5 text-right">
                      <button type="button" className={buttonGhostClass} onClick={() => setDraft(account)}>
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {draft ? (
          <div className="ghost-panel rounded-3xl p-5">
            <AccessForm key={draft.id} account={draft} onClose={() => setDraft(undefined)} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
