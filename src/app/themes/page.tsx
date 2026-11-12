import Link from "next/link";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { PageHead, Crumbs } from "@/components/ui";
import { themes as mockThemes } from "@/data/mock";
import { api } from "@/lib/api";

export default async function Themes() {
  const themes = (await api.themes()) ?? mockThemes;
  const rows = [...themes].sort((a, b) => b.heat - a.heat);
  const rail = <ContextRail scopeLabel="Themes" suggestions={["Hottest theme this week", "Which companies lead Quantum?", "Emerging themes by event velocity"]} />;

  return (
    <ViewFrame rail={rail}>
      <div className="px-4 md:px-[26px] py-[18px]">
        <Crumbs items={[{ label: "Themes" }]} />
        <PageHead title="Themes" stamp="7-DAY HEAT" />
        <div className="h-4" />
        {rows.map((t) => (
          <Link key={t.id} href={`/themes/${t.id}`} className="block bg-card border border-line rounded-[9px] px-4 py-3.5 mb-2.5 hover:border-[#333]">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[15px] font-bold text-theme">{t.name}</span>
              <span className="text-[16px] font-extrabold">{t.heat}</span>
            </div>
            <div className="h-[5px] bg-line rounded overflow-hidden"><div className="h-full bg-theme/80" style={{ width: `${t.heat}%` }} /></div>
            <div className="text-[11px] text-muted mt-2">{t.eventsToday} event{t.eventsToday === 1 ? "" : "s"} today</div>
          </Link>
        ))}
      </div>
    </ViewFrame>
  );
}
