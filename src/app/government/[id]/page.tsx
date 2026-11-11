import { notFound } from "next/navigation";
import Link from "next/link";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { Crumbs, ThemeTag } from "@/components/ui";
import { govbodies, govById, companyById, events } from "@/data/mock";

export function generateStaticParams() {
  return govbodies.map((g) => ({ id: g.id }));
}

export default function GovView({ params }: { params: { id: string } }) {
  const g = govById(params.id);
  if (!g) notFound();

  const related = events.filter((e) => e.entities.some((en) => en.kind === "govbody" && en.id === g.id));
  const rail = <ContextRail scopeLabel={g.ref} suggestions={["Which companies benefit most?", "Similar past legislation", "Timeline to next milestone"]} />;

  return (
    <ViewFrame rail={rail}>
      <div className="px-[26px] py-[18px]">
        <Crumbs items={[{ href: "/government", label: "Government" }, { label: g.ref }]} />

        <div className="bg-card border border-line rounded-[10px] p-[22px]">
          <div className="text-[10px] tracking-wide text-muted uppercase">{g.agency} · {g.kind} · {g.ref}</div>
          <h1 className="font-sans text-[21px] font-bold leading-tight my-2.5">{g.title}</h1>
          <div className="text-[12px] text-sub">{g.status}</div>

          <div className="text-[11px] tracking-[0.15em] text-sub uppercase mt-[22px] mb-3 border-t border-line pt-[18px]">Affected Companies</div>
          <div className="flex gap-1.5 flex-wrap">
            {g.affects.length ? g.affects.map((id) => {
              const c = companyById(id);
              return c ? <Link key={id} href={`/companies/${id}`} className="text-[11px] font-bold px-2.5 py-1 rounded border border-pos/40 bg-pos/[0.06] text-pos hover:bg-pos/15">{c.ticker}</Link> : null;
            }) : <span className="text-[11px] text-muted">No direct corporate exposure tagged.</span>}
          </div>

          <div className="text-[11px] tracking-[0.15em] text-sub uppercase mt-[22px] mb-3">Themes</div>
          <div className="flex gap-1.5 flex-wrap">{g.themes.map((t) => <ThemeTag key={t} id={t} label={t.toUpperCase()} />)}</div>

          {related.length > 0 && (
            <>
              <div className="text-[11px] tracking-[0.15em] text-sub uppercase mt-[22px] mb-3 border-t border-line pt-[18px]">Related Events</div>
              <div className="flex flex-col gap-2">
                {related.map((r) => (
                  <Link key={r.id} href={`/event/${r.id}`} className="flex justify-between items-center bg-cardhi border border-line rounded-[7px] px-3.5 py-2.5 hover:border-[#333]">
                    <div><div className="font-sans text-[12.5px]">{r.title}</div><div className="text-[10px] text-muted">{r.sourceLabel} · {r.time}</div></div>
                    <div className="text-[10.5px] text-faint">{r.importance}</div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </ViewFrame>
  );
}
