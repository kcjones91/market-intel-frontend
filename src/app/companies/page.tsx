import Link from "next/link";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { PageHead, Crumbs } from "@/components/ui";
import { companies as mockCompanies } from "@/data/mock";
import { api } from "@/lib/api";

export default async function Companies() {
  const companies = (await api.companies()) ?? mockCompanies;
  const rows = [...companies].sort((a, b) => b.heat - a.heat);
  const rail = <ContextRail />;

  return (
    <ViewFrame rail={rail}>
      <div className="px-4 md:px-[26px] py-[18px]">
        <Crumbs items={[{ label: "Companies" }]} />
        <PageHead title="Companies" stamp={`${companies.length} MONITORED`} />
        <div className="h-4" />
        <div className="bg-card border border-line rounded-[9px] overflow-hidden">
          <div className="grid grid-cols-[1fr_48px_64px_56px] md:grid-cols-[1.4fr_1fr_70px_70px_60px] text-[12px] tracking-wide text-muted uppercase px-4 py-2.5 border-b border-line">
            <span>Company</span><span className="hidden md:block">Sector</span><span className="text-right">Heat</span><span className="text-right">Events</span><span className="text-right">Watch</span>
          </div>
          {rows.map((c) => (
            <Link key={c.id} href={`/companies/${c.id}`} className="grid grid-cols-[1fr_48px_64px_56px] md:grid-cols-[1.4fr_1fr_70px_70px_60px] items-center px-4 py-3 border-b border-linesoft last:border-0 hover:bg-cardhi">
              <span className="min-w-0 truncate"><span className="text-[13px] font-bold">{c.ticker ?? c.name}</span> {c.ticker && <span className="text-[12px] text-muted ml-1.5">{c.name}</span>}</span>
              <span className="hidden md:block text-[12px] text-sub">{c.sector}</span>
              <span className="text-right text-[13px] font-bold" style={{ color: c.heat >= 80 ? "#22c55e" : c.heat >= 60 ? "#f59e0b" : "#8a8a8a" }}>{c.heat}</span>
              <span className="text-right text-[12px] text-sub">{c.eventsToday}</span>
              <span className="text-right text-[12px]" style={{ color: c.watched ? "#00ff88" : "#444" }}>{c.watched ? "★" : "☆"}</span>
            </Link>
          ))}
        </div>
      </div>
    </ViewFrame>
  );
}
