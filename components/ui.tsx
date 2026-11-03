export const buttonClass =
  "inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-[#1a0b2e] shadow-[0_0_24px_rgba(168,85,247,0.35)] transition hover:bg-[#d8b4fe] disabled:cursor-not-allowed disabled:opacity-60";

export const buttonGhostClass =
  "inline-flex items-center justify-center rounded-full border border-line/80 bg-black/30 px-4 py-2 text-sm text-foreground transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60";

export const buttonDangerClass =
  "inline-flex items-center justify-center rounded-full border border-danger/40 px-4 py-2 text-sm text-danger transition hover:border-danger disabled:cursor-not-allowed disabled:opacity-60";

export function PageHeader({ title, lede }: { title: string; lede?: string }) {
  return (
    <header className="mb-8">
      <h1 className="font-serif text-4xl tracking-[0.08em] uppercase">{title}</h1>
      {lede ? <p className="mt-3 max-w-2xl text-muted">{lede}</p> : null}
    </header>
  );
}

export function StatusBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-accent/50 bg-accent/10 px-2.5 py-1 text-xs uppercase tracking-[0.16em] text-accent">
      {label}
    </span>
  );
}
