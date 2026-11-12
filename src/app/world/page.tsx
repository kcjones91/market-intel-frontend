import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { Crumbs, PageHead } from "@/components/ui";
import { regions } from "@/data/mock";
import { apiEnabled } from "@/lib/api";

// Not built yet. The backend has no world-events data, so with a live API this
// page shows nothing rather than sample regions. The sample list renders only
// in sample mode, under the site-wide sample banner.
export default function World() {
  return (
    <ViewFrame rail={<ContextRail />}>
      <div className="px-4 md:px-[26px] py-[18px]">
        <Crumbs items={[{ label: "World Events" }]} />
        <PageHead title="World Events" stamp="NOT AVAILABLE YET" />
        <div className="h-4" />
        {apiEnabled ? (
          <div className="text-muted text-[12.5px] py-12 text-center border border-dashed border-line rounded-lg">
            This view is not available yet.
          </div>
        ) : (
          regions.map((r) => (
            <div key={r.id} className="bg-card border border-line rounded-[9px] px-4 py-3.5 mb-2.5">
              <div className="text-[15px] font-bold">{r.name}</div>
              <div className="text-[12px] text-muted mt-1">Impacts: {r.impacts.join(", ")}</div>
            </div>
          ))
        )}
      </div>
    </ViewFrame>
  );
}
