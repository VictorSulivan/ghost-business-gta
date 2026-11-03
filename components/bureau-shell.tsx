import { requireStaff } from "@/lib/auth";
import { canManageGrades } from "@/lib/session";
import { AppShell } from "./app-shell";

export async function BureauShell({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  const links = [
    { href: "/bureau", label: "Discussions" },
    { href: "/bureau/catalogue", label: "Catalogue" },
    ...(canManageGrades(user.role) ? [{ href: "/bureau/membres", label: "Membres" }] : []),
  ];
  return (
    <AppShell links={links} characterName={user.profile?.characterName ?? "Membre"}>
      {children}
    </AppShell>
  );
}
