import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PublicHeader } from "@/components/public-frame";
import { listPublicCatalog } from "@/lib/queries";

const valuesLeft = ["Personnes", "Biens", "Événements", "Entreprises"];
const valuesRight = ["Discrétion", "Professionnalisme", "Réactivité", "Protection"];
const verbs = ["Protéger", "Anticiper", "Garantir"];

type Offer = { id: string; name: string; detail: string };

function OfferList({ items, empty }: { items: Offer[]; empty: string }) {
  if (items.length === 0) return <p className="mt-4 text-sm text-muted">{empty}</p>;
  return (
    <ul className="mt-4 divide-y divide-accent/20">
      {items.map((item) => (
        <li key={item.id} className="py-2.5 text-sm">
          <p>{item.name}</p>
          {item.detail ? <p className="mt-1 text-muted">{item.detail}</p> : null}
        </li>
      ))}
    </ul>
  );
}

async function PublicCatalog() {
  const catalog = await listPublicCatalog();
  return (
    <section className="mt-14 grid gap-4 lg:grid-cols-2">
      <article className="ghost-panel rounded-3xl p-6">
        <h2 className="text-sm uppercase tracking-[0.22em] text-accent">Prestations</h2>
        <OfferList items={catalog.services} empty="Aucune prestation pour le moment." />
      </article>
      <div className="grid gap-4">
        <article className="ghost-panel rounded-3xl p-6">
          <h2 className="text-sm uppercase tracking-[0.22em] text-accent">Effectifs</h2>
          <OfferList items={catalog.staff} empty="Aucun effectif pour le moment." />
        </article>
        <article className="ghost-panel rounded-3xl p-6">
          <h2 className="text-sm uppercase tracking-[0.22em] text-accent">Matériel</h2>
          <OfferList items={catalog.equipment} empty="Aucun matériel pour le moment." />
        </article>
      </div>
    </section>
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
            <Image
              src="/logo_ghost.png"
              alt="Ghost — Special Operations"
              width={1254}
              height={1254}
              priority
              className="mx-auto mb-6 h-56 w-56 object-contain mix-blend-screen sm:h-72 sm:w-72"
            />
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

        <Suspense fallback={<p className="mt-14 text-sm text-muted">Chargement du catalogue…</p>}>
          <PublicCatalog />
        </Suspense>

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
