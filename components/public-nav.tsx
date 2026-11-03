"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/organisation", label: "Organisation" },
  { href: "/services", label: "Services" },
  { href: "/connexion", label: "Connexion" },
];

export function PublicNav() {
  const pathname = usePathname();

  return (
    <nav className="grid grid-cols-2 justify-items-start gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.14em] text-muted sm:flex sm:flex-wrap sm:justify-end sm:gap-x-5 sm:text-xs sm:tracking-[0.18em]">
      {links.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "border-b border-accent pb-0.5 text-foreground" : "hover:text-foreground"}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
