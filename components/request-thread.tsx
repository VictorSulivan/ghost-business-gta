import { ContractSheet, FinalizeContractButton } from "@/components/command-forms";
import { QuoteComposer, QuoteFigures } from "@/components/quote-composer";
import { AcceptQuoteButton, PrepareQuoteButton, RefuseQuoteButton } from "@/components/quote-forms";
import {
  CancelRequestButton,
  MarkDoneButton,
  MessageForm,
  RefuseRequestButton,
} from "@/components/request-forms";
import { contractLabel, vipDiscountActive } from "@/lib/command";
import { roleLabel } from "@/lib/session";
import { formatDate, isClosedRequest, quoteStatusLabel } from "@/lib/format";
import type { getRequestDetail } from "@/lib/queries";
import { StatusBadge } from "./ui";

type RequestDetail = NonNullable<Awaited<ReturnType<typeof getRequestDetail>>>;
type ViewerRole = "client" | "member";

function quoteFigures(quote: RequestDetail["quotes"][number]) {
  const sum = (kind: string) =>
    quote.lines.filter((line) => line.kind === kind).reduce((total, line) => total + line.quantity * line.unitPriceCents, 0);
  const serviceCents = sum("service") + sum("custom");
  const staffCents = sum("staff");
  const equipmentCents = sum("equipment");
  const lineSum = serviceCents + staffCents + equipmentCents;
  const totalCents = quote.totalCents || lineSum;
  const vipDiscountCents = quote.vipDiscountCents;
  return {
    serviceCents,
    staffCents,
    equipmentCents,
    surchargeCents: totalCents - lineSum + vipDiscountCents,
    vipDiscountCents,
    totalCents,
  };
}

export function RequestThread({
  request,
  role,
  viewerId,
  services = [],
  staffItems = [],
  equipmentItems = [],
  owners = [],
  embedded = false,
}: {
  request: RequestDetail;
  role: ViewerRole;
  viewerId: string;
  services?: { id: string; name: string; priceCents: number }[];
  staffItems?: { id: string; name: string; priceCents: number }[];
  equipmentItems?: { id: string; name: string; priceCents: number }[];
  owners?: { id: string; name: string }[];
  embedded?: boolean;
}) {
  const quotes = role === "client" ? request.quotes.filter((quote) => quote.status !== "draft") : request.quotes;
  const closed = isClosedRequest(request.status);
  const profile = request.client.profile;

  const messages = (
    <ol className={`grid content-start gap-3 ${embedded ? "min-h-0 flex-1 overflow-y-auto pr-1" : ""}`}>
      {request.messages.map((message) => {
        const mine = message.authorId === viewerId;
        const staff =
          message.author.role === "member" || message.author.role === "officer" || message.author.role === "admin";
        const name = message.author.profile?.characterName ?? roleLabel(message.author.role);
        return (
          <li
            key={message.id}
            className={`max-w-[85%] border px-4 py-3 ${mine ? "ml-auto border-[#70313d] bg-accent/10" : "border-accent/30 bg-black/40"}`}
          >
            <p className="text-sm text-accent">
              {staff ? "Ghost" : "Client"}
              <span className="text-muted"> · {name}</span>
            </p>
            <p className="mt-2 whitespace-pre-wrap">{message.body}</p>
            <p className="mt-2 text-xs text-muted">{formatDate(message.createdAt)}</p>
          </li>
        );
      })}
    </ol>
  );

  if (embedded) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col gap-4">
        <header className="shrink-0">
          {request.channel ? (
            <p className="text-xs uppercase tracking-[0.18em] text-accent">Canal permanent</p>
          ) : null}
          <h1 className="mt-2 font-serif text-3xl">{request.channel ? request.title : request.reference}</h1>
          <p className="mt-2 text-sm text-muted">
            {request.channel ? "Discussion avec les membres." : `${request.title} · ${profile?.characterName ?? "Client"}`}
          </p>
        </header>
        {messages}
        {closed ? null : (
          <div className="shrink-0">
            <MessageForm requestId={request.id} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-accent">
            {request.channel ? "Canal permanent" : request.reference}
          </p>
          <h1 className="mt-2 font-serif text-4xl">{request.title}</h1>
          <p className="mt-2 text-sm text-muted">
            {request.channel
              ? "Discussion avec les membres."
              : `Ouverte le ${formatDate(request.createdAt)}`}
          </p>
        </div>
        <StatusBadge label={request.channel ? "Canal VIP" : contractLabel(request)} />
      </header>

      {request.channel ? null : (
        <ContractSheet
          requestId={request.id}
          reference={request.reference}
          family={request.serviceFamily}
          location={request.location}
          deadline={request.deadline}
          budgetNote={request.budgetNote}
          terms={request.terms}
          ownerId={request.ownerId}
          suspended={request.suspended}
          finalized={Boolean(request.finalizedAt)}
          owners={owners ?? []}
          editable={role === "member" && !closed}
        />
      )}

      {role === "member" && profile ? (
        <section className="ghost-panel p-5">
          <h2 className="font-serif text-2xl">Fiche du client</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Personnage</dt>
              <dd>{profile.characterName}</dd>
            </div>
            <div>
              <dt className="text-muted">Téléphone RP</dt>
              <dd>{profile.phone || "Non renseigné"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted">Description</dt>
              <dd className="whitespace-pre-wrap">{profile.description || "Non renseignée"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted">Notes</dt>
              <dd className="whitespace-pre-wrap">{profile.notes || "Aucune"}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <section className="grid gap-3">
        <h2 className="font-serif text-2xl">Discussion</h2>
        {messages}
        {closed ? null : <MessageForm requestId={request.id} />}
      </section>

      <section className="grid gap-4">
        <h2 className="font-serif text-2xl">Devis</h2>
        {quotes.length === 0 ? <p className="text-muted">Aucun devis pour le moment.</p> : null}
        {quotes.map((quote) => {
          return (
            <article key={quote.id} className="grid gap-4 ghost-panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted">
                  {quote.author.profile?.characterName ?? "Membre"} · {formatDate(quote.createdAt)}
                </p>
                <StatusBadge label={quoteStatusLabel[quote.status]} />
              </div>
              {role === "member" && quote.status === "draft" ? (
                <QuoteComposer
                  key={`${quote.id}-${quote.lines.map((line) => `${line.id}:${line.quantity}`).join("|")}-${quote.adjustmentBps}-${quote.note}`}
                  quoteId={quote.id}
                  note={quote.note}
                  services={services}
                  staffItems={staffItems}
                  equipmentItems={equipmentItems}
                  lines={quote.lines}
                  adjustmentReason={quote.adjustmentReason}
                  vipDiscountCents={
                    vipDiscountActive(request.client.role, request.client.vipState) ? request.client.vipDiscountCents : 0
                  }
                />
              ) : (
                <>
                  <QuoteFigures {...quoteFigures(quote)} />
                  {quote.adjustmentReason ? <p className="text-sm text-muted">{quote.adjustmentReason}</p> : null}
                  {quote.note ? <p className="whitespace-pre-wrap text-sm text-muted">{quote.note}</p> : null}
                </>
              )}
              {role === "client" && quote.status === "sent" ? (
                <div className="flex flex-wrap gap-3">
                  <AcceptQuoteButton quoteId={quote.id} />
                  <RefuseQuoteButton quoteId={quote.id} />
                </div>
              ) : null}
            </article>
          );
        })}
        {role === "member" && !closed && !request.suspended && request.status !== "accepted" ? (
          <PrepareQuoteButton requestId={request.id} />
        ) : null}
      </section>

      {request.channel ? null : (
        <section className="flex flex-wrap gap-3">
          {role === "client" && (request.status === "open" || request.status === "quoted") ? (
            <CancelRequestButton requestId={request.id} />
          ) : null}
          {role === "member" && (request.status === "open" || request.status === "quoted") ? (
            <RefuseRequestButton requestId={request.id} />
          ) : null}
          {role === "client" && request.status === "accepted" ? <MarkDoneButton requestId={request.id} /> : null}
          {role === "member" && request.status === "accepted" ? <FinalizeContractButton requestId={request.id} /> : null}
        </section>
      )}
    </div>
  );
}
