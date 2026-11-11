import Link from "next/link";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { Crumbs, PageHead } from "@/components/ui";
import { triggeredAlerts, alertRules } from "@/data/mock";

const channelColor: Record<string, string> = { discord: "#5865F2", slack: "#36C5F0", email: "#8a8a8a", telegram: "#229ED9" };

export default function Alerts() {
  const rail = <ContextRail scopeLabel="Alerts" suggestions={["Why did this rule fire?", "Suggest a rule for quantum funding", "Mute low-signal alerts"]} />;

  return (
    <ViewFrame rail={rail}>
      <div className="px-[26px] py-[18px]">
        <Crumbs items={[{ label: "Alerts" }]} />
        <PageHead title="Alerts" stamp={`${triggeredAlerts.length} FIRED TODAY`} />

        <div className="text-[11px] tracking-[0.15em] text-sub uppercase mt-5 mb-3">Triggered</div>
        {triggeredAlerts.map((a) => {
          const href = a.ref ? (a.ref.kind === "event" ? `/event/${a.ref.id}` : a.ref.kind === "theme" ? `/themes/${a.ref.id}` : `/companies/${a.ref.id}`) : "#";
          return (
            <Link key={a.id} href={href} className="flex justify-between items-center bg-card border border-line rounded-[9px] px-4 py-3 mb-2.5 hover:border-[#333]">
              <div>
                <div className="font-sans text-[13px]">{a.hit}</div>
                <div className="text-[10px] text-muted mt-0.5">{a.ruleName} · {a.time}</div>
              </div>
              <div className="text-neg text-[12px]">▲</div>
            </Link>
          );
        })}

        <div className="text-[11px] tracking-[0.15em] text-sub uppercase mt-7 mb-3 border-t border-line pt-[18px]">Rules</div>
        {alertRules.map((r) => (
          <div key={r.id} className="flex justify-between items-center bg-card border border-line rounded-[9px] px-4 py-3 mb-2.5">
            <div>
              <div className="text-[13px] font-semibold">{r.name}</div>
              <div className="text-[10px] text-muted mt-0.5">{r.scopeKind} · {r.scopeValue}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {r.channels.map((ch) => (
                  <span key={ch} className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase" style={{ color: channelColor[ch], border: `1px solid ${channelColor[ch]}40` }}>{ch}</span>
                ))}
              </div>
              <span className="text-[10px]" style={{ color: r.enabled ? "#00ff88" : "#444" }}>{r.enabled ? "ON" : "OFF"}</span>
            </div>
          </div>
        ))}
        <button className="text-[12px] text-mint border border-mint/40 rounded-lg px-4 py-2.5 mt-2 hover:bg-mint/10">+ New rule</button>
      </div>
    </ViewFrame>
  );
}
