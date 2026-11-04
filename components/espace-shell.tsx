import { requireClient } from "@/lib/auth";
import { ensureVipChannel, findVipChannel } from "@/lib/channels";
import { AppShell } from "./app-shell";

export async function EspaceShell({ children }: { children: React.ReactNode }) {
  const user = await requireClient();
  if (user.role === "vip" && user.vipState !== "suspendu") await ensureVipChannel(user.id);
  const channel = user.role === "vip" ? await findVipChannel(user.id) : null;
  const links = [
    ...(channel && channel.status === "open"
      ? [{ href: `/espace/demandes/${channel.id}`, label: "Discussion VIP" }]
      : []),
    { href: "/espace", label: "Demandes" },
    { href: "/espace/historique", label: "Historique" },
    { href: "/espace/profil", label: "Profil" },
  ];
  return (
    <AppShell
      links={links}
      characterName={user.profile?.characterName ?? "Client"}
      mark={user.role === "vip" ? "Canal VIP" : "Client access portal"}
    >
      {children}
    </AppShell>
  );
}
