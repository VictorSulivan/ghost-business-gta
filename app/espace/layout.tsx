import { Suspense } from "react";
import { EspaceShell } from "@/components/espace-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="p-8 text-muted">Chargement…</p>}>
      <EspaceShell>{children}</EspaceShell>
    </Suspense>
  );
}
