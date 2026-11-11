import Link from "next/link";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { PageHead, EventCard } from "@/components/ui";
import { events as mockEvents, quotes as mockQuotes } from "@/data/mock";
import { api } from "@/lib/api";
import type { IntelEvent } from "@/lib/types";

// Server component: tries the API, falls back to bundled mock data.
export default async function Dashboard() {
  const data = await api.today();

  let high: IntelEvent[], med: IntelEvent[], low: IntelEvent[];
  let quotes = mockQuotes;
  let ingest = "Ingested 14 events across 6 sources overnight · scored & enriched by local LLM · 3 high-priority";
  let stamp = "MON 15 JUN 2026 · 06:30 CT";

  if (data) {
    high = data.high; med = data.med; low = data.low;
    quotes = data.quotes?.length ? data.quotes : mockQuotes;
    ingest = data.ingestSummary ?? ingest;
    stamp = data.stamp ?? stamp;
  } else {
    high = mockEvents.filter((e) => e.priority === "high");
    med = mockEvents.filter((e) => e.priority === "med");
    low = mockEvents.filter((e) => e.priority === "low");
  }

  const rail = <ContextRail scopeLabel="Dashboard" />;

  return (
    <ViewFrame rail={rail}>
      <div className="px-[26px] py-[18px]">
        <PageHead title="Today's Intelligence" stamp={stamp} />
        <div className="text-[12px] text-sub mt-1.5">{ingest}</div>

        {quotes.length > 0 && (
          <div className="flex bg-card border border-line rounded-lg my-5 overflow-hidden">
            {quotes.map((q: any) => (
              <Link key={q.sym} href={`/companies/${q.sym.toLowerCase()}`} className="flex-1 px-3.5 py-[9px] border-r border-line last:border-0 hover:bg-cardhi">
                <span className="text-[12px] font-bold">{q.sym}</span>
                <span className="text-[11px] ml-1.5" style={{ color: q.d > 0 ? "#22c55e" : "#ff5000" }}>{q.px} {q.chg}</span>
              </Link>
            ))}
          </div>
        )}

        <Prio dot="#ff5000" label="High Priority" />
        {high.map((e) => <EventCard key={e.id} ev={e} />)}
        <Prio dot="#f59e0b" label="Medium Priority" />
        {med.map((e) => <EventCard key={e.id} ev={e} />)}
        {low.length > 0 && <><Prio dot="#5f5f5f" label="Low Priority" />{low.map((e) => <EventCard key={e.id} ev={e} />)}</>}
      </div>
    </ViewFrame>
  );
}

function Prio({ dot, label }: { dot: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] tracking-[0.15em] text-sub uppercase mt-[18px] mb-3">
      <span className="w-[7px] h-[7px] rounded-full" style={{ background: dot }} />
      {label}
    </div>
  );
}
