import Link from "next/link";
import { Suspense } from "react";
import { NewRequestForm } from "@/components/request-forms";
import { PageHeader, StatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDate, requestStatusLabel } from "@/lib/format";
import { listClientRequests } from "@/lib/queries";

async function Demandes() {
  const user = await requireUser("client");
  const items = await listClientRequests(user.id, "active");

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Demandes"
        lede="Ouvrez un dossier pour exposer un service de roleplay. La discussion continue dans le fil."
      />
      <NewRequestForm />
      <section className="grid gap-3">
        <h2 className="font-serif text-2xl">En cours</h2>
        {items.length === 0 ? <p className="text-muted">Aucune demande en cours.</p> : null}
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/espace/demandes/${item.id}`}
            className="flex flex-wrap items-center justify-between gap-3 ghost-panel rounded-2xl px-5 py-4 hover:border-accent"
          >
            <span>
              <span className="block font-medium">{item.title}</span>
              <span className="text-sm text-muted">{formatDate(item.updatedAt)}</span>
            </span>
            <StatusBadge label={requestStatusLabel[item.status]} />
          </Link>
        ))}
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="text-muted">Chargement des demandes…</p>}>
      <Demandes />
    </Suspense>
  );
}
