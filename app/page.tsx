import Link from "next/link";
import { PublicFooter, PublicHeader } from "@/components/public-frame";
import { buttonClass, buttonGhostClass } from "@/components/ui";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PublicHeader />
      <section className="hero-stage">
        <img className="hero-soldiers" src="/brand/hero_soldiers.webp" alt="" />
        <img className="hero-base" src="/brand/hero_base.webp" alt="" />
        <div className="hero-hud">
          GHOST // SECURE NET
          <br />
          <em className="text-accent not-italic">■</em> ACCÈS : AUTORISÉ
          <br />
          <em className="text-accent not-italic">■</em> RÉSEAU : CHIFFRÉ
          <br />
          <em className="text-accent not-italic">■</em> STATUT : OPÉRATIONNEL
        </div>
        <div className="hero-copy">
          <p className="font-mono text-[11px] tracking-[0.25em] text-[#bdb5bf]">● CANAL SÉCURISÉ</p>
          <h1 className="hero-title">GHOST</h1>
          <p className="mt-2 mb-4 font-sans text-[clamp(13px,1.55vw,19px)] font-bold tracking-[0.17em] text-white uppercase">
            Aucune trace. Aucune preuve. Aucune erreur.
          </p>
          <p className="mx-auto mb-7 max-w-xl text-base leading-relaxed text-[#ddd]">
            Une organisation d&apos;élite opérant dans l&apos;ombre, avec discipline, discrétion et efficacité.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/organisation" className={buttonClass}>
              Découvrir l&apos;organisation <span className="text-accent">›</span>
            </Link>
            <Link href="/services" className={buttonGhostClass}>
              Voir nos services <span className="text-accent">›</span>
            </Link>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
