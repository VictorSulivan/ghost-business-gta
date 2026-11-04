import type { Metadata } from "next";
import { Suspense } from "react";
import { PublicCatalog } from "@/components/public-catalog";
import { ContractCall, PublicFooter, PublicHeader, PublicMark } from "@/components/public-frame";

export const metadata: Metadata = {
  title: "Services — Ghost",
  description: "Protection, renseignement, traque, interventions spécialisées et services en tout genre. Catalogue publié par la division.",
};

const families = [
  {
    icon: "♢",
    image: "/brand/service_protection.webp",
    title: "Protection & sécurité",
    text: "Protection de personnes, de sites sensibles et de convois. Dispositifs discrets, composés sur mesure.",
  },
  {
    icon: "⌕",
    image: "/brand/service_intel.webp",
    title: "Renseignement & investigation",
    text: "Collecte, analyse et exploitation d'informations. Enquêtes et surveillances tenues confidentielles.",
  },
  {
    icon: "⊕",
    image: "/brand/service_tracking.webp",
    title: "Traque & recherche",
    text: "Localisation, identification et suivi de personnes ou de groupes d'intérêt.",
  },
  {
    icon: "⚔",
    image: "/brand/service_intervention.webp",
    title: "Interventions spécialisées",
    text: "Opérations à haut risque, escortes, extractions et récupération d'actifs.",
  },
  {
    icon: "♠",
    image: "/brand/service_secret.webp",
    title: "Services Spéciaux",
    text: "Missions sensibles, réservées aux contrats qui exigent une discrétion absolue.",
  },
];

export default function Page() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PublicHeader />
      <main className="flex-1 py-14">
        <div className="ghost-wrap">
          <div className="mb-6 flex items-center gap-5">
            <PublicMark>Nos services</PublicMark>
            <span aria-hidden className="hidden h-px flex-1 bg-linear-to-r from-accent via-[#484854] to-transparent sm:block" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {families.map((item) => (
              <article
                key={item.title}
                className="group relative min-h-0 overflow-hidden border border-[#64303c] bg-[#0d0f17] px-4 pt-0 pb-4 transition hover:-translate-y-1.5 hover:border-accent hover:shadow-[0_5px_25px_#b118302c] xl:min-h-[330px]"
              >
                <div className="relative -mx-4 mb-2 h-32 overflow-hidden">
                  <img
                    src={item.image}
                    alt=""
                    className="h-full w-full object-cover contrast-110 saturate-[.65] transition duration-300 group-hover:scale-105 group-hover:saturate-90"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#0d0f17] via-transparent to-transparent" />
                </div>
                <p className="relative z-1 -mt-10 mb-2 font-serif text-3xl text-[#f04961]" aria-hidden>
                  {item.icon}
                </p>
                <h2 className="min-h-12 text-lg leading-tight font-bold">{item.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-[#c1c1cb]">{item.text}</p>
                <span aria-hidden className="absolute right-0 bottom-0 h-px w-7 origin-right -rotate-45 border-b-2 border-accent" />
              </article>
            ))}
          </div>

          <section className="mt-14">
            <h2 className="font-serif text-[clamp(1.75rem,3vw,2.4rem)] font-medium">
              <span className="mr-4 font-mono text-2xl tracking-normal text-accent">///</span>
              Publié par la division
            </h2>
            <Suspense fallback={<p className="mt-6 text-sm text-muted">Chargement du catalogue…</p>}>
              <PublicCatalog />
            </Suspense>
          </section>
        </div>
      </main>
      <ContractCall
        title="Un contrat à proposer ?"
        text="Soumettez la demande. Chaque mission est étudiée selon ses risques, ses effectifs et son matériel."
        href="/connexion"
        label="Contacter les Ghost"
      />
      <PublicFooter />
    </div>
  );
}
