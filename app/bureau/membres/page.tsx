import { Suspense } from "react";
import { MemberBoard } from "@/components/member-board";
import { PageHeader } from "@/components/ui";
import { requireGradeManager } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { listMembers } from "@/lib/queries";

async function Membres() {
  const actor = await requireGradeManager();
  const accounts = await listMembers();

  return (
    <div className="grid gap-14 min-[1280px]:mr-[min(0px,calc((72rem-100vw)/2+1.5rem))]">
      <PageHeader
        title="Membres"
        lede="Grades, fiche VIP et accès. Le niveau, la réduction et les avantages d'un client VIP se règlent ici. L'administrateur ne peut pas être modifié."
      />
      <MemberBoard
        actor={actor.role === "admin" ? "admin" : "officer"}
        accounts={accounts.flatMap((account) => {
          if (account.role === "admin") return [];
          return [
            {
              id: account.id,
              name: account.profile?.characterName ?? (account.discordUsername || "Compte"),
              contact: account.discordUsername || account.email || "Discord",
              since: formatDate(account.createdAt),
              lastSeen: account.lastSeenAt ? formatDate(account.lastSeenAt) : "—",
              role: account.role,
              active: account.active,
              discountCents: account.vipDiscountCents,
              tier: account.vipTier,
              vipState: account.vipState,
              expires: account.vipExpiresOn ?? "",
              benefits: account.vipBenefits,
              notes: account.vipNotes,
            },
          ];
        })}
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
