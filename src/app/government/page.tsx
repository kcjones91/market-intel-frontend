import Link from "next/link";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { PageHead, Crumbs } from "@/components/ui";
import { govbodies as mockGov } from "@/data/mock";
import { api } from "@/lib/api";

const kindColor: Record<string, string> = {
  bill: "#4a90ff", hearing: "#a855f7", funding: "#22c55e",
  contract: "#f59e0b", grant: "#22c55e", solicitation: "#f59e0b",
};

export default async function Government() {
  const govbodies = (await api.government()) ?? mockGov;
  const rail = <ContextRail />;

  return (
    <ViewFrame rail={rail}>
      <div className="px-4 md:px-[26px] py-[18px]">
        <Crumbs items={[{ label: "Government" }]} />
        <PageHead title="Government Activity" stamp="BILLS · FUNDING · CONTRACTS" />
        <div className="h-4" />
        {govbodies.length === 0 && <div className="text-muted text-[12.5px] py-10 text-center">No government activity tracked yet.</div>}
        {govbodies.map((g) => (
          <Link key={g.id} href={`/government/${encodeURIComponent(g.id)}`} className="block bg-card border border-line rounded-[9px] px-4 py-3.5 mb-2.5 hover:border-[#333]">
            <div className="flex items-center gap-2 text-[12px] tracking-wide uppercase">
              <span className="font-bold" style={{ color: kindColor[g.kind] ?? "#8a8a8a" }}>{g.kind}</span>
              <span className="text-muted">{g.agency} · {g.ref}</span>
            </div>
            <div className="font-sans text-[15px] font-semibold mt-1.5">{g.title}</div>
            <div className="text-[12px] text-sub mt-1">{g.status}</div>
          </Link>
        ))}
      </div>
    </ViewFrame>
  );
}
