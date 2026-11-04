import Link from "next/link";
import { Suspense } from "react";
import { NewRequestForm } from "@/components/request-forms";
import { PageHeader, StatusBadge } from "@/components/ui";
import { requireClient } from "@/lib/auth";
import { findVipChannel } from "@/lib/channels";
import { formatDate, requestStatusLabel } from "@/lib/format";
import { listClientRequests } from "@/lib/queries";

async function Demandes() {
  const user = await requireClient();
  const [items, channel] = await Promise.all([
    listClientRequests(user.id, "active"),
    user.role === "vip" ? findVipChannel(user.id) : Promise.resolve(null),
  ]);
  const missions = items.filter((item) => !item.channel);

  return (
    <div className="grid gap-8">
      <PageHeader
        title={user.role === "vip" ? "Canal VIP" : "Demandes"}
        lede={
          user.role === "vip"
            ? "Votre canal avec les membres reste ouvert. Inutile de rouvrir une demande après une clôture."
            : "Ouvrez un dossier pour exposer un service de roleplay. La discussion continue dans le fil."
        }
      />
      {channel && channel.status === "open" ? (
        <Link href={`/espace/demandes/${channel.id}`} className="ghost-panel px-5 py-5 hover:border-accent">
          <span className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Canal permanent</span>
          <span className="mt-2 block font-medium">{channel.title}</span>
          <span className="mt-1 block text-sm text-muted">Écrire aux membres, sans clôturer la conversation.</span>
        </Link>
      ) : null}
      <NewRequestForm />
      <section className="grid gap-3">
        <h2 className="font-serif text-2xl">En cours</h2>
        {missions.length === 0 ? <p className="text-muted">Aucune demande en cours.</p> : null}
        {missions.map((item) => (
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
