"use client";

import { useActionState, useEffect, useRef } from "react";
import { cancelRequest, createRequest, markDone, sendMessage } from "@/app/actions/client";
import { refuseRequest } from "@/app/actions/member";
import type { ActionState } from "@/lib/format";
import { buttonClass, buttonDangerClass, buttonGhostClass } from "./ui";

function Feedback({ state }: { state: ActionState }) {
  if (!state?.error && !state?.ok) return null;
  return <p className={state.error ? "text-sm text-danger" : "text-sm text-ok"}>{state.error ?? state.ok}</p>;
}

export function NewRequestForm() {
  const [state, action, pending] = useActionState(createRequest, null);
  return (
    <form action={action} className="grid gap-4 ghost-panel rounded-3xl p-5">
      <h2 className="font-serif text-2xl">Nouvelle demande</h2>
      <label className="grid gap-2 text-sm text-muted">
        Titre
        <input name="title" required maxLength={120} />
      </label>
      <label className="grid gap-2 text-sm text-muted">
        Ce que vous attendez du groupe
        <textarea name="body" required rows={5} maxLength={4000} />
      </label>
      <Feedback state={state} />
      <button className={buttonClass} disabled={pending}>
        {pending ? "Envoi…" : "Ouvrir la demande"}
      </button>
    </form>
  );
}

export function MessageForm({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState(sendMessage, null);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);
  return (
    <form ref={formRef} action={action} className="grid gap-3">
      <input type="hidden" name="requestId" value={requestId} />
      <label className="grid gap-2 text-sm text-muted">
        Message
        <textarea name="body" required rows={4} maxLength={4000} />
      </label>
      <Feedback state={state} />
      <button className={buttonClass} disabled={pending}>
        {pending ? "Envoi…" : "Envoyer"}
      </button>
    </form>
  );
}

export function CancelRequestButton({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState(cancelRequest, null);
  return (
    <form action={action}>
      <input type="hidden" name="requestId" value={requestId} />
      <button className={buttonDangerClass} disabled={pending}>
        Annuler la demande
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function RefuseRequestButton({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState(refuseRequest, null);
  return (
    <form action={action}>
      <input type="hidden" name="requestId" value={requestId} />
      <button className={buttonDangerClass} disabled={pending}>
        Refuser la demande
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function MarkDoneButton({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState(markDone, null);
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="requestId" value={requestId} />
      <button className={buttonGhostClass} disabled={pending}>
        Marquer comme terminée
      </button>
      <Feedback state={state} />
    </form>
  );
}
