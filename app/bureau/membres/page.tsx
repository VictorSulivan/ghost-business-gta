import { Suspense } from "react";
import { MemberBoard } from "@/components/member-board";
import { PageHeader } from "@/components/ui";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { listMembers } from "@/lib/queries";

async function Membres() {
  await requireAdmin();
  const accounts = await listMembers();

  return (
    <div className="grid gap-14 min-[1280px]:mr-[min(0px,calc((72rem-100vw)/2+1.5rem))]">
      <PageHeader
        title="Membres"
        lede="Les comptes arrivent par Discord. Ouvrez ou fermez leur accès, et choisissez l'espace client ou le bureau."
      />
      <MemberBoard
        accounts={accounts.map((account) => ({
          id: account.id,
          name: account.profile?.characterName ?? (account.discordUsername || "Compte"),
          contact: account.discordUsername || account.email || "Discord",
          since: formatDate(account.createdAt),
          role: account.role === "member" ? "member" : "client",
          active: account.active,
        }))}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="text-muted">Chargement des membres…</p>}>
      <Membres />
    </Suspense>
  );
}
