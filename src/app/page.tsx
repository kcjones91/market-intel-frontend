import Link from "next/link";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { PageHead, EventCard } from "@/components/ui";
import { events as mockEvents, quotes as mockQuotes } from "@/data/mock";
import { api, type Quote } from "@/lib/api";
import type { IntelEvent } from "@/lib/types";
import { Help } from "@/components/Help";
import { OpenOnHash } from "@/components/OpenOnHash";

// Server component: live data when an API is configured, bundled mock data otherwise.
export default async function Dashboard() {
  const data = await api.today();

  let high: IntelEvent[], med: IntelEvent[], low: IntelEvent[];
  let quotes: Quote[];
  let ingest: string;
  let stamp: string;

  if (data) {
    high = data.high; med = data.med; low = data.low;
    // Live mode never borrows mock quotes: sample prices must not appear as real ones.
    quotes = data.quotes ?? [];
    ingest = data.ingestSummary ?? "";
    stamp = data.stamp ?? "";
  } else {
    high = mockEvents.filter((e) => e.priority === "high");
    med = mockEvents.filter((e) => e.priority === "med");
    low = mockEvents.filter((e) => e.priority === "low");
    quotes = mockQuotes;
    ingest = "Ingested 14 events across 6 sources overnight · scored & enriched by local LLM · 3 high-priority";
    stamp = "MON 15 JUN 2026 · 06:30 CT";
  }

  const rail = <ContextRail />;
  const empty = high.length + med.length + low.length === 0;

  return (
    <ViewFrame rail={rail}>
      <div className="px-4 md:px-[26px] py-[18px]">
        <PageHead title="Today's Intelligence" stamp={stamp} />
        {ingest && <div className="text-[12px] text-sub mt-1.5">{ingest}</div>}

        {/* At a glance: how many events at each priority, each count jumps to its section. */}
        {!empty && (
          <nav aria-label="Today at a glance" className="grid grid-cols-3 gap-2 mt-4">
            <Count href="#high" n={high.length} label="High" tone="text-amber" />
            <Count href="#med" n={med.length} label="Medium" tone="text-ink" />
            <Count href="#low" n={low.length} label="Low" tone="text-muted" />
          </nav>
        )}

        {quotes.length > 0 && (
          <div className="flex bg-card border border-line rounded-lg my-5 overflow-x-auto no-scrollbar">
            {quotes.map((q) => (
              <Link key={q.sym} href={`/companies/${q.sym.toLowerCase()}`} className="flex-1 shrink-0 whitespace-nowrap px-3.5 py-[9px] border-r border-line last:border-0 hover:bg-cardhi">
                <span className="text-[12px] font-bold">{q.sym}</span>
                <span className="text-[12px] ml-1.5" style={{ color: q.d > 0 ? "#22c55e" : "#ff5000" }}>{q.px} {q.chg}</span>
              </Link>
            ))}
          </div>
        )}

        {empty && <div className="text-muted text-[12.5px] py-10 text-center">No events ingested yet today.</div>}

        {/* How to read a card, before the cards rather than after the last one. */}
        {!empty && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 font-sans text-[12px] text-muted mt-4">
            <span>Each event is scored by an automated model.</span>
            <span className="text-sub whitespace-nowrap">Importance <Help term="importance" /></span>
            <span className="text-sub whitespace-nowrap">Confidence <Help term="confidence" /></span>
            <span className="text-sub whitespace-nowrap">Priority <Help term="priority" /></span>
          </div>
        )}

        {high.length > 0 && <><Prio id="high" dot="#f59e0b" label="High Priority" n={high.length} />{high.map((e) => <EventCard key={e.id} ev={e} />)}</>}
        {med.length > 0 && <><Prio id="med" dot="#a3a3a3" label="Medium Priority" n={med.length} />{med.map((e) => <EventCard key={e.id} ev={e} />)}</>}

        {/* Low priority is the long tail: folded away unless it is all there is. */}
        {low.length > 0 && <OpenOnHash id="low" />}
        {low.length > 0 && (
          <details id="low" className="fold scroll-mt-[104px] md:scroll-mt-4 mt-[18px]" open={high.length + med.length === 0}>
            <summary className="flex items-center gap-2 min-h-[44px] cursor-pointer text-[12px] tracking-[0.15em] text-sub uppercase rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint">
              <span className="w-[7px] h-[7px] rounded-full" style={{ background: "#6e6e6e" }} />
              Low Priority
              <span className="text-muted tabular-nums">{low.length}</span>
              <span className="fold-closed ml-auto text-muted normal-case tracking-normal">Show</span>
              <span className="fold-open ml-auto text-muted normal-case tracking-normal">Hide</span>
            </summary>
            <div className="mt-1">{low.map((e) => <EventCard key={e.id} ev={e} />)}</div>
          </details>
        )}
      </div>
    </ViewFrame>
  );
}

// The scroll margin clears the nav, which is pinned to the top on phones.
function Prio({ id, dot, label, n }: { id: string; dot: string; label: string; n: number }) {
  return (
    <h2 id={id} className="flex items-center gap-2 text-[12px] font-normal tracking-[0.15em] text-sub uppercase mt-[18px] mb-3 scroll-mt-[104px] md:scroll-mt-4">
      <span className="w-[7px] h-[7px] rounded-full" style={{ background: dot }} />
      {label}
      <span className="text-muted tabular-nums">{n}</span>
    </h2>
  );
}

function Count({ href, n, label, tone }: { href: string; n: number; label: string; tone: string }) {
  const inner = (
    <>
      <span className={`text-[20px] font-extrabold leading-none tabular-nums ${n ? tone : "text-muted"}`}>{n}</span>
      <span className="text-[12px] tracking-[0.08em] text-muted uppercase mt-1.5">{label}</span>
    </>
  );
  const box = "flex flex-col items-start justify-center min-h-[56px] px-3.5 py-2 bg-card border border-line rounded-lg";
  // Nothing to jump to when the count is zero.
  return n ? <a href={href} className={`${box} hover:border-[#333] focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint`}>{inner}</a> : <div className={box}>{inner}</div>;
}
