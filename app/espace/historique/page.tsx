import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, StatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate, requestStatusLabel } from "@/lib/format";
import { listClientRequests } from "@/lib/queries";

async function Historique() {
  const user = await requireUser("client");
  const items = await listClientRequests(user.id, "past");

  return (
    <div>
      <PageHeader title="Historique" lede="Les demandes terminées, refusées ou annulées." />
      {items.length === 0 ? <p className="text-muted">Les demandes closes apparaîtront ici.</p> : null}
      <div className="grid gap-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/espace/demandes/${item.id}`}
            className="flex flex-wrap items-center justify-between gap-3 ghost-panel px-5 py-4 hover:border-accent"
          >
            <span>
              <span className="block font-medium">{item.title}</span>
              <span className="text-sm text-muted">{formatDate(item.updatedAt)}</span>
            </span>
            <StatusBadge label={requestStatusLabel[item.status]} />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="text-muted">Chargement de l&apos;historique…</p>}>
      <Historique />
    </Suspense>
  );
}
