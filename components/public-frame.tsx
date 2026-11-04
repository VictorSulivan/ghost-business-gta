import Link from "next/link";
import { PublicNav } from "@/components/public-nav";
import { buttonClass } from "@/components/ui";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#502631] bg-[#090910f5] shadow-[0_10px_40px_#0008] backdrop-blur">
      <div className="ghost-wrap relative flex h-[75px] items-center justify-between">
        <Link href="/" className="flex items-center gap-4 font-serif text-2xl tracking-[0.3em] text-foreground">
          <img
            src="/brand/ghost_logo.webp"
            alt=""
            className="h-11 w-11 object-cover drop-shadow-[0_0_8px_#e52d4160]"
          />
          GHOST
        </Link>
        <PublicNav />
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-[#351a25]">
      <div className="ghost-wrap flex flex-wrap items-center justify-between gap-4 py-6 font-mono text-[11px] tracking-[0.12em] text-[#858591] uppercase">
        <span>Ghost // Réseau sécurisé</span>
        <span>
          <span className="text-accent">●</span> Statut : opérationnel
        </span>
        <span>Division 01</span>
      </div>
    </footer>
  );
}

export function PublicMark({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="font-serif text-[clamp(1.75rem,3vw,2.4rem)] font-medium">
      <span className="mr-4 font-mono text-2xl tracking-normal text-accent">///</span>
      {children}
    </h1>
  );
}

export function ContractCall({
  title,
  text,
  href,
  label,
}: {
  title: string;
  text: string;
  href: string;
  label: string;
}) {
  return (
    <section className="relative mt-12 overflow-hidden border-y border-[#60313b] bg-[#15131b]">
      <img
        src="/brand/footer_reaper.webp"
        alt=""
        className="pointer-events-none absolute top-0 right-0 h-full w-full object-cover opacity-20 [mask-image:linear-gradient(to_left,black,transparent)] sm:w-[30%] sm:opacity-65"
      />
      <div className="ghost-wrap relative flex min-h-48 flex-col items-start justify-center gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-[clamp(1.75rem,3vw,2.4rem)] font-medium">
            <span className="mr-4 font-mono text-2xl tracking-normal text-accent">///</span>
            {title}
          </h2>
          <p className="mt-2 max-w-xl font-serif text-base text-[#c8c5cb]">{text}</p>
        </div>
        <Link href={href} className={`${buttonClass} shrink-0`}>
          {label} <span className="text-accent">›</span>
        </Link>
      </div>
    </section>
  );
}

export function PublicPanel({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PublicHeader />
      <main className="ghost-wrap grid flex-1 items-start gap-10 py-16 md:grid-cols-[1fr_420px]">
        <div>
          <p className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">Division 01</p>
          <h1 className="mt-3 font-serif text-5xl tracking-[0.08em] uppercase">{title}</h1>
          <p className="mt-4 max-w-md text-muted">{lede}</p>
        </div>
        <div className="ghost-panel p-6">{children}</div>
      </main>
      <PublicFooter />
    </div>
  );
}
