import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { Crumbs, PageHead } from "@/components/ui";

// Not built yet. Kept as a route so old links do not 404; it is not in the nav.
export default function Reports() {
  return (
    <ViewFrame rail={<ContextRail />}>
      <div className="px-4 md:px-[26px] py-[18px]">
        <Crumbs items={[{ label: "Reports" }]} />
        <PageHead title="Reports" stamp="NOT AVAILABLE YET" />
        <div className="text-muted text-[12.5px] py-12 text-center border border-dashed border-line rounded-lg mt-5">
          This view is not available yet.
        </div>
      </div>
    </ViewFrame>
  );
}
