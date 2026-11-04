import { DiscussionList } from "@/components/discussion-list";
import { RequestThread } from "@/components/request-thread";
import { PageHeader } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { accountName, contractLabel } from "@/lib/command";
import { getRequestDetail, listDiscussions } from "@/lib/queries";

export async function DiscussionDesk({
  title,
  lede,
  basePath,
  scope,
  selectedId,
}: {
  title: string;
  lede: string;
  basePath: "/bureau/discussions" | "/bureau/vip";
  scope: "contract" | "vip";
  selectedId?: string;
}) {
  const user = await requireStaff();
  const vip = scope === "vip";
  const rows = (await listDiscussions()).filter((item) => (vip ? item.channel : !item.channel));
  const current = rows.find((item) => item.id === selectedId) ?? rows[0];
  const request = current ? await getRequestDetail(current.id) : null;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-5">
      <div className="shrink-0 [&_header]:mb-0">
        <PageHeader title={title} lede={lede} />
      </div>
      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,14rem)_minmax(0,1fr)] gap-4 lg:grid-cols-[22rem_minmax(0,1fr)] lg:grid-rows-1">
        <DiscussionList
          heading={vip ? "Clients VIP" : "Contrats"}
          placeholder={vip ? "Rechercher un client VIP…" : "Rechercher un contrat…"}
          empty={vip ? "Aucun client VIP." : "Aucun contrat."}
          items={rows.map((item) => ({
            id: item.id,
            href: `${basePath}?id=${item.id}`,
            name: vip ? accountName(item.client) : item.reference,
            meta: vip ? "Discussion avec les membres" : `${item.title} · ${accountName(item.client)}`,
            preview: item.messages[0]?.body ?? "",
            status: vip ? "Discussion" : contractLabel(item),
            active: item.id === current?.id,
          }))}
        />
        <div className="flex h-full min-h-0 min-w-0 flex-col">
          {request ? (
            <RequestThread request={request} role="member" viewerId={user.id} embedded />
          ) : (
            <p className="ghost-panel px-5 py-8 text-muted">
              {vip ? "Sélectionnez un client VIP pour afficher la discussion." : "Sélectionnez un contrat pour afficher la conversation."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
