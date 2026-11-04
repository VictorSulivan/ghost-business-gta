"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/organisation", label: "Organisation" },
  { href: "/services", label: "Services" },
  { href: "/connexion", label: "Connexion" },
];

export function PublicNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="border border-[#944053] bg-[#1c151b] px-3 py-2 text-white md:hidden"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "✕" : "☰"}
      </button>
      <nav
        className={`${open ? "flex" : "hidden"} absolute top-[75px] right-0 left-0 z-20 flex-col gap-2 border-b border-[#502631] bg-[#101117] px-6 py-5 md:static md:flex md:flex-row md:gap-9 md:border-0 md:bg-transparent md:p-0`}
      >
        {links.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`border-b-2 py-1.5 font-serif text-base ${active ? "border-accent text-foreground" : "border-transparent text-foreground/90 hover:border-accent"}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
