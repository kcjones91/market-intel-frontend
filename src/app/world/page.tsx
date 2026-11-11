import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { Crumbs, PageHead } from "@/components/ui";
import { regions } from "@/data/mock";

export default function World() {
  return (
    <ViewFrame rail={<ContextRail scopeLabel="World Events" />}>
      <div className="px-[26px] py-[18px]">
        <Crumbs items={[{ label: "World Events" }]} />
        <PageHead title="World Events" stamp="GEOPOLITICAL · V2 PREVIEW" />
        <div className="h-4" />
        {regions.map((r) => (
          <div key={r.id} className="bg-card border border-line rounded-[9px] px-4 py-3.5 mb-2.5">
            <div className="text-[15px] font-bold">{r.name}</div>
            <div className="text-[11px] text-muted mt-1">Impacts: {r.impacts.join(", ")}</div>
          </div>
        ))}
      </div>
    </ViewFrame>
  );
}
