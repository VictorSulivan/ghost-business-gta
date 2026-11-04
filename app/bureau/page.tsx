import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, StatusBadge } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { accountName, contractLabel } from "@/lib/command";
import { listAllRequests, listStaffAccounts } from "@/lib/queries";

async function Overview() {
  await requireStaff();
  const [requests, staff] = await Promise.all([listAllRequests(), listStaffAccounts()]);
  const contracts = requests.filter((item) => !item.channel);
  const activeContracts = contracts.filter((item) => item.status === "open" || item.status === "quoted" || item.status === "accepted");

  return (
    <div className="grid gap-10">
      <PageHeader
        title="Centre de commandement"
        lede="Contrats et rapports de la division."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ["Contrats actifs", String(activeContracts.length).padStart(2, "0")],
          ["Ghost", String(staff.filter((item) => item.role !== "admin").length).padStart(2, "0")],
        ].map(([label, value]) => (
          <article key={label} className="ghost-panel px-5 py-4">
            <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">{label}</p>
            <p className="mt-2 font-serif text-4xl">{value}</p>
          </article>
        ))}
      </div>
      <section className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-2xl">Derniers contrats</h2>
          <Link href="/bureau/contrats" className="text-sm text-accent">
            Registre
          </Link>
        </div>
        {contracts.slice(0, 5).map((item) => (
          <Link key={item.id} href={`/bureau/demandes/${item.id}`} className="flex items-center justify-between gap-3 ghost-panel px-4 py-3">
            <span>
              <span className="block font-medium">{item.title}</span>
              <span className="text-sm text-muted">
                {item.reference} · {accountName(item.client)}
              </span>
            </span>
            <StatusBadge label={contractLabel(item)} />
          </Link>
        ))}
        {contracts.length === 0 ? <p className="text-sm text-muted">Aucun contrat.</p> : null}
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="text-muted">Chargement du centre…</p>}>
      <Overview />
    </Suspense>
  );
}
