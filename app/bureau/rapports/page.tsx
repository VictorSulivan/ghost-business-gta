import { Suspense } from "react";
import { ReportBoard } from "@/components/command-forms";
import { PageHeader } from "@/components/ui";
import { requireStaff } from "@/lib/auth";
import { accountName, canReviewReports } from "@/lib/command";
import { formatDate } from "@/lib/format";
import { listAllRequests, listReports } from "@/lib/queries";

async function Rapports() {
  const user = await requireStaff();
  const [reports, requests] = await Promise.all([listReports(), listAllRequests()]);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Rapports"
        lede="Chaque Ghost transmet le compte rendu d'une mission. Le commandement l'examine, le valide ou l'archive."
      />
      <ReportBoard
        canReview={canReviewReports(user)}
        contracts={requests
          .filter((item) => !item.channel)
          .map((item) => ({ id: item.id, label: `${item.reference} · ${item.title}` }))}
        rows={reports.map((report) => ({
          id: report.id,
          reference: report.reference,
          title: report.title,
          author: accountName(report.author),
          authorId: report.authorId,
          status: report.status,
          summary: report.summary,
          outcome: report.outcome,
          nextSteps: report.nextSteps,
          review: report.review,
          when: formatDate(report.createdAt),
          mission: report.requestId ?? "",
        }))}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="text-muted">Chargement des rapports…</p>}>
      <Rapports />
    </Suspense>
  );
}
