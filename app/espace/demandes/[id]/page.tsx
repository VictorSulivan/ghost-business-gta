import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RequestThread } from "@/components/request-thread";
import { requireClient } from "@/lib/auth";
import { getRequestDetail } from "@/lib/queries";

async function Demande({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireClient();
  const request = await getRequestDetail(id);
  if (!request || request.clientId !== user.id) notFound();

  return (
    <RequestThread
      request={request}
      role="client"
      viewerId={user.id}
      services={[]}
      staffItems={[]}
      equipmentItems={[]}
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
