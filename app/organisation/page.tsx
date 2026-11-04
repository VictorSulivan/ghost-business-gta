import type { Metadata } from "next";
import { ContractCall, PublicFooter, PublicHeader, PublicMark } from "@/components/public-frame";

export const metadata: Metadata = {
  title: "Organisation — Ghost",
  description: "Les Ghost, organisation d'élite. Protection, renseignement, traque et interventions à haut risque.",
};

const dossier = [
  { label: "Statut", value: "Actif" },
  { label: "Niveau", value: "Élite" },
  { label: "Menace", value: "Maximale", danger: true },
  { label: "Discrétion", value: "Totale" },
];

export default function Page() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PublicHeader />
      <main className="flex-1 py-14">
        <div className="ghost-wrap grid items-center gap-8 lg:grid-cols-[245px_minmax(0,1fr)_330px]">
          <img
            src="/brand/intro_team.webp"
            alt="Opérateur Ghost"
            className="h-56 w-full border border-[#772635] object-cover shadow-[0_0_24px_#b3162f24] lg:h-56"
          />
          <div>
            <PublicMark>Qui sommes-nous ?</PublicMark>
            <p className="mt-6 font-serif text-lg leading-relaxed text-[#c9c8ce]">
              Les Ghost sont une organisation d&apos;élite, spécialisée dans la protection, le renseignement, la traque
              et les interventions à haut risque. Nous opérons dans l&apos;ombre pour des clients qui exigent un
              résultat, sans exposition ni compromis.
            </p>
          </div>
          <aside className="relative border border-[#823343] bg-linear-to-br from-[#11101b] to-[#090b12] p-6 pt-12 shadow-[inset_0_0_30px_#91192b14]">
            <p className="absolute top-3 right-3 rotate-[-9deg] border-2 border-accent px-2 font-serif text-lg text-accent">
              Classifié
            </p>
            <p className="border-b border-[#4b3340] pb-3 font-mono text-[10px] tracking-[0.16em] text-[#a4a3b0] uppercase">
              Dossier organisationnel
            </p>
            {dossier.map((row) => (
              <div key={row.label} className="flex items-center justify-between border-b border-[#2c2b35] py-2 font-serif text-[15px] last:border-0">
                <span>{row.label}</span>
                <span className={row.danger ? "text-danger" : undefined}>{row.value}</span>
              </div>
            ))}
          </aside>
        </div>
      </main>
      <ContractCall
        title="Un contrat à proposer ?"
        text="Chaque mission est étudiée avec confidentialité, selon ses risques et ses objectifs."
        href="/services"
        label="Voir nos services"
      />
      <PublicFooter />
    </div>
  );
}
