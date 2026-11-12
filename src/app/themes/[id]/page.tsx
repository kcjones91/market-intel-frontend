import { notFound } from "next/navigation";
import Link from "next/link";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { Crumbs, Spark, EventCard } from "@/components/ui";
import { themeById, events as mockEvents, companies as mockCompanies, govbodies as mockGov } from "@/data/mock";
import { api, apiEnabled } from "@/lib/api";
import { heatVisible, byActivity, byHeat } from "@/lib/heat";
import { Help } from "@/components/Help";

export default async function ThemeView({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id);
  const data = await api.theme(id);
  if (!data && apiEnabled) notFound();        // live mode: unknown id is a 404, never a mock record

  const t = data?.theme ?? themeById(id);
  if (!t) notFound();

  const showHeat = heatVisible(Boolean(data));
  const evs = data ? data.events : mockEvents.filter((e) => e.themes.includes(t.id));
  const cos = [...(data ? data.companies : mockCompanies.filter((c) => c.themes.includes(t.id)))].sort(showHeat ? byHeat : byActivity);
  const gov = data ? data.government : mockGov.filter((g) => g.themes.includes(t.id));
  const rail = <ContextRail />;

  return (
    <ViewFrame rail={rail}>
      <div className="px-4 md:px-[26px] py-[18px]">
        <Crumbs items={[{ href: "/themes", label: "Themes" }, { label: t.name }]} />

        <div className="flex items-center justify-between gap-4 bg-card border border-line rounded-[10px] px-5 py-[18px] mb-4">
          <div>
            <div className="text-[26px] font-extrabold text-theme">{t.name}</div>
            <div className="text-[12px] text-muted mt-0.5">{t.eventsToday} event{t.eventsToday === 1 ? "" : "s"} today{showHeat ? ` · ${t.heat} / 100 heat` : ""}</div>
            {showHeat && t.heatTrend?.length > 1 && <><Spark data={t.heatTrend} /><div className="text-[12px] text-muted mt-1">Daily heat, last {t.heatTrend.length} days</div></>}
          </div>
          {showHeat && (
            <div className="text-right">
              <div className="text-[30px] font-extrabold text-theme">{t.heat}</div>
              <div className="text-[12px] tracking-wide text-muted whitespace-nowrap">HEAT · 7D <Help term="heat" /></div>
            </div>
          )}
        </div>

        <div className="text-[12px] tracking-[0.15em] text-sub uppercase mb-3">Companies in {t.name}</div>
        <div className="flex gap-1.5 flex-wrap mb-5">
          {cos.length ? cos.map((c) => (
            <Link key={c.id} href={`/companies/${c.id}`} className="text-[12px] font-bold px-2.5 py-1 rounded border border-pos/40 bg-pos/[0.06] text-pos hover:bg-pos/15">{c.ticker ?? c.name}{showHeat ? ` · ${c.heat}` : ""}</Link>
          )) : <span className="text-[12px] text-muted">No companies tagged yet.</span>}
        </div>

        {gov.length > 0 && (
          <>
            <div className="text-[12px] tracking-[0.15em] text-sub uppercase mb-3">Government Activity</div>
            <div className="flex gap-1.5 flex-wrap mb-5">
              {gov.map((g) => (
                <Link key={g.id} href={`/government/${encodeURIComponent(g.id)}`} className="text-[12px] font-bold px-2.5 py-1 rounded border border-info/40 bg-info/[0.06] text-info hover:bg-info/15">{g.ref}</Link>
              ))}
            </div>
          </>
        )}

        <div className="text-[12px] tracking-[0.15em] text-sub uppercase mb-3 border-t border-line pt-[18px]">Recent Events</div>
        {evs.length ? evs.map((e) => <EventCard key={e.id} ev={e} />) : <div className="text-muted text-[12.5px] py-10 text-center">No events tagged {t.name}.</div>}
      </div>
    </ViewFrame>
  );
}
