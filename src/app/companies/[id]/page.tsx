import { notFound } from "next/navigation";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { Crumbs, Spark, EventCard } from "@/components/ui";
import { companies, companyById, events, govbodies } from "@/data/mock";

export function generateStaticParams() {
  return companies.map((c) => ({ id: c.id }));
}

export default function CompanyView({ params }: { params: { id: string } }) {
  const c = companyById(params.id);
  if (!c) notFound();

  const evs = events.filter((e) => e.companies.includes(c.id));
  const gov = govbodies.filter((g) => g.affects.includes(c.id));
  const rail = <ContextRail scopeLabel={c.ticker ?? c.name} suggestions={["Summarize today's catalysts", "What's driving the heat score?", "Show related government contracts"]} />;

  return (
    <ViewFrame rail={rail}>
      <div className="px-[26px] py-[18px]">
        <Crumbs items={[{ href: "/companies", label: "Companies" }, { label: c.ticker ?? c.name }]} />

        <div className="flex items-center justify-between bg-card border border-line rounded-[10px] px-5 py-[18px] mb-4">
          <div>
            <div className="text-[26px] font-extrabold">{c.ticker ?? c.name}</div>
            <div className="text-[11px] text-muted mt-0.5">{c.name} · {c.sector} · {c.watched ? "on watchlist" : "not watched"}</div>
            <Spark data={c.heatTrend} />
          </div>
          <div className="text-right">
            <div className="text-[30px] font-extrabold text-pos">{c.heat}</div>
            <div className="text-[9px] tracking-wide text-faint">HEAT · 12D</div>
          </div>
        </div>

        <div className="text-[11px] tracking-[0.15em] text-sub uppercase mb-3">Intelligence Timeline</div>
        {evs.length ? evs.map((e) => <EventCard key={e.id} ev={e} />) : <Empty>No events for {c.ticker} today.</Empty>}

        {gov.length > 0 && (
          <>
            <div className="text-[11px] tracking-[0.15em] text-sub uppercase mt-6 mb-3 border-t border-line pt-[18px]">Government Activity</div>
            {gov.map((g) => (
              <div key={g.id} className="bg-card border border-line rounded-[9px] px-4 py-3 mb-2.5">
                <div className="text-[10px] tracking-wide text-muted uppercase">{g.agency} · {g.kind} · {g.ref}</div>
                <div className="font-sans text-[14px] font-semibold mt-1">{g.title}</div>
                <div className="text-[11px] text-sub mt-1">{g.status}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </ViewFrame>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-muted text-[12.5px] py-10 text-center">{children}</div>;
}
