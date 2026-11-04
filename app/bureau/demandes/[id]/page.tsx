import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RequestThread } from "@/components/request-thread";
import { requireStaff } from "@/lib/auth";
import { accountName } from "@/lib/command";
import { getRequestDetail, listEquipment, listServices, listStaff, listStaffAccounts } from "@/lib/queries";

async function Demande({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireStaff();
  const [request, services, staffItems, equipmentItems, accounts] = await Promise.all([
    getRequestDetail(id),
    listServices(),
    listStaff(),
    listEquipment(),
    listStaffAccounts(),
  ]);
  if (!request) notFound();

  return (
    <RequestThread
      request={request}
      role="member"
      viewerId={user.id}
      services={services.filter((service) => service.active).map((service) => ({
        id: service.id,
        name: service.name,
        priceCents: service.basePriceCents,
      }))}
      staffItems={staffItems.filter((item) => item.active).map((item) => ({
        id: item.id,
        name: item.name,
        priceCents: item.priceCents,
      }))}
      equipmentItems={equipmentItems.filter((item) => item.active).map((item) => ({
        id: item.id,
        name: item.name,
        priceCents: item.priceCents,
      }))}
      owners={accounts
        .filter((account) => account.role !== "admin")
        .map((account) => ({ id: account.id, name: accountName(account) }))}
    />
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-muted">Chargement de la demande…</p>}>
      <Demande params={params} />
    </Suspense>
  );
}
