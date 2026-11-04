import { Suspense } from "react";
import { CategoryBoard, type CatalogEntry } from "@/components/catalog-forms";
import { PageHeader } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { formatMoney } from "@/lib/format";
import { listEquipment, listServices, listStaff } from "@/lib/queries";

function toEntry(
  item: { id: string; name: string; priceCents: number; active: boolean },
  detail: string,
): CatalogEntry {
  return {
    id: item.id,
    name: item.name,
    detail,
    price: (item.priceCents / 100).toFixed(2),
    priceLabel: formatMoney(item.priceCents),
    active: item.active,
  };
}

async function Catalogue() {
  await requireStaff();
  const [services, staffItems, equipmentItems] = await Promise.all([
    listServices(),
    listStaff(),
    listEquipment(),
  ]);

  return (
    <div className="grid gap-14 min-[1280px]:mr-[min(0px,calc((72rem-100vw)/2+1.5rem))]">
      <PageHeader
        title="Catalogue"
        lede="Coûts de référence pour monter une mission. Les quantités ne sont pas suivies."
      />
      <CategoryBoard
        title="Prestations"
        kind="service"
        detailLabel="Description"
        entries={services.map((item) => toEntry({ ...item, priceCents: item.basePriceCents }, item.description))}
      />
      <CategoryBoard
        title="Agents"
        kind="staff"
        detailLabel="Note"
        entries={staffItems.map((item) => toEntry(item, item.notes))}
      />
      <CategoryBoard
        title="Matériel"
        kind="equipment"
        detailLabel="Note"
        entries={equipmentItems.map((item) => toEntry(item, item.notes))}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="text-muted">Chargement du catalogue…</p>}>
      <Catalogue />
    </Suspense>
  );
}
