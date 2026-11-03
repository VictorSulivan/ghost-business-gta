import { Suspense } from "react";
import { BureauShell } from "@/components/bureau-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-8 text-muted">Chargement…</p>}>
      <BureauShell>{children}</BureauShell>
    </Suspense>
  );
}
