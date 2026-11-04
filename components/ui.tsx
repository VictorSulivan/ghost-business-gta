export const buttonClass =
  "inline-flex items-center justify-center gap-3 border border-accent bg-linear-to-br from-[#74182f] to-[#270e19] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_15px_#e6395033] transition hover:-translate-y-0.5 hover:brightness-125 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60";

export const buttonGhostClass =
  "inline-flex items-center justify-center gap-3 border border-[#9c9ca9] bg-[#111219d9] px-5 py-3 text-sm text-white transition hover:-translate-y-0.5 hover:shadow-[0_0_20px_#ec2e4655] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60";

export const buttonDangerClass =
  "inline-flex items-center justify-center gap-3 border border-danger/70 bg-[#1a0c12] px-5 py-3 text-sm text-danger transition hover:border-danger disabled:cursor-not-allowed disabled:opacity-60";

export function PageHeader({ title, lede }: { title: string; lede?: string }) {
  return (
    <header className="mb-8">
      <h1 className="font-serif text-4xl tracking-[0.08em] uppercase">
        <span className="mr-3 font-mono text-2xl tracking-normal text-accent">///</span>
        {title}
      </h1>
      {lede ? <p className="mt-3 max-w-2xl text-muted">{lede}</p> : null}
    </header>
  );
}

export function StatusBadge({ label }: { label: string }) {
  return (
    <span className="border border-[#945063] bg-[#1b111b] px-2 py-1 font-mono text-[10px] tracking-[0.08em] text-[#ffd4dc] uppercase">
      {label}
    </span>
  );
}
