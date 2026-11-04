"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "./ui";

export type DiscussionItem = {
  id: string;
  href: string;
  name: string;
  meta: string;
  preview: string;
  status: string;
  active: boolean;
};

export function DiscussionList({
  items,
  heading,
  placeholder,
  empty,
}: {
  items: DiscussionItem[];
  heading: string;
  placeholder: string;
  empty: string;
}) {
  const [query, setQuery] = useState("");
  const visible = items.filter((item) => {
    const haystack = `${item.name} ${item.meta} ${item.preview}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <aside className="grid h-full min-h-0 grid-rows-[auto_auto_minmax(0,1fr)] content-start gap-3 overflow-hidden ghost-panel p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">{heading}</h2>
        <span className="font-mono text-xs text-muted">{String(visible.length).padStart(2, "0")}</span>
      </div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
      />
      {visible.length === 0 ? <p className="text-sm text-muted">{empty}</p> : null}
      <div className="grid min-h-0 content-start gap-2 overflow-hidden">
        {visible.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`grid gap-1 border px-3 py-3 ${item.active ? "border-[#70313d] bg-accent/10 shadow-[inset_3px_0_0_var(--accent)]" : "border-[#3a2b34] hover:border-accent"}`}
          >
            <span className="flex items-start justify-between gap-2">
              <span className="font-medium">{item.name}</span>
              <StatusBadge label={item.status} />
            </span>
            <span className="font-mono text-[10px] tracking-[0.08em] text-muted uppercase">{item.meta}</span>
            {item.preview ? <span className="line-clamp-2 text-sm text-muted">{item.preview}</span> : null}
          </Link>
        ))}
      </div>
    </aside>
  );
}
