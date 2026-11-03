import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { buttonGhostClass } from "./ui";

export function AppShell({
  children,
  links,
  characterName,
}: {
  children: React.ReactNode;
  links: { href: string; label: string }[];
  characterName: string;
}) {
  return (
    <div className="min-h-full">
      <header className="border-b border-accent/30 bg-black/50 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="font-serif text-xl tracking-[0.28em]">
            GHOST
          </Link>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted">{characterName}</p>
            <form action={logout}>
              <button className={buttonGhostClass}>Déconnexion</button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 md:grid-cols-[200px_1fr]">
        <nav className="flex flex-row flex-wrap gap-2 md:flex-col">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-transparent px-3 py-2 text-xs uppercase tracking-[0.16em] text-muted hover:border-accent/60 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
