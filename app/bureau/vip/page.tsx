import { Suspense } from "react";
import { DiscussionDesk } from "@/components/discussion-desk";

async function DiscussionsVip({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return (
    <DiscussionDesk
      title="Discussions VIP"
      lede="Discussion directe de chaque client VIP avec les membres. Les contrats restent dans Discussions."
      basePath="/bureau/vip"
      scope="vip"
      selectedId={id}
    />
  );
}

export default function Page({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  return (
    <Suspense fallback={<p className="text-muted">Chargement des discussions VIP…</p>}>
      <DiscussionsVip searchParams={searchParams} />
    </Suspense>
  );
}
