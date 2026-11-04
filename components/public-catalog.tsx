import { connection } from "next/server";
import { listPublicCatalog } from "@/lib/queries";

type Offer = { id: string; name: string; detail: string };

function OfferList({ items, empty }: { items: Offer[]; empty: string }) {
  if (items.length === 0) return <p className="mt-4 text-sm text-muted">{empty}</p>;
  return (
    <ul className="mt-4 divide-y divide-accent/20">
      {items.map((item) => (
        <li key={item.id} className="py-2.5 text-sm">
          <p>{item.name}</p>
          {item.detail ? <p className="mt-1 text-muted">{item.detail}</p> : null}
        </li>
      ))}
    </ul>
  );
}

export async function PublicCatalog() {
  await connection();
  const catalog = await listPublicCatalog();
  return (
    <section className="mt-14 grid gap-4 lg:grid-cols-2">
      <article className="ghost-panel p-6">
        <h2 className="text-sm uppercase tracking-[0.22em] text-accent">Prestations</h2>
        <OfferList items={catalog.services} empty="Aucune prestation pour le moment." />
      </article>
      <div className="grid gap-4">
        <article className="ghost-panel p-6">
          <h2 className="text-sm uppercase tracking-[0.22em] text-accent">Effectifs</h2>
          <OfferList items={catalog.staff} empty="Aucun effectif pour le moment." />
        </article>
        <article className="ghost-panel p-6">
          <h2 className="text-sm uppercase tracking-[0.22em] text-accent">Matériel</h2>
          <OfferList items={catalog.equipment} empty="Aucun matériel pour le moment." />
        </article>
      </div>
    </section>
  );
}
