import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageHeader, StatusBadge } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { accountName, contractLabel, hasPermission, serviceFamilyLabel } from "@/lib/command";
import { listAllRequests } from "@/lib/queries";

async function Contrats() {
  const user = await requireStaff();
  if (!hasPermission(user, "contracts") && !hasPermission(user, "communications")) redirect("/bureau");
  const items = (await listAllRequests()).filter((item) => !item.channel);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Contrats"
        lede="Demandes et négociations. La discussion privilégiée des clients VIP est à part."
      />
      <div className="overflow-x-auto ghost-panel">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead className="text-xs tracking-[0.14em] text-accent uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Référence</th>
              <th className="px-4 py-3 font-medium">Contrat</th>
              <th className="px-4 py-3 font-medium">Service</th>
              <th className="px-4 py-3 font-medium">Responsable</th>
              <th className="px-4 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-muted">
                  Aucun contrat.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t border-accent/20">
                  <td className="px-4 py-4 font-mono text-xs">{item.reference}</td>
                  <td className="px-4 py-4">
                    <Link href={`/bureau/demandes/${item.id}`} className="font-medium hover:text-accent">
                      {item.title}
                    </Link>
                    <span className="mt-1 block text-muted">{accountName(item.client)}</span>
                  </td>
                  <td className="px-4 py-4">{serviceFamilyLabel(item.serviceFamily)}</td>
                  <td className="px-4 py-4">{item.owner ? accountName(item.owner) : "—"}</td>
                  <td className="px-4 py-4">
                    <StatusBadge label={contractLabel(item)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="text-muted">Chargement des contrats…</p>}>
      <Contrats />
    </Suspense>
  );
}
