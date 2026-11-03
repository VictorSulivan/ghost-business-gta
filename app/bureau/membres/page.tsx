import { Suspense } from "react";
import { MemberBoard } from "@/components/member-board";
import { PageHeader } from "@/components/ui";
import { requireGradeManager } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { listMembers } from "@/lib/queries";
import type { Role } from "@/lib/session";

async function Membres() {
  const actor = await requireGradeManager();
  const accounts = await listMembers();

  return (
    <div className="grid gap-14 min-[1280px]:mr-[min(0px,calc((72rem-100vw)/2+1.5rem))]">
      <PageHeader
        title="Membres"
        lede="Le commandement promeut un client en membre, puis un membre au commandement. L'administrateur garde les accès et ne peut pas être modifié."
      />
      <MemberBoard
        actor={actor.role === "admin" ? "admin" : "officer"}
        accounts={accounts.flatMap((account) => {
          if (account.role === "admin") return [];
          const role: Exclude<Role, "admin"> =
            account.role === "officer" || account.role === "member" ? account.role : "client";
          return [
            {
              id: account.id,
              name: account.profile?.characterName ?? (account.discordUsername || "Compte"),
              contact: account.discordUsername || account.email || "Discord",
              since: formatDate(account.createdAt),
              role,
              active: account.active,
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
