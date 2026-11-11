import { notFound } from "next/navigation";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { Crumbs, Spark, EventCard } from "@/components/ui";
import { companyById, events as mockEvents, govbodies as mockGov } from "@/data/mock";
import { api, apiEnabled } from "@/lib/api";

export default async function CompanyView({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id);
  const data = await api.company(id);
  if (!data && apiEnabled) notFound();        // live mode: unknown id is a 404, never a mock record

  const c = data?.company ?? companyById(id);
  if (!c) notFound();

  const evs = data ? data.timeline : mockEvents.filter((e) => e.companies.includes(c.id));
  const gov = data ? data.government : mockGov.filter((g) => g.affects.includes(c.id));
  const label = c.ticker ?? c.name;
  const rail = <ContextRail scopeLabel={label} suggestions={["Summarize today's catalysts", "What's driving the heat score?", "Show related government contracts"]} />;

  return (
    <ViewFrame rail={rail}>
      <div className="px-[26px] py-[18px]">
        <Crumbs items={[{ href: "/companies", label: "Companies" }, { label }]} />

        <div className="flex items-center justify-between bg-card border border-line rounded-[10px] px-5 py-[18px] mb-4">
          <div>
            <div className="text-[26px] font-extrabold">{label}</div>
            <div className="text-[11px] text-muted mt-0.5">{c.name} · {c.sector} · {c.watched ? "on watchlist" : "not watched"}</div>
            <Spark data={c.heatTrend} />
          </div>
          <div className="text-right">
            <div className="text-[30px] font-extrabold text-pos">{c.heat}</div>
            <div className="text-[9px] tracking-wide text-faint">HEAT · {c.heatTrend.length}D</div>
          </div>
        </div>

        <div className="text-[11px] tracking-[0.15em] text-sub uppercase mb-3">Intelligence Timeline</div>
        {evs.length ? evs.map((e) => <EventCard key={e.id} ev={e} />) : <Empty>No events for {label} yet.</Empty>}

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
