"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  assignMember,
  finalizeContract,
  reviewReport,
  saveContractSheet,
  saveDossier,
  saveOperation,
  savePermissions,
  saveReport,
  saveUnit,
  saveVipFiche,
} from "@/app/actions/command";
import {
  dossierKinds,
  operationStatuses,
  permissionKeys,
  permissionLabel,
  reportStatuses,
  serviceFamilyLabel,
  staffFunctionLabel,
  staffFunctions,
  vipStates,
  vipTiers,
  type PermissionKey,
  type StaffFunction,
} from "@/lib/command";
import { type ActionState } from "@/lib/format";
import { buttonClass, buttonGhostClass, StatusBadge } from "./ui";

function Feedback({ state }: { state: ActionState }) {
  if (!state?.error && !state?.ok) return null;
  return <p className={state.error ? "text-sm text-danger" : "text-sm text-ok"}>{state.error ?? state.ok}</p>;
}

function useCloseOnOk(state: ActionState, onDone?: () => void) {
  useEffect(() => {
    if (state?.ok) onDone?.();
  }, [state, onDone]);
}

export function ContractSheet({
  requestId,
  reference,
  family,
  location,
  deadline,
  budgetNote,
  terms,
  ownerId,
  suspended,
  finalized,
  owners,
  editable,
}: {
  requestId: string;
  reference: string;
  family: string | null;
  location: string;
  deadline: string;
  budgetNote: string;
  terms: string;
  ownerId: string | null;
  suspended: boolean;
  finalized: boolean;
  owners: { id: string; name: string }[];
  editable: boolean;
}) {
  const [state, action, pending] = useActionState(saveContractSheet, null);
  return (
    <section className="grid gap-4 ghost-panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl">Fiche de négociation</h2>
        <span className="font-mono text-xs tracking-[0.14em] text-accent">{reference}</span>
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Service</dt>
          <dd>{serviceFamilyLabel(family)}</dd>
        </div>
        <div>
          <dt className="text-muted">Lieu</dt>
          <dd>{location || "Non renseigné"}</dd>
        </div>
        <div>
          <dt className="text-muted">Échéance</dt>
          <dd>{deadline || "Non renseignée"}</dd>
        </div>
        <div>
          <dt className="text-muted">Budget proposé</dt>
          <dd>{budgetNote || "À négocier"}</dd>
        </div>
      </dl>
      {terms ? <p className="whitespace-pre-wrap text-sm">{terms}</p> : <p className="text-sm text-muted">Conditions non transmises.</p>}
      {finalized ? <p className="text-sm text-ok">Contrat finalisé.</p> : null}
      {editable ? (
        <form action={action} className="grid gap-3 border-t border-[#3a2b34] pt-4">
          <input type="hidden" name="requestId" value={requestId} />
          <label className="grid gap-2 text-sm text-muted">
            Responsable
            <select name="ownerId" defaultValue={ownerId ?? ""}>
              <option value="">Non assigné</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-muted">
            Conditions du contrat
            <textarea name="terms" rows={4} maxLength={2000} defaultValue={terms} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="suspended" value="yes" defaultChecked={suspended} />
            Suspendre le contrat
          </label>
          <Feedback state={state} />
          <button className={buttonClass} disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer la fiche"}
          </button>
        </form>
      ) : null}
    </section>
  );
}

export function FinalizeContractButton({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState(finalizeContract, null);
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="requestId" value={requestId} />
      <button className={buttonClass} disabled={pending}>
        {pending ? "Finalisation…" : "Finaliser le contrat"}
      </button>
      <Feedback state={state} />
    </form>
  );
}

export function OperationBoard({
  rows,
  owners,
}: {
  rows: { id: string; reference: string; name: string; objective: string; status: string; ownerId: string; owner: string }[];
  owners: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(saveOperation, null);
  const [current, setCurrent] = useState<string>("");
  const selected = rows.find((row) => row.id === current);
  useCloseOnOk(state, () => setCurrent(""));
  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="overflow-x-auto ghost-panel">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="text-xs tracking-[0.14em] text-accent uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Opération</th>
              <th className="px-4 py-3 font-medium">Objectif</th>
              <th className="px-4 py-3 font-medium">Responsable</th>
              <th className="px-4 py-3 font-medium">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-muted">
                  Aucune opération.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-accent/20">
                  <td className="px-4 py-4">
                    <button type="button" className="text-left" onClick={() => setCurrent(row.id)}>
                      <span className="block font-medium">{row.name}</span>
                      <span className="font-mono text-xs text-muted">{row.reference}</span>
                    </button>
                  </td>
                  <td className="px-4 py-4 text-muted">{row.objective || "—"}</td>
                  <td className="px-4 py-4">{row.owner}</td>
                  <td className="px-4 py-4">
                    <StatusBadge label={operationStatuses.find((item) => item.id === row.status)?.label ?? row.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <form action={action} className="grid gap-3 ghost-panel p-5">
        <h2 className="font-serif text-2xl">{selected ? "Modifier l'opération" : "Nouvelle opération"}</h2>
        <input type="hidden" name="id" value={selected?.id ?? ""} />
        <label className="grid gap-2 text-sm text-muted">
          Nom
          <input name="name" required maxLength={120} defaultValue={selected?.name ?? ""} key={selected?.id ?? "new"} />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          Objectif
          <textarea name="objective" rows={4} maxLength={2000} defaultValue={selected?.objective ?? ""} key={`${selected?.id ?? "new"}-goal`} />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          Responsable
          <select name="ownerId" defaultValue={selected?.ownerId ?? ""} key={`${selected?.id ?? "new"}-owner`}>
            <option value="">Non assigné</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-muted">
          Statut
          <select name="status" defaultValue={selected?.status ?? "planned"} key={`${selected?.id ?? "new"}-status`}>
            {operationStatuses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <Feedback state={state} />
        <div className="flex flex-wrap gap-3">
          <button className={buttonClass} disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </button>
          {selected ? (
            <button type="button" className={buttonGhostClass} onClick={() => setCurrent("")}>
              Nouvelle
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}

export function UnitForm({ leaders }: { leaders: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState(saveUnit, null);
  return (
    <form action={action} className="grid gap-3 ghost-panel p-5">
      <h2 className="font-serif text-2xl">Nouvelle unité</h2>
      <label className="grid gap-2 text-sm text-muted">
        Nom
        <input name="name" required maxLength={80} />
      </label>
      <label className="grid gap-2 text-sm text-muted">
        Type
        <select name="kind" defaultValue="specialized">
          <option value="alpha">Alpha</option>
          <option value="specialized">Spécialisée</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm text-muted">
        Description
        <textarea name="description" rows={3} maxLength={500} />
      </label>
      <label className="grid gap-2 text-sm text-muted">
        Chef d'unité
        <select name="leaderId" defaultValue="">
          <option value="">Non désigné</option>
          {leaders.map((leader) => (
            <option key={leader.id} value={leader.id}>
              {leader.name}
            </option>
          ))}
        </select>
      </label>
      <Feedback state={state} />
      <button className={buttonClass} disabled={pending}>
        {pending ? "Enregistrement…" : "Créer l'unité"}
      </button>
    </form>
  );
}

export function AssignForm({
  members,
  units,
}: {
  members: { id: string; name: string; staffFunction: string; rpTitle: string; unitId: string }[];
  units: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(assignMember, null);
  const [id, setId] = useState(members[0]?.id ?? "");
  const member = members.find((item) => item.id === id);
  return (
    <form action={action} className="grid gap-3 ghost-panel p-5">
      <h2 className="font-serif text-2xl">Affectation</h2>
      <label className="grid gap-2 text-sm text-muted">
        Ghost
        <select name="id" value={id} onChange={(event) => setId(event.target.value)}>
          {members.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm text-muted">
        Fonction
        <select name="staffFunction" defaultValue={member?.staffFunction || "operations"} key={`${id}-fn`}>
          {staffFunctions.map((item) => (
            <option key={item} value={item}>
              {staffFunctionLabel[item]}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm text-muted">
        Fonction RP
        <input name="rpTitle" maxLength={80} defaultValue={member?.rpTitle ?? ""} key={`${id}-title`} placeholder="Tireur d'élite, infiltration…" />
      </label>
      <label className="grid gap-2 text-sm text-muted">
        Unité
        <select name="unitId" defaultValue={member?.unitId ?? ""} key={`${id}-unit`}>
          <option value="">Sans unité</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name}
            </option>
          ))}
        </select>
      </label>
      <Feedback state={state} />
      <button className={buttonClass} disabled={pending || members.length === 0}>
        {pending ? "Enregistrement…" : "Enregistrer l'affectation"}
      </button>
    </form>
  );
}

export type VipRow = {
  id: string;
  name: string;
  discord: string;
  tier: string;
  state: string;
  expires: string;
  benefits: string;
  notes: string;
  discount: string;
  role: "client" | "vip";
};

export function VipBoard({ rows, events }: { rows: VipRow[]; events: { id: string; text: string; when: string }[] }) {
  const [state, action, pending] = useActionState(saveVipFiche, null);
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState("");
  const [status, setStatus] = useState("");
  const [id, setId] = useState("");
  const visible = useMemo(
    () =>
      rows.filter((row) => {
        const haystack = `${row.name} ${row.discord}`.toLowerCase();
        if (query && !haystack.includes(query.toLowerCase())) return false;
        if (tier && row.tier !== tier) return false;
        if (status && row.state !== status) return false;
        if (tier || status) return row.role === "vip";
        return true;
      }),
    [rows, query, tier, status],
  );
  const selected = rows.find((row) => row.id === id);
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-3">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un client" className="min-w-56" />
        <select value={tier} onChange={(event) => setTier(event.target.value)}>
          <option value="">Tous les niveaux</option>
          {vipTiers.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Tous les statuts</option>
          {vipStates.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="overflow-x-auto ghost-panel">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="text-xs tracking-[0.14em] text-accent uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Niveau</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Fin de validité</th>
              </tr>
            </thead>
            <tbody>
              {visible.filter((row) => row.role === "vip").length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-muted">
                    Aucun client VIP.
                  </td>
                </tr>
              ) : (
                visible
                  .filter((row) => row.role === "vip")
                  .map((row) => (
                    <tr key={row.id} className="border-t border-accent/20">
                      <td className="px-4 py-4">
                        <button type="button" className="text-left" onClick={() => setId(row.id)}>
                          <span className="block font-medium">{row.name}</span>
                          <span className="text-muted">{row.discord}</span>
                        </button>
                      </td>
                      <td className="px-4 py-4">{vipTiers.find((item) => item.id === row.tier)?.label}</td>
                      <td className="px-4 py-4">{vipStates.find((item) => item.id === row.state)?.label}</td>
                      <td className="px-4 py-4">{row.expires || "—"}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
        <form action={action} className="grid gap-3 ghost-panel p-5">
          <h2 className="font-serif text-2xl">{selected?.role === "vip" ? "Fiche VIP" : "Nouvelle fiche VIP"}</h2>
          <label className="grid gap-2 text-sm text-muted">
            Client
            <select name="id" value={id} onChange={(event) => setId(event.target.value)}>
              <option value="">Choisir</option>
              {rows.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name} · {row.role === "vip" ? "VIP" : "Client"}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-muted">
            Niveau
            <select name="tier" defaultValue={selected?.tier || "argent"} key={`${id}-tier`}>
              {vipTiers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-muted">
            Statut
            <select name="state" defaultValue={selected?.state || "actif"} key={`${id}-state`}>
              {vipStates.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-muted">
            Échéance d'accès
            <input type="date" name="expires" defaultValue={selected?.expires ?? ""} key={`${id}-expires`} />
          </label>
          <label className="grid gap-2 text-sm text-muted">
            Réduction automatique (€)
            <input name="vipDiscount" inputMode="decimal" defaultValue={selected?.discount ?? ""} key={`${id}-discount`} placeholder="0" />
          </label>
          <label className="grid gap-2 text-sm text-muted">
            Avantages convenus
            <textarea name="benefits" rows={3} maxLength={2000} defaultValue={selected?.benefits ?? ""} key={`${id}-benefits`} />
          </label>
          <label className="grid gap-2 text-sm text-muted">
            Notes internes
            <textarea name="notes" rows={3} maxLength={2000} defaultValue={selected?.notes ?? ""} key={`${id}-notes`} />
          </label>
          <Feedback state={state} />
          <button className={buttonClass} disabled={pending || !id}>
            {pending ? "Enregistrement…" : "Enregistrer la fiche"}
          </button>
        </form>
      </div>
      <section className="grid gap-2">
        <h2 className="font-serif text-2xl">Historique VIP</h2>
        {events.length === 0 ? <p className="text-sm text-muted">Aucune fiche enregistrée.</p> : null}
        {events.map((event) => (
          <p key={event.id} className="text-sm text-muted">
            <span className="text-foreground">{event.when}</span> · {event.text}
          </p>
        ))}
      </section>
    </div>
  );
}

export type ReportRow = {
  id: string;
  reference: string;
  title: string;
  author: string;
  authorId: string;
  status: string;
  summary: string;
  outcome: string;
  nextSteps: string;
  review: string;
  when: string;
  mission: string;
};

export function ReportBoard({
  rows,
  contracts,
  canReview,
}: {
  rows: ReportRow[];
  contracts: { id: string; label: string }[];
  canReview: boolean;
}) {
  const [writeState, write, writePending] = useActionState(saveReport, null);
  const [reviewState, review, reviewPending] = useActionState(reviewReport, null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [id, setId] = useState("");
  const visible = rows.filter((row) => {
    const haystack = `${row.reference} ${row.title} ${row.author} ${row.mission}`.toLowerCase();
    if (query && !haystack.includes(query.toLowerCase())) return false;
    if (status && row.status !== status) return false;
    return true;
  });
  const selected = visible.find((row) => row.id === id) ?? rows.find((row) => row.id === id);
  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap gap-3">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un rapport" className="min-w-56" />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Tous les statuts</option>
          {reportStatuses.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="overflow-x-auto ghost-panel">
          <table className="w-full min-w-[42rem] text-left text-sm">
            <thead className="text-xs tracking-[0.14em] text-accent uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Rapport</th>
                <th className="px-4 py-3 font-medium">Rédacteur</th>
                <th className="px-4 py-3 font-medium">Statut</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-muted">
                    Aucun rapport.
                  </td>
                </tr>
              ) : (
                visible.map((row) => (
                  <tr key={row.id} className="border-t border-accent/20">
                    <td className="px-4 py-4">
                      <button type="button" className="text-left" onClick={() => setId(row.id)}>
                        <span className="block font-medium">{row.title}</span>
                        <span className="font-mono text-xs text-muted">{row.reference}</span>
                      </button>
                    </td>
                    <td className="px-4 py-4">{row.author}</td>
                    <td className="px-4 py-4">{reportStatuses.find((item) => item.id === row.status)?.label}</td>
                    <td className="px-4 py-4 text-muted">{row.when}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <section className="grid gap-3 ghost-panel p-5">
          <h2 className="font-serif text-2xl">Consulter</h2>
          {selected ? (
            <div className="grid gap-2 text-sm">
              <p className="font-mono text-xs text-accent">{selected.reference}</p>
              <p>{selected.title}</p>
              <p className="whitespace-pre-wrap">{selected.summary}</p>
              {selected.outcome ? <p className="whitespace-pre-wrap text-muted">{selected.outcome}</p> : null}
              {selected.nextSteps ? <p className="whitespace-pre-wrap text-muted">{selected.nextSteps}</p> : null}
              {selected.review ? <p className="whitespace-pre-wrap">Observation : {selected.review}</p> : null}
              {canReview ? (
                <form action={review} className="grid gap-3 border-t border-[#3a2b34] pt-3">
                  <input type="hidden" name="id" value={selected.id} />
                  <label className="grid gap-2 text-muted">
                    Traitement
                    <select name="status" defaultValue={selected.status} key={`${selected.id}-review`}>
                      {reportStatuses.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-muted">
                    Observations
                    <textarea name="review" rows={3} maxLength={2000} defaultValue={selected.review} key={`${selected.id}-note`} />
                  </label>
                  <Feedback state={reviewState} />
                  <button className={buttonClass} disabled={reviewPending}>
                    {reviewPending ? "Enregistrement…" : "Enregistrer le traitement"}
                  </button>
                </form>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted">Sélectionnez un rapport.</p>
          )}
        </section>
      </div>
      <form action={write} className="grid gap-3 ghost-panel p-5">
        <h2 className="font-serif text-2xl">Nouveau rapport de mission</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm text-muted">
            Contrat lié
            <select name="requestId" defaultValue="">
              <option value="">Aucun</option>
              {contracts.map((contract) => (
                <option key={contract.id} value={contract.id}>
                  {contract.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="grid gap-2 text-sm text-muted">
          Titre
          <input name="title" required maxLength={140} />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          Résumé des faits
          <textarea name="summary" required rows={4} maxLength={4000} />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          Résultat
          <textarea name="outcome" rows={3} maxLength={4000} />
        </label>
        <label className="grid gap-2 text-sm text-muted">
          Suites à donner
          <textarea name="nextSteps" rows={3} maxLength={4000} />
        </label>
        <Feedback state={writeState} />
        <button className={buttonClass} disabled={writePending}>
          {writePending ? "Envoi…" : "Transmettre au commandement"}
        </button>
      </form>
    </div>
  );
}

export function DossierForm({ canClassify }: { canClassify: boolean }) {
  const [state, action, pending] = useActionState(saveDossier, null);
  return (
    <form action={action} className="grid gap-3 ghost-panel p-5">
      <h2 className="font-serif text-2xl">Nouveau dossier</h2>
      <label className="grid gap-2 text-sm text-muted">
        Catégorie
        <select name="kind" defaultValue="intel">
          {dossierKinds
            .filter((item) => item.id !== "classified" || canClassify)
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm text-muted">
        Titre
        <input name="title" required maxLength={140} />
      </label>
      <label className="grid gap-2 text-sm text-muted">
        Contenu
        <textarea name="body" required rows={5} maxLength={4000} />
      </label>
      <Feedback state={state} />
      <button className={buttonClass} disabled={pending}>
        {pending ? "Enregistrement…" : "Archiver"}
      </button>
    </form>
  );
}

export function PermissionForm({
  matrix,
}: {
  matrix: Record<StaffFunction, Record<PermissionKey, boolean>>;
}) {
  const [state, action, pending] = useActionState(savePermissions, null);
  return (
    <form action={action} className="grid gap-4">
      {staffFunctions.map((staffFunction) => (
        <fieldset key={staffFunction} className="grid gap-3 ghost-panel p-5">
          <legend className="font-serif text-xl">{staffFunctionLabel[staffFunction]}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {permissionKeys
              .filter((key) => key !== "staff" && key !== "classified" && key !== "operations")
              .map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name={`${staffFunction}:${key}`} defaultChecked={matrix[staffFunction]?.[key]} />
                {permissionLabel[key]}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <Feedback state={state} />
      <button className={buttonClass} disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer les droits"}
      </button>
    </form>
  );
}
