import Link from "next/link";
import { PublicHeader } from "@/components/public-frame";

const valuesLeft = ["Personnes", "Biens", "Événements", "Entreprises"];
const valuesRight = ["Discrétion", "Professionnalisme", "Réactivité", "Protection"];
const verbs = ["Protéger", "Anticiper", "Garantir"];

const services = [
  ["Protection rapprochée individuelle", "75 000 $ / heure"],
  ["Protection VIP", "250 000 $ / jour"],
  ["Sécurité d'entreprise", "100 000 $ / heure"],
  ["Sécurisation d'événement privé", "150 000 $ / événement"],
  ["Sécurisation d'événement majeur", "300 000 $ / événement"],
  ["Escorte de véhicule", "100 000 $ / trajet"],
  ["Protection de convoi", "150 000 $ / convoi"],
  ["Surveillance de propriété", "75 000 $ / heure"],
  ["Protection permanente", "Sur devis"],
];

const staff = [
  ["Agent opérationnel sur zone", "25 000 $"],
  ["Agent spécialisé", "40 000 $"],
  ["Chef d'équipe opérationnel", "50 000 $"],
  ["Agent de soutien hors zone", "15 000 $"],
];

const gear = [
  ["Véhicule de service", "15 000 $"],
  ["Véhicule blindé", "50 000 $"],
  ["Véhicule de transport tactique", "35 000 $"],
  ["Hélicoptère", "100 000 $"],
  ["Drone de reconnaissance", "20 000 $"],
  ["Équipement spécialisé", "Sur devis"],
];

const adjustments = [
  ["Danger élevé", "+30 %"],
  ["Danger extrême", "+50 %"],
  ["Paiement en argent sale (RP)", "+25 %"],
];

function RateList({ rows }: { rows: string[][] }) {
  return (
    <ul className="mt-4 divide-y divide-accent/20">
      {rows.map(([label, price]) => (
        <li key={label} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
          <span>{label}</span>
          <span className="shrink-0 text-accent">{price}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-12">
        <section className="grid items-center gap-8 lg:grid-cols-[140px_1fr_160px]">
          <ul className="hidden text-xs uppercase tracking-[0.22em] text-muted lg:grid lg:gap-3">
            {valuesLeft.map((item) => (
              <li key={item}>{item}</li>
            ))}
            <li className="pt-4 text-accent">Une longueur d&apos;avance</li>
          </ul>

          <div className="text-center">
            <div className="mx-auto mb-6 grid h-28 w-28 place-items-center rounded-full border border-accent/70 shadow-[0_0_32px_rgba(168,85,247,0.35)]">
              <span className="font-serif text-xs tracking-[0.22em]">
                GHOST
                <span className="mt-1 block text-[9px] tracking-[0.18em] text-accent">SPECIAL OPERATIONS</span>
              </span>
            </div>
            <h1 className="metal font-serif text-6xl tracking-[0.18em] sm:text-8xl">GHOST</h1>
            <p className="mt-3 text-xs uppercase tracking-[0.28em] text-muted sm:text-sm">
              Division 01 — Protection &amp; sécurité
            </p>
            <p className="mx-auto mt-6 max-w-xl text-sm uppercase tracking-[0.16em] text-foreground/90">
              Votre sécurité est notre mission.
              <span className="mt-1 block text-muted">Votre confiance, notre engagement.</span>
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/connexion" className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-[#1a0b2e] shadow-[0_0_24px_rgba(168,85,247,0.35)]">
                Se connecter avec Discord
              </Link>
            </div>
          </div>

          <ul className="hidden text-right text-xs uppercase tracking-[0.22em] text-muted lg:grid lg:gap-3">
            {valuesRight.map((item) => (
              <li key={item}>{item}</li>
            ))}
            <li className="pt-4 text-accent">Partout. Toujours.</li>
          </ul>
        </section>

        <ul className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.18em] text-accent lg:hidden">
          {verbs.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <section className="mt-14 grid gap-4 lg:grid-cols-2">
          <article className="ghost-panel rounded-3xl p-6">
            <h2 className="text-sm uppercase tracking-[0.22em] text-accent">Services &amp; tarifs de référence</h2>
            <RateList rows={services} />
          </article>
          <div className="grid gap-4">
            <article className="ghost-panel rounded-3xl p-6">
              <h2 className="text-sm uppercase tracking-[0.22em] text-accent">Effectifs déployés</h2>
              <RateList rows={staff} />
            </article>
            <article className="ghost-panel rounded-3xl p-6">
              <h2 className="text-sm uppercase tracking-[0.22em] text-accent">Matériel déployé</h2>
              <RateList rows={gear} />
            </article>
          </div>
          <article className="ghost-panel rounded-3xl p-6">
            <h2 className="text-sm uppercase tracking-[0.22em] text-accent">Ajustements</h2>
            <RateList rows={adjustments} />
          </article>
          <article className="ghost-panel flex flex-col justify-center rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-accent">Protéger · Anticiper · Garantir</p>
            <p className="mt-4 text-muted">
              Le détail d&apos;une mission se règle en privé. Le client ouvre une demande, le commandement répond,
              puis un devis est établi.
            </p>
          </article>
        </section>

        <section className="ghost-panel mt-4 rounded-3xl px-6 py-8 text-center">
          <p className="text-sm uppercase tracking-[0.16em]">
            Chaque contrat fait l&apos;objet d&apos;un devis personnalisé
          </p>
          <p className="mt-2 text-sm text-muted">
            Selon le niveau de risque, les effectifs engagés et le matériel mobilisé.
          </p>
          <p className="mt-5 text-xs uppercase tracking-[0.22em] text-accent">
            Validation obligatoire par le commandement Ghost.
          </p>
        </section>
      </main>
    </div>
  );
}
