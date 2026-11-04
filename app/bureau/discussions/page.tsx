import { Suspense } from "react";
import { DiscussionDesk } from "@/components/discussion-desk";

async function Discussions({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return (
    <DiscussionDesk
      title="Discussions"
      lede="Conversations liées aux contrats ouverts. Un client habituel n’échange qu’à l’intérieur de ses contrats."
      basePath="/bureau/discussions"
      scope="contract"
      selectedId={id}
    />
  );
}

export default function Page({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  return (
    <Suspense fallback={<p className="text-muted">Chargement des discussions…</p>}>
      <Discussions searchParams={searchParams} />
    </Suspense>
  );
}
