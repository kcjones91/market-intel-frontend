import Link from "next/link";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { PageHead, Crumbs } from "@/components/ui";
import { companies, events } from "@/data/mock";

export default function Watchlist() {
  const watched = companies.filter((c) => c.watched).sort((a, b) => b.heat - a.heat);
  const rail = <ContextRail scopeLabel="Watchlist" suggestions={["Which names have rising heat?", "Top catalysts across watchlist today", "Compare IONQ vs RGTI activity"]} />;

  return (
    <ViewFrame rail={rail}>
      <div className="px-[26px] py-[18px]">
        <Crumbs items={[{ label: "Watchlist" }]} />
        <PageHead title="Watchlist" stamp="6 NAMES · BY HEAT" />
        <div className="h-4" />
        {watched.map((c) => {
          const recent = events.filter((e) => e.companies.includes(c.id)).slice(0, 3);
          return (
            <Link key={c.id} href={`/companies/${c.id}`} className="block bg-card border border-line rounded-[9px] px-4 py-3.5 mb-2.5 hover:border-[#333]">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-[15px] font-bold text-pos">{c.ticker}</span>
                  <span className="text-[11px] text-muted">{c.name} · {c.sector}</span>
                </div>
                <div className="text-[16px] font-extrabold" style={{ color: c.heat >= 80 ? "#22c55e" : c.heat >= 60 ? "#f59e0b" : "#8a8a8a" }}>{c.heat}</div>
              </div>
              <div className="h-[5px] bg-line rounded overflow-hidden mb-2"><div className="h-full bg-mint/80" style={{ width: `${c.heat}%` }} /></div>
              <div className="text-[11px] text-muted">
                {c.eventsToday ? `${c.eventsToday} events today` : "no events today"}
                {recent.length ? " · " + recent.map((e) => e.title.split(" ").slice(0, 5).join(" ")).join(" · ") : ""}
              </div>
            </Link>
          );
        })}
      </div>
    </ViewFrame>
  );
}
