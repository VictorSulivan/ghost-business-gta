import { QuoteComposer, QuoteFigures } from "@/components/quote-composer";
import { AcceptQuoteButton, PrepareQuoteButton, RefuseQuoteButton } from "@/components/quote-forms";
import {
  CancelRequestButton,
  MarkDoneButton,
  MessageForm,
  RefuseRequestButton,
} from "@/components/request-forms";
import { roleLabel } from "@/lib/session";
import { formatDate, isClosedRequest, quoteStatusLabel, requestStatusLabel } from "@/lib/format";
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
  return {
    serviceCents,
    staffCents,
    equipmentCents,
    surchargeCents: totalCents - lineSum,
    totalCents,
  };
}

export function RequestThread({
  request,
  role,
  viewerId,
  services,
  staffItems,
  equipmentItems,
}: {
  request: RequestDetail;
  role: ViewerRole;
  viewerId: string;
  services: { id: string; name: string; priceCents: number }[];
  staffItems: { id: string; name: string; priceCents: number }[];
  equipmentItems: { id: string; name: string; priceCents: number }[];
}) {
  const quotes = role === "client" ? request.quotes.filter((quote) => quote.status !== "draft") : request.quotes;
  const closed = isClosedRequest(request.status);
  const profile = request.client.profile;

  return (
    <div className="grid gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-accent">Demande</p>
          <h1 className="mt-2 font-serif text-4xl">{request.title}</h1>
          <p className="mt-2 text-sm text-muted">Ouverte le {formatDate(request.createdAt)}</p>
        </div>
        <StatusBadge label={requestStatusLabel[request.status]} />
      </header>

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
        <ol className="grid gap-3">
          {request.messages.map((message) => {
            const mine = message.authorId === viewerId;
            const name = message.author.profile?.characterName ?? roleLabel(message.author.role);
            return (
              <li
                key={message.id}
                className={`border border-accent/30 px-4 py-3 ${mine ? "bg-accent/10" : "bg-black/40"}`}
              >
                <p className="text-sm text-accent">
                  {name}
                  <span className="text-muted"> · {roleLabel(message.author.role).toLowerCase()}</span>
                </p>
                <p className="mt-2 whitespace-pre-wrap">{message.body}</p>
                <p className="mt-2 text-xs text-muted">{formatDate(message.createdAt)}</p>
              </li>
            );
          })}
        </ol>
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
        {role === "member" && !closed && request.status !== "accepted" ? (
          <PrepareQuoteButton requestId={request.id} />
        ) : null}
      </section>

      <section className="flex flex-wrap gap-3">
        {role === "client" && (request.status === "open" || request.status === "quoted") ? (
          <CancelRequestButton requestId={request.id} />
        ) : null}
        {role === "member" && (request.status === "open" || request.status === "quoted") ? (
          <RefuseRequestButton requestId={request.id} />
        ) : null}
        {request.status === "accepted" ? <MarkDoneButton requestId={request.id} /> : null}
      </section>
    </div>
  );
}
