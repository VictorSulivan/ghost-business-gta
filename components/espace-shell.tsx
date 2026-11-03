import { requireUser } from "@/lib/auth";
import { AppShell } from "./app-shell";

const links = [
  { href: "/espace", label: "Demandes" },
  { href: "/espace/historique", label: "Historique" },
  { href: "/espace/profil", label: "Profil" },
];

export async function EspaceShell({ children }: { children: React.ReactNode }) {
  const user = await requireUser("client");
  return (
    <AppShell links={links} characterName={user.profile?.characterName ?? "Client"}>
      {children}
    </AppShell>
  );
}
