import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter, PublicHeader, PublicMark } from "@/components/public-frame";
import { buttonClass, buttonGhostClass } from "@/components/ui";

export const metadata: Metadata = {
  title: "Organisation — Ghost",
  description: "Les Ghost, organisation clandestine d'élite. Protection, renseignement, traque et interventions à haut risque.",
};

const dossier = [
  { label: "Statut", value: "Actif" },
  { label: "Niveau", value: "Élite" },
  { label: "Menace", value: "Maximale", danger: true },
  { label: "Discrétion", value: "Totale" },
];

const channels = ["Accès : autorisé", "Réseau : chiffré", "Statut : opérationnel"];

export default function Page() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">● Canal sécurisé</p>
        <div className="mt-4">
          <PublicMark>Qui sommes-nous ?</PublicMark>
        </div>
        <p className="mt-6 max-w-2xl font-serif text-xl italic text-foreground/90">
          Aucune trace. Aucune preuve. Aucune erreur.
        </p>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-6">
            <p className="max-w-2xl font-serif text-lg leading-relaxed text-muted">
              Les Ghost sont une organisation clandestine d&apos;élite, spécialisée dans la protection, le renseignement,
              la traque et les interventions à haut risque. Nous opérons dans l&apos;ombre pour des clients qui exigent
              un résultat, sans exposition ni compromis.
            </p>
            <ul className="grid gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted sm:grid-cols-3">
              {channels.map((item) => (
                <li key={item} className="ghost-panel rounded-2xl px-4 py-3">
                  <span className="text-accent">■ </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <aside className="ghost-panel relative rounded-3xl p-6 pt-12">
            <p className="absolute top-5 right-5 rotate-[-8deg] border-2 border-accent px-2 font-serif text-sm tracking-[0.14em] text-accent uppercase">
              Classifié
            </p>
            <p className="border-b border-accent/30 pb-3 font-mono text-[10px] tracking-[0.22em] text-muted uppercase">
              Dossier organisationnel
            </p>
            {dossier.map((row) => (
              <div key={row.label} className="flex items-center justify-between border-b border-accent/15 py-3 font-serif text-sm last:border-0">
                <span className="text-muted">{row.label}</span>
                <span className={row.danger ? "text-danger" : undefined}>{row.value}</span>
              </div>
            ))}
          </aside>
        </div>

        <section className="ghost-panel mt-10 flex flex-col items-start justify-between gap-6 rounded-3xl px-6 py-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-2xl tracking-[0.06em] uppercase">Un contrat à proposer ?</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Chaque mission est étudiée avec confidentialité, selon ses risques et ses objectifs. Le devis reste entre
              le client et le commandement.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/services" className={buttonClass}>
              Voir nos services
            </Link>
            <Link href="/connexion" className={buttonGhostClass}>
              Déposer une demande
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
