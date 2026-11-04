import Link from "next/link";
import { Suspense } from "react";
import { NewRequestForm } from "@/components/request-forms";
import { PageHeader, StatusBadge } from "@/components/ui";
import { requireClient } from "@/lib/auth";
import { ensureVipChannel, findVipChannel } from "@/lib/channels";
import { contractLabel } from "@/lib/command";
import { formatDate } from "@/lib/format";
import { listClientRequests } from "@/lib/queries";

async function Demandes() {
  const user = await requireClient();
  if (user.role === "vip" && user.vipState !== "suspendu") await ensureVipChannel(user.id);
  const [active, past, channel] = await Promise.all([
    listClientRequests(user.id, "active"),
    listClientRequests(user.id, "past"),
    user.role === "vip" ? findVipChannel(user.id) : Promise.resolve(null),
  ]);
  const missions = [...active, ...past].filter((item) => !item.channel);
  const inTalk = missions.filter((item) => item.status === "quoted").length;
  const agreements = missions.filter((item) => item.status === "accepted" || item.status === "done").length;
  const openMissions = active.filter((item) => !item.channel);

  return (
    <div className="grid gap-8">
      <PageHeader
        title={user.role === "vip" ? "Espace VIP" : "Portail client"}
        lede={
          user.role === "vip"
            ? "Votre discussion avec les membres reste ouverte. Une mission précise passe par une demande à part."
            : "Une demande, un dossier, un contact. Décrivez la mission, échangez, puis acceptez la proposition."
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Mes demandes", missions.length],
          ["En discussion", inTalk],
          ["Accords", agreements],
        ].map(([label, value]) => (
          <article key={String(label)} className="ghost-panel px-5 py-4">
            <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">{label}</p>
            <p className="mt-2 font-serif text-4xl">{value}</p>
          </article>
        ))}
      </div>
      <ol className="grid gap-2 text-sm text-muted sm:grid-cols-4">
        <li>01 — Dépôt du dossier</li>
        <li>02 — Prise de contact</li>
        <li>03 — Proposition</li>
        <li>04 — Validation</li>
      </ol>
      {channel && channel.status === "open" ? (
        <Link href={`/espace/demandes/${channel.id}`} className="ghost-panel px-5 py-5 hover:border-accent">
          <span className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">Canal permanent</span>
          <span className="mt-2 block font-medium">{channel.title}</span>
          <span className="mt-1 block text-sm text-muted">Discussion privilégiée avec les membres. Elle ne se ferme pas.</span>
        </Link>
      ) : null}
      <NewRequestForm />
      <section className="grid gap-3">
        <h2 className="font-serif text-2xl">En cours</h2>
        {openMissions.length === 0 ? <p className="text-muted">Aucune demande en cours.</p> : null}
        {openMissions.map((item) => (
          <Link
            key={item.id}
            href={`/espace/demandes/${item.id}`}
            className="flex flex-wrap items-center justify-between gap-3 ghost-panel px-5 py-4 hover:border-accent"
          >
            <span>
              <span className="block font-medium">{item.title}</span>
              <span className="text-sm text-muted">{formatDate(item.updatedAt)}</span>
            </span>
            <StatusBadge label={contractLabel(item)} />
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
