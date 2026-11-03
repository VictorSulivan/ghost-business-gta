"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/client";
import { buttonClass } from "./ui";

export function ProfileForm({
  characterName,
  phone,
  description,
  notes,
}: {
  characterName: string;
  phone: string;
  description: string;
  notes: string;
}) {
  const [state, action, pending] = useActionState(updateProfile, null);
  return (
    <form action={action} className="grid max-w-2xl gap-4">
      <label className="grid gap-2 text-sm text-muted">
        Nom du personnage
        <input name="characterName" required defaultValue={characterName} maxLength={80} />
      </label>
      <label className="grid gap-2 text-sm text-muted">
        Téléphone RP
        <input name="phone" defaultValue={phone} maxLength={40} />
      </label>
      <label className="grid gap-2 text-sm text-muted">
        Description
        <textarea name="description" rows={4} defaultValue={description} maxLength={2000} />
      </label>
      <label className="grid gap-2 text-sm text-muted">
        Notes pour le groupe
        <textarea name="notes" rows={4} defaultValue={notes} maxLength={2000} />
      </label>
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-ok">{state.ok}</p> : null}
      <button className={buttonClass} disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer la fiche"}
      </button>
    </form>
  );
}
