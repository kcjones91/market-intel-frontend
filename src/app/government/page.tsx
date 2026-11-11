import Link from "next/link";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { PageHead, Crumbs } from "@/components/ui";
import { govbodies } from "@/data/mock";

const kindColor: Record<string, string> = {
  bill: "#4a90ff", hearing: "#a855f7", funding: "#22c55e",
  contract: "#f59e0b", grant: "#22c55e", solicitation: "#f59e0b",
};

export default function Government() {
  const rail = <ContextRail scopeLabel="Government" suggestions={["Which watched names are most gov-exposed?", "Open solicitations by theme", "New contracts this week"]} />;

  return (
    <ViewFrame rail={rail}>
      <div className="px-[26px] py-[18px]">
        <Crumbs items={[{ label: "Government" }]} />
        <PageHead title="Government Activity" stamp="BILLS · FUNDING · CONTRACTS" />
        <div className="h-4" />
        {govbodies.map((g) => (
          <Link key={g.id} href={`/government/${g.id}`} className="block bg-card border border-line rounded-[9px] px-4 py-3.5 mb-2.5 hover:border-[#333]">
            <div className="flex items-center gap-2 text-[10px] tracking-wide uppercase">
              <span className="font-bold" style={{ color: kindColor[g.kind] }}>{g.kind}</span>
              <span className="text-muted">{g.agency} · {g.ref}</span>
            </div>
            <div className="font-sans text-[15px] font-semibold mt-1.5">{g.title}</div>
            <div className="text-[11px] text-sub mt-1">{g.status}</div>
          </Link>
        ))}
      </div>
    </ViewFrame>
  );
}
