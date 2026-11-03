import { Suspense } from "react";
import { LoginForm } from "@/components/auth-forms";
import { PublicPanel } from "@/components/public-frame";

const errors: Record<string, string> = {
  config: "La connexion Discord n'est pas encore configurée.",
  discord: "La connexion Discord a échoué. Réessayez.",
  acces: "Ce compte n'a plus accès.",
};

async function Connexion({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { erreur } = await searchParams;
  const message = erreur ? errors[erreur] : undefined;

  return (
    <PublicPanel
      title="Connexion"
      lede="Les clients et les membres entrent avec Discord. L'administration garde une entrée par e-mail."
    >
      {message ? <p className="mb-4 text-sm text-danger">{message}</p> : null}
      <a href="/auth/discord" className="inline-flex w-full items-center justify-center rounded-full bg-accent px-4 py-3 text-sm font-semibold text-[#1a0b2e]">
        Continuer avec Discord
      </a>
      <details className="mt-8 border-t border-accent/20 pt-6">
        <summary className="cursor-pointer text-sm uppercase tracking-[0.16em] text-muted">Administration</summary>
        <div className="mt-4">
          <LoginForm />
        </div>
      </details>
    </PublicPanel>
  );
}

export default function Page({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  return (
    <Suspense fallback={<p className="p-8 text-muted">Chargement…</p>}>
      <Connexion searchParams={searchParams} />
    </Suspense>
  );
}
