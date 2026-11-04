"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/actions/auth";
import { buttonGhostClass } from "./ui";

export function AppShell({
  children,
  links,
  characterName,
  mark,
}: {
  children: React.ReactNode;
  links: { href: string; label: string }[];
  characterName: string;
  mark: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const initial = characterName.trim().charAt(0).toUpperCase() || "G";
  const inbox = pathname.startsWith("/bureau/discussions") || pathname.startsWith("/bureau/vip");

  return (
    <div className="min-h-full bg-[#07090e] md:grid md:grid-cols-[246px_minmax(0,1fr)]">
      <aside
        className={`${open ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 flex w-[246px] flex-col gap-6 overflow-auto border-r border-[#4b2732] bg-[#0b0c13f2] px-3.5 py-6 transition md:sticky md:top-0 md:h-screen md:translate-x-0`}
      >
        <Link href="/" className="flex items-center gap-3 border-b border-[#39303e] px-2.5 pb-4" onClick={() => setOpen(false)}>
          <img src="/brand/ghost_logo.webp" alt="" className="h-12 w-12 object-cover drop-shadow-[0_0_14px_#f03b5955]" />
          <span>
            <span className="block font-serif text-2xl tracking-[0.2em]">GHOST</span>
            <span className="font-mono text-[10px] tracking-[0.17em] text-muted uppercase">{mark}</span>
          </span>
        </Link>
        <nav className="grid gap-1.5" aria-label="Navigation">
          {links.map((link) => {
            const active = link.href === "/bureau" || link.href === "/espace" ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`border px-3 py-3 text-sm ${active ? "border-[#70313d] bg-linear-to-r from-[#4b132299] to-transparent text-white shadow-[inset_3px_0_0_var(--accent)]" : "border-transparent text-[#bdbcc8] hover:border-[#70313d] hover:bg-linear-to-r hover:from-[#4b132266] hover:to-transparent hover:text-white"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-[#39303e] px-2.5 pt-5 font-mono text-[11px] tracking-[0.08em] text-[#bdb9c2] uppercase">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-ok shadow-[0_0_8px_var(--ok)]" />
          Réseau opérationnel
        </div>
      </aside>
      {open ? <button type="button" aria-label="Fermer le menu" className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setOpen(false)} /> : null}
      <div className={inbox ? "flex h-dvh min-w-0 flex-col overflow-hidden" : "min-w-0"}>
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#39303e] px-5 py-4 md:px-10">
          <button type="button" className="border border-[#854154] bg-[#221421] px-3 py-2 md:hidden" aria-label="Ouvrir le menu" onClick={() => setOpen(true)}>
            ☰
          </button>
          <p className="font-mono text-[11px] tracking-[0.2em] text-muted uppercase">{mark}</p>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 border border-[#3e3440] bg-[#15131d] px-2.5 py-1.5">
              <span className="grid h-8 w-8 place-items-center border border-[#ba3c51] bg-[#491c2b] text-sm font-bold">{initial}</span>
              <span className="text-xs font-semibold">{characterName}</span>
            </div>
            <form action={logout}>
              <button className={buttonGhostClass}>Déconnexion</button>
            </form>
          </div>
        </header>
        <div className={inbox ? "flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-6 md:px-10" : "px-5 py-8 md:px-10"}>{children}</div>
      </div>
    </div>
  );
}
