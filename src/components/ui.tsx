"use client";
import Link from "next/link";
import type { IntelEvent } from "@/lib/types";
import { cn } from "@/lib/cn";

export function Crumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-[7px] text-[12px] text-muted mb-3 break-all">
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-[7px]">
            {it.href && !last ? (
              <Link href={it.href} className="hover:text-ink">{it.label}</Link>
            ) : (
              <span className={last ? "text-sub" : ""}>{it.label}</span>
            )}
            {!last && <span className="text-faint">/</span>}
          </span>
        );
      })}
    </div>
  );
}

export function PageHead({ title, stamp }: { title: string; stamp?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <h1 className="text-[18px] font-bold">{title}</h1>
      {stamp && <div className="text-[12px] text-sub tracking-wide">{stamp}</div>}
    </div>
  );
}

export function TickerTag({ id, label }: { id: string; label: string }) {
  return (
    <Link
      href={`/companies/${id}`}
      onClick={(e) => e.stopPropagation()}
      className="text-[12px] font-bold px-[7px] py-0.5 rounded border border-pos/40 bg-pos/[0.06] text-pos hover:bg-pos/15"
    >
      {label}
    </Link>
  );
}
export function ThemeTag({ id, label }: { id: string; label: string }) {
  return (
    <Link
      href={`/themes/${id}`}
      onClick={(e) => e.stopPropagation()}
      className="text-[12px] font-bold px-[7px] py-0.5 rounded border border-theme/40 bg-theme/[0.06] text-theme hover:bg-theme/15"
    >
      {label}
    </Link>
  );
}

export function Spark({ data }: { data: number[] }) {
  return (
    <div className="flex items-end gap-[3px] h-9 mt-2">
      {data.map((v, i) => (
        <span key={i} className="flex-1 bg-mint/70 rounded-[1px]" style={{ height: `${Math.max(v, 4)}%`, minHeight: 2 }} />
      ))}
    </div>
  );
}

// Importance is not gain or loss, so it never uses the loss colour.
const scoreColor = (p: IntelEvent["priority"]) =>
  p === "high" ? "text-amber" : p === "med" ? "text-ink" : "text-muted";

// The whole card is clickable, but it is not itself a link: the title link is
// stretched over the card with ::after, and the tag links sit above it. The
// previous version wrapped the card in a link with tag links inside it, which
// is invalid HTML (a link inside a link) and made React throw a hydration
// error and re-render the page on every load.
export function EventCard({ ev }: { ev: IntelEvent }) {
  return (
    <div className="relative bg-card border border-line rounded-[9px] px-4 py-[15px] mb-3 hover:border-[#333] transition-colors">
      <div className="text-[12px] tracking-wide text-muted uppercase">
        <span className="text-sub">{ev.sourceLabel}</span> · {ev.docType}
      </div>
      <Link
        href={`/event/${ev.id}`}
        className="block font-sans text-[15px] font-semibold my-[7px] leading-snug max-w-[82%] md:max-w-[88%] after:absolute after:inset-0 after:content-['']"
      >
        {ev.title}
      </Link>
      <div className="font-sans text-[12.5px] text-sub leading-relaxed md:max-w-[92%]">{ev.summary}</div>

      <div className="absolute top-[14px] right-4 text-right pointer-events-none">
        <div className={cn("text-[19px] font-extrabold leading-none tabular-nums", scoreColor(ev.priority))} title="Importance, 0 to 100">{ev.importance}</div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="relative z-10 flex gap-1.5 flex-wrap">
          {ev.entities.filter(e => e.kind === "company").map(e => <TickerTag key={e.id} id={e.id} label={e.label} />)}
          {ev.themes.map(t => <ThemeTag key={t} id={t} label={t.toUpperCase()} />)}
        </div>
        <div className="text-[12px] text-muted whitespace-nowrap">{ev.time} · confidence {ev.confidence}</div>
      </div>
    </div>
  );
}
