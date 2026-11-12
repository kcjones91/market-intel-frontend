import Link from "next/link";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { Crumbs, PageHead } from "@/components/ui";
import { triggeredAlerts as mockTriggered, alertRules as mockRules } from "@/data/mock";
import { api } from "@/lib/api";

const channelColor: Record<string, string> = { discord: "#8a93ff", slack: "#36C5F0", email: "#a3a3a3", telegram: "#229ED9" };

export default async function Alerts() {
  const data = await api.alerts();
  const triggeredAlerts = data ? data.triggered : mockTriggered;
  const alertRules = data ? data.rules : mockRules;

  const rail = <ContextRail />;

  return (
    <ViewFrame rail={rail}>
      <div className="px-4 md:px-[26px] py-[18px]">
        <Crumbs items={[{ label: "Alerts" }]} />
        <PageHead title="Alerts" stamp={`${triggeredAlerts.length} FIRED TODAY`} />

        <div className="text-[12px] tracking-[0.15em] text-sub uppercase mt-5 mb-3">Triggered</div>
        {triggeredAlerts.length === 0 && <div className="text-muted text-[12.5px] py-6 text-center">No alerts have fired today.</div>}
        {triggeredAlerts.map((a) => {
          const rid = a.ref ? encodeURIComponent(a.ref.id) : "";
          const href = a.ref ? (a.ref.kind === "event" ? `/event/${rid}` : a.ref.kind === "theme" ? `/themes/${rid}` : `/companies/${rid}`) : "#";
          return (
            <Link key={a.id} href={href} className="flex justify-between items-center bg-card border border-line rounded-[9px] px-4 py-3 mb-2.5 hover:border-[#333]">
              <div>
                <div className="font-sans text-[13px]">{a.hit}</div>
                <div className="text-[12px] text-muted mt-0.5">{a.ruleName} · {a.time}</div>
              </div>
              <div className="text-amber text-[12px]" aria-hidden="true">●</div>
            </Link>
          );
        })}

        <div className="text-[12px] tracking-[0.15em] text-sub uppercase mt-7 mb-3 border-t border-line pt-[18px]">Rules</div>
        {alertRules.length === 0 && <div className="text-muted text-[12.5px] py-6 text-center">No alert rules defined.</div>}
        {alertRules.map((r) => (
          <div key={r.id} className="flex flex-col gap-2.5 sm:flex-row sm:justify-between sm:items-center bg-card border border-line rounded-[9px] px-4 py-3 mb-2.5">
            <div>
              <div className="text-[13px] font-semibold">{r.name}</div>
              <div className="text-[12px] text-muted mt-0.5">{r.scopeKind} · {r.scopeValue}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {r.channels.map((ch) => (
                  <span key={ch} className="text-[12px] font-bold px-1.5 py-0.5 rounded uppercase" style={{ color: channelColor[ch] ?? "#a3a3a3", border: `1px solid ${channelColor[ch] ?? "#a3a3a3"}40` }}>{ch}</span>
                ))}
              </div>
              <span className="text-[12px]" style={{ color: r.enabled ? "#00ff88" : "#808080" }}>{r.enabled ? "ON" : "OFF"}</span>
            </div>
          </div>
        ))}
        <button className="text-[12px] text-mint border border-mint/40 rounded-lg px-4 py-2.5 mt-2 hover:bg-mint/10">+ New rule</button>
      </div>
    </ViewFrame>
  );
}
