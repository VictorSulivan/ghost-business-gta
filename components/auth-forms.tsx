"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";
import { buttonClass } from "./ui";

function Field({
  label,
  name,
  type = "text",
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="grid gap-2 text-sm text-muted">
      {label}
      <input name={name} type={type} autoComplete={autoComplete} required />
    </label>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="grid gap-4">
      <Field label="E-mail" name="email" type="email" autoComplete="email" />
      <Field label="Mot de passe" name="password" type="password" autoComplete="current-password" />
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <button className={buttonClass} disabled={pending}>
        {pending ? "Connexion…" : "Entrer"}
      </button>
    </form>
  );
}
