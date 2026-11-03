import Link from "next/link";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/connexion", label: "Connexion" },
];

export function PublicHeader() {
  return (
    <header className="border-b border-accent/30 bg-black/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-5">
        <Link href="/" className="font-serif text-xl tracking-[0.28em] text-foreground">
          GHOST
        </Link>
        <nav className="flex gap-5 text-xs uppercase tracking-[0.18em] text-muted">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
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
    </div>
  );
}
