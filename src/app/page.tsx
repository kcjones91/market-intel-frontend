import Link from "next/link";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { PageHead, EventCard } from "@/components/ui";
import { events as mockEvents, quotes as mockQuotes } from "@/data/mock";
import { api, type Quote } from "@/lib/api";
import type { IntelEvent } from "@/lib/types";

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

        {high.length > 0 && <><Prio dot="#f59e0b" label="High Priority" />{high.map((e) => <EventCard key={e.id} ev={e} />)}</>}
        {med.length > 0 && <><Prio dot="#a3a3a3" label="Medium Priority" />{med.map((e) => <EventCard key={e.id} ev={e} />)}</>}
        {low.length > 0 && <><Prio dot="#6e6e6e" label="Low Priority" />{low.map((e) => <EventCard key={e.id} ev={e} />)}</>}

        {!empty && (
          <p className="font-sans text-[12px] text-muted leading-relaxed mt-4 max-w-[640px]">
            The number on each card is its importance from 0 to 100: how much the event matters to the tracked themes.
            Confidence is how sure the scoring model is. Scores are produced by an automated model.
          </p>
        )}
      </div>
    </ViewFrame>
  );
}

function Prio({ dot, label }: { dot: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[12px] tracking-[0.15em] text-sub uppercase mt-[18px] mb-3">
      <span className="w-[7px] h-[7px] rounded-full" style={{ background: dot }} />
      {label}
    </div>
  );
}
