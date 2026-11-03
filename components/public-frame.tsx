import Link from "next/link";
import { PublicNav } from "@/components/public-nav";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-accent/30 bg-black/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
        <Link href="/" className="font-serif text-xl tracking-[0.28em] text-foreground">
          GHOST
        </Link>
        <PublicNav />
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-accent/20">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
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
    <h1 className="font-serif text-4xl tracking-[0.08em] uppercase sm:text-5xl">
      <span className="mr-3 font-mono text-2xl tracking-normal text-accent sm:text-3xl">///</span>
      {children}
    </h1>
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
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-start gap-10 px-5 py-16 md:grid-cols-[1fr_420px]">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-accent">Division 01</p>
          <h1 className="mt-3 font-serif text-5xl tracking-[0.08em] uppercase">{title}</h1>
          <p className="mt-4 max-w-md text-muted">{lede}</p>
        </div>
        <div className="ghost-panel rounded-3xl p-6">{children}</div>
      </main>
      <PublicFooter />
    </div>
  );
}
