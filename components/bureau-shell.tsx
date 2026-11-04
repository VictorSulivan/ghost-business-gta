import { requireStaff } from "@/lib/auth";
import { hasPermission } from "@/lib/command";
import { canManageGrades } from "@/lib/session";
import { AppShell } from "./app-shell";

export async function BureauShell({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  const grade = canManageGrades(user.role) || hasPermission(user, "access");
  const links = [
    { href: "/bureau", label: "Vue générale" },
    { href: "/bureau/discussions", label: "Discussions" },
    { href: "/bureau/vip", label: "Discussions VIP" },
    ...(hasPermission(user, "contracts") || hasPermission(user, "communications")
      ? [{ href: "/bureau/contrats", label: "Contrats" }]
      : []),
    { href: "/bureau/rapports", label: "Rapports" },
    ...(hasPermission(user, "communications") || hasPermission(user, "contracts") || hasPermission(user, "panel")
      ? [{ href: "/bureau/catalogue", label: "Catalogue" }]
      : []),
    ...(grade ? [{ href: "/bureau/membres", label: "Membres" }] : []),
  ];
  return (
    <AppShell links={links} characterName={user.profile?.characterName ?? "Membre"} mark="Command network">
      {children}
    </AppShell>
  );
}
