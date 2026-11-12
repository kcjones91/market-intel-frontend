import Link from "next/link";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { PageHead, Crumbs } from "@/components/ui";
import { companies as mockCompanies, events as mockEvents } from "@/data/mock";
import { api, allEvents } from "@/lib/api";

export default async function Watchlist() {
  const [live, today] = await Promise.all([api.companies(), api.today()]);
  const companies = live ?? mockCompanies;
  const events = live ? allEvents(today) : mockEvents;

  const watched = companies.filter((c) => c.watched).sort((a, b) => b.heat - a.heat);
  const rail = <ContextRail />;

  return (
    <ViewFrame rail={rail}>
      <div className="px-4 md:px-[26px] py-[18px]">
        <Crumbs items={[{ label: "Watchlist" }]} />
        <PageHead title="Watchlist" stamp={`${watched.length} NAME${watched.length === 1 ? "" : "S"} · BY HEAT`} />
        <div className="h-4" />
        {watched.length === 0 && <div className="text-muted text-[12.5px] py-10 text-center">No companies on the watchlist.</div>}
        {watched.map((c) => {
          const recent = events.filter((e) => e.companies.includes(c.id)).slice(0, 3);
          return (
            <Link key={c.id} href={`/companies/${c.id}`} className="block bg-card border border-line rounded-[9px] px-4 py-3.5 mb-2.5 hover:border-[#333]">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-[15px] font-bold text-pos">{c.ticker ?? c.name}</span>
                  <span className="text-[12px] text-muted">{c.name} · {c.sector}</span>
                </div>
                <div className="text-[16px] font-extrabold" style={{ color: c.heat >= 80 ? "#22c55e" : c.heat >= 60 ? "#f59e0b" : "#a3a3a3" }}>{c.heat}</div>
              </div>
              <div className="h-[5px] bg-line rounded overflow-hidden mb-2"><div className="h-full bg-mint/80" style={{ width: `${c.heat}%` }} /></div>
              <div className="text-[12px] text-muted">
                {c.eventsToday ? `${c.eventsToday} event${c.eventsToday === 1 ? "" : "s"} today` : "no events today"}
                {recent.length ? " · " + recent.map((e) => e.title.split(" ").slice(0, 5).join(" ")).join(" · ") : ""}
              </div>
            </Link>
          );
        })}
      </div>
    </ViewFrame>
  );
}
