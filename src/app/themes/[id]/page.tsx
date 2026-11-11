import { notFound } from "next/navigation";
import Link from "next/link";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { Crumbs, Spark, EventCard } from "@/components/ui";
import { themes, themeById, events, companies, govbodies } from "@/data/mock";

export function generateStaticParams() {
  return themes.map((t) => ({ id: t.id }));
}

export default function ThemeView({ params }: { params: { id: string } }) {
  const t = themeById(params.id);
  if (!t) notFound();

  const evs = events.filter((e) => e.themes.includes(t.id));
  const cos = companies.filter((c) => c.themes.includes(t.id)).sort((a, b) => b.heat - a.heat);
  const gov = govbodies.filter((g) => g.themes.includes(t.id));
  const rail = <ContextRail scopeLabel={t.name} suggestions={["Which tickers lead this theme?", "Heat trend over 30 days", "Upcoming policy catalysts"]} />;

  return (
    <ViewFrame rail={rail}>
      <div className="px-[26px] py-[18px]">
        <Crumbs items={[{ href: "/themes", label: "Themes" }, { label: t.name }]} />

        <div className="flex items-center justify-between bg-card border border-line rounded-[10px] px-5 py-[18px] mb-4">
          <div>
            <div className="text-[26px] font-extrabold text-theme">{t.name}</div>
            <div className="text-[11px] text-muted mt-0.5">{evs.length} events today · {t.heat} / 100 heat</div>
            <Spark data={t.heatTrend} />
          </div>
          <div className="text-right">
            <div className="text-[30px] font-extrabold text-theme">{t.heat}</div>
            <div className="text-[9px] tracking-wide text-faint">THEME HEAT · 7D</div>
          </div>
        </div>

        <div className="text-[11px] tracking-[0.15em] text-sub uppercase mb-3">Companies in {t.name}</div>
        <div className="flex gap-1.5 flex-wrap mb-5">
          {cos.map((c) => (
            <Link key={c.id} href={`/companies/${c.id}`} className="text-[11px] font-bold px-2.5 py-1 rounded border border-pos/40 bg-pos/[0.06] text-pos hover:bg-pos/15">{c.ticker} · {c.heat}</Link>
          ))}
        </div>

        {gov.length > 0 && (
          <>
            <div className="text-[11px] tracking-[0.15em] text-sub uppercase mb-3">Government Activity</div>
            <div className="flex gap-1.5 flex-wrap mb-5">
              {gov.map((g) => (
                <Link key={g.id} href={`/government/${g.id}`} className="text-[11px] font-bold px-2.5 py-1 rounded border border-info/40 bg-info/[0.06] text-info hover:bg-info/15">{g.ref}</Link>
              ))}
            </div>
          </>
        )}

        <div className="text-[11px] tracking-[0.15em] text-sub uppercase mb-3 border-t border-line pt-[18px]">Recent Events</div>
        {evs.length ? evs.map((e) => <EventCard key={e.id} ev={e} />) : <div className="text-muted text-[12.5px] py-10 text-center">No events tagged {t.name}.</div>}
      </div>
    </ViewFrame>
  );
}
