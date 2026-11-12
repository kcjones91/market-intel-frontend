import { notFound } from "next/navigation";
import Link from "next/link";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { Crumbs, TickerTag, ThemeTag } from "@/components/ui";
import { eventById, events as mockEvents } from "@/data/mock";
import { api, apiEnabled } from "@/lib/api";
import { sourceLink } from "@/lib/links";
import { Help } from "@/components/Help";
import type { Term } from "@/lib/glossary";

export default async function EventView({ params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id);
  const data = await api.event(id);
  if (!data && apiEnabled) notFound();        // live mode: unknown id is a 404, never a mock record

  const ev = data?.event ?? eventById(id);
  if (!ev) notFound();

  const related = data
    ? data.related
    : mockEvents.filter(
        (x) => x.id !== ev.id && (x.companies.some((c) => ev.companies.includes(c)) || x.themes.some((t) => ev.themes.includes(t)))
      );

  // The stored address can be a data API endpoint; turn it into a page a reader can open.
  const source = sourceLink(ev.docUrl, ev.id);

  const rail = <ContextRail />;

  return (
    <ViewFrame rail={rail}>
      <div className="px-4 md:px-[26px] py-[18px]">
        <Crumbs items={[{ href: "/", label: "Dashboard" }, { label: `#${ev.id}` }]} />

        <div className="bg-card border border-line rounded-[10px] p-[22px]">
          <div className="text-[12px] tracking-wide text-muted uppercase">
            {ev.sourceLabel} · {ev.docType} · {ev.date} {ev.time}
          </div>
          <h1 className="font-sans text-[21px] font-bold leading-tight my-2.5">{ev.title}</h1>
          <p className="font-sans text-[13.5px] leading-relaxed max-w-[680px]">{ev.summary}</p>

          <div className="grid grid-cols-2 gap-3.5 my-5">
            <Box label="Importance" help="importance">
              <span style={{ color: ev.priority === "high" ? "#f59e0b" : ev.priority === "med" ? "#e8e8e8" : "#808080" }}>{ev.importance} / 100</span>
            </Box>
            <Box label="Confidence" help="confidence">
              {ev.confidence} / 100
              <span className="block h-[5px] bg-line rounded mt-[7px] overflow-hidden">
                <span className="block h-full bg-mint" style={{ width: `${ev.confidence}%` }} />
              </span>
            </Box>
          </div>

          <Section label="Entities" />
          <div className="flex gap-1.5 flex-wrap">
            {ev.entities.filter((e) => e.kind === "company").map((e) => <TickerTag key={e.id} id={e.id} label={e.label} />)}
            {ev.themes.map((t) => <ThemeTag key={t} id={t} label={t.toUpperCase()} />)}
            {ev.entities.filter((e) => e.kind === "govbody").map((e) => (
              <Link key={e.id} href={`/government/${encodeURIComponent(e.id)}`} className="text-[12px] font-bold px-[7px] py-0.5 rounded border border-info/40 bg-info/[0.06] text-info hover:bg-info/15">{e.label}</Link>
            ))}
          </div>

          {source.href ? (
            <a href={source.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-info text-[12px] mt-4 hover:underline [overflow-wrap:anywhere]">↗ View source document · {source.label}</a>
          ) : source.label ? (
            <div className="inline-flex items-center gap-1.5 text-muted text-[12px] mt-4 [overflow-wrap:anywhere]">Source · {source.label}</div>
          ) : null}

          <Section label="Related Events" />
          <div className="flex flex-col gap-2">
            {related.length ? related.map((r) => (
              <Link key={r.id} href={`/event/${r.id}`} className="flex justify-between items-center bg-cardhi border border-line rounded-[7px] px-3.5 py-2.5 hover:border-[#333]">
                <div>
                  <div className="font-sans text-[12.5px]">{r.title}</div>
                  <div className="text-[12px] text-muted">{r.sourceLabel} · {r.time}</div>
                </div>
                <div className="text-[12px] text-muted">{r.importance}</div>
              </Link>
            )) : <div className="text-[12px] text-muted">No related events.</div>}
          </div>
        </div>
      </div>
    </ViewFrame>
  );
}

function Box({ label, help, children }: { label: string; help?: Term; children: React.ReactNode }) {
  return (
    <div className="bg-cardhi border border-line rounded-[7px] px-3.5 py-3">
      <div className="text-[12px] tracking-wide text-muted uppercase mb-1.5">{label}{help && <> <Help term={help} /></>}</div>
      <div className="text-[14px]">{children}</div>
    </div>
  );
}
function Section({ label }: { label: string }) {
  return <div className="text-[12px] tracking-[0.15em] text-sub uppercase mt-[22px] mb-3 border-t border-line pt-[18px]">{label}</div>;
}
