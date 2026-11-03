import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PublicCatalog } from "@/components/public-catalog";
import { PublicFooter, PublicHeader, PublicMark } from "@/components/public-frame";
import { buttonClass } from "@/components/ui";

export const metadata: Metadata = {
  title: "Services — Ghost",
  description: "Protection, renseignement, traque, interventions spécialisées et services clandestins. Catalogue publié par la division.",
};

const families = [
  {
    icon: "♢",
    title: "Protection & sécurité",
    text: "Protection de personnes, de sites sensibles et de convois. Dispositifs discrets, composés sur mesure.",
  },
  {
    icon: "⌕",
    title: "Renseignement & investigation",
    text: "Collecte, analyse et exploitation d'informations. Enquêtes et surveillances tenues confidentielles.",
  },
  {
    icon: "⊕",
    title: "Traque & recherche",
    text: "Localisation, identification et suivi de personnes ou de groupes d'intérêt.",
  },
  {
    icon: "⚔",
    title: "Interventions spécialisées",
    text: "Opérations à haut risque, escortes, extractions et récupération d'actifs.",
  },
  {
    icon: "♠",
    title: "Services clandestins",
    text: "Missions sensibles, réservées aux contrats qui exigent une discrétion absolue.",
  },
];

export default function Page() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">● Canal sécurisé</p>
        <div className="mt-4 flex items-end gap-5">
          <PublicMark>Nos services</PublicMark>
          <span aria-hidden className="mb-3 hidden h-px flex-1 bg-linear-to-r from-accent via-line/60 to-transparent sm:block" />
        </div>
        <p className="mt-6 max-w-2xl text-sm text-muted">
          Cinq familles de contrats. Le détail publié par la division figure ensuite, sans tarif : le prix se fixe au
          devis.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {families.map((item) => (
            <article key={item.title} className="ghost-panel relative min-h-56 rounded-3xl p-6 transition hover:-translate-y-1">
              <p className="font-serif text-4xl text-accent" aria-hidden>
                {item.icon}
              </p>
              <h2 className="mt-4 font-serif text-xl leading-tight">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.text}</p>
              <span aria-hidden className="absolute right-5 bottom-5 h-3 w-3 border-r border-b border-accent" />
            </article>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="font-serif text-2xl tracking-[0.06em] uppercase">
            <span className="mr-3 font-mono text-lg tracking-normal text-accent">///</span>
            Publié par la division
          </h2>
          <Suspense fallback={<p className="mt-6 text-sm text-muted">Chargement du catalogue…</p>}>
            <PublicCatalog />
          </Suspense>
        </section>

        <section className="ghost-panel mt-10 flex flex-col items-start justify-between gap-6 rounded-3xl px-6 py-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-2xl tracking-[0.06em] uppercase">Un contrat à proposer ?</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Soumettez la demande. Chaque mission est étudiée selon ses risques, ses effectifs et son matériel.
            </p>
          </div>
          <Link href="/connexion" className={buttonClass}>
            Contacter les Ghost
          </Link>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
