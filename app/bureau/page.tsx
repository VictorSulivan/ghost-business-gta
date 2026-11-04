import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, StatusBadge } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { formatDate, isClosedRequest, requestStatusLabel } from "@/lib/format";
import { listAllRequests } from "@/lib/queries";

async function Discussions() {
  await requireStaff();
  const items = await listAllRequests();

  return (
    <div>
      <PageHeader title="Discussions" lede="Toutes les demandes clients, les plus récentes en premier." />
      {items.length === 0 ? <p className="text-muted">Aucune demande pour le moment.</p> : null}
      <div className="grid gap-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/bureau/demandes/${item.id}`}
            className="flex flex-wrap items-center justify-between gap-3 ghost-panel px-5 py-4 hover:border-accent"
          >
            <span>
              <span className="block font-medium">{item.title}</span>
              <span className="text-sm text-muted">
                {item.client.profile?.characterName ?? "Client"} · {formatDate(item.updatedAt)}
              </span>
            </span>
            <StatusBadge label={item.channel && !isClosedRequest(item.status) ? "Canal VIP" : requestStatusLabel[item.status]} />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="text-muted">Chargement des discussions…</p>}>
      <Discussions />
    </Suspense>
  );
}
