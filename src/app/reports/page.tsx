import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { Crumbs, PageHead } from "@/components/ui";

export default function Reports() {
  return (
    <ViewFrame rail={<ContextRail scopeLabel="Reports" />}>
      <div className="px-4 md:px-[26px] py-[18px]">
        <Crumbs items={[{ label: "Reports" }]} />
        <PageHead title="Reports" stamp="COMING IN V2" />
        <div className="text-muted text-[12.5px] py-12 text-center border border-dashed border-line rounded-lg mt-5">
          Saved briefings and exports land here. Generate a daily-brief archive, theme deep-dives, and company dossiers over a date range.
        </div>
      </div>
    </ViewFrame>
  );
}
