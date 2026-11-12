import { notFound } from "next/navigation";
import Link from "next/link";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { Crumbs, ThemeTag } from "@/components/ui";
import { govById, companies as mockCompanies, events as mockEvents } from "@/data/mock";
import { api, allEvents } from "@/lib/api";

// The backend has no /api/government/{id} endpoint, so the record comes from
// the list, and related events come from today's feed.
export default async function GovView({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id);
  const [list, cos, today] = await Promise.all([api.government(), api.companies(), api.today()]);
  const live = list !== null;

  const g = live ? list.find((x) => x.id === id) : govById(id);
  if (!g) notFound();

  const companies = live ? cos ?? [] : mockCompanies;
  const events = live ? allEvents(today) : mockEvents;
  const byId = new Map(companies.map((c) => [c.id, c]));

  const related = events.filter((e) => e.entities.some((en) => en.kind === "govbody" && en.id === g.id));
  const rail = <ContextRail />;

  return (
    <ViewFrame rail={rail}>
      <div className="px-4 md:px-[26px] py-[18px]">
        <Crumbs items={[{ href: "/government", label: "Government" }, { label: g.ref }]} />

        <div className="bg-card border border-line rounded-[10px] p-[22px]">
          <div className="text-[12px] tracking-wide text-muted uppercase">{g.agency} · {g.kind} · {g.ref}</div>
          <h1 className="font-sans text-[21px] font-bold leading-tight my-2.5">{g.title}</h1>
          <div className="text-[12px] text-sub">{g.status}</div>

          <div className="text-[12px] tracking-[0.15em] text-sub uppercase mt-[22px] mb-3 border-t border-line pt-[18px]">Affected Companies</div>
          <div className="flex gap-1.5 flex-wrap">
            {g.affects.length ? g.affects.map((cid) => {
              const c = byId.get(cid);
              return <Link key={cid} href={`/companies/${cid}`} className="text-[12px] font-bold px-2.5 py-1 rounded border border-pos/40 bg-pos/[0.06] text-pos hover:bg-pos/15">{c?.ticker ?? c?.name ?? cid.toUpperCase()}</Link>;
            }) : <span className="text-[12px] text-muted">No direct corporate exposure tagged.</span>}
          </div>

          <div className="text-[12px] tracking-[0.15em] text-sub uppercase mt-[22px] mb-3">Themes</div>
          <div className="flex gap-1.5 flex-wrap">{g.themes.map((t) => <ThemeTag key={t} id={t} label={t.toUpperCase()} />)}</div>

          {related.length > 0 && (
            <>
              <div className="text-[12px] tracking-[0.15em] text-sub uppercase mt-[22px] mb-3 border-t border-line pt-[18px]">Related Events</div>
              <div className="flex flex-col gap-2">
                {related.map((r) => (
                  <Link key={r.id} href={`/event/${r.id}`} className="flex justify-between items-center bg-cardhi border border-line rounded-[7px] px-3.5 py-2.5 hover:border-[#333]">
                    <div><div className="font-sans text-[12.5px]">{r.title}</div><div className="text-[12px] text-muted">{r.sourceLabel} · {r.time}</div></div>
                    <div className="text-[12px] text-muted">{r.importance}</div>
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
