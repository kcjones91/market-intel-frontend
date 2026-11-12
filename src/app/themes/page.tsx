import Link from "next/link";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { PageHead, Crumbs } from "@/components/ui";
import { themes as mockThemes } from "@/data/mock";
import { api } from "@/lib/api";
import { heatVisible, byActivity, byHeat } from "@/lib/heat";

export default async function Themes() {
  const live = await api.themes();
  const themes = live ?? mockThemes;
  const showHeat = heatVisible(live !== null);
  const rows = [...themes].sort(showHeat ? byHeat : byActivity);
  const rail = <ContextRail />;

  return (
    <ViewFrame rail={rail}>
      <div className="px-4 md:px-[26px] py-[18px]">
        <Crumbs items={[{ label: "Themes" }]} />
        <PageHead title="Themes" stamp={showHeat ? "7-DAY HEAT" : `${themes.length} TRACKED`} />
        <div className="h-4" />
        {rows.map((t) => (
          <Link key={t.id} href={`/themes/${t.id}`} className="block bg-card border border-line rounded-[9px] px-4 py-3.5 mb-2.5 hover:border-[#333]">
            <div className={`flex justify-between items-center ${showHeat ? "mb-2.5" : ""}`}>
              <span className="text-[15px] font-bold text-theme">{t.name}</span>
              {showHeat && <span className="text-[16px] font-extrabold">{t.heat}</span>}
            </div>
            {showHeat && <div className="h-[5px] bg-line rounded overflow-hidden"><div className="h-full bg-theme/80" style={{ width: `${t.heat}%` }} /></div>}
            <div className="text-[12px] text-muted mt-2">{t.eventsToday} event{t.eventsToday === 1 ? "" : "s"} today</div>
          </Link>
        ))}
      </div>
    </ViewFrame>
  );
}
