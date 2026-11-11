"use client";
import { useState } from "react";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { Crumbs, PageHead, EventCard } from "@/components/ui";
import { events } from "@/data/mock";

const EXAMPLES = [
  "quantum legislation",
  "national security contract",
  "DOE funding",
  "hiring signal",
];

export default function Search() {
  const [q, setQ] = useState("");
  const norm = q.trim().toLowerCase();
  const results = norm
    ? events.filter((e) => (e.title + e.summary + e.companies.join() + e.themes.join() + e.sourceLabel).toLowerCase().includes(norm))
    : events;

  const rail = <ContextRail scopeLabel="Search" suggestions={["All quantum legislation, last 90 days", "Companies with increasing gov activity", "Agencies interacting with IonQ"]} />;

  return (
    <ViewFrame rail={rail}>
      <div className="px-[26px] py-[18px]">
        <Crumbs items={[{ label: "Search" }]} />
        <PageHead title="Search" stamp="FULL CORPUS" />
        <div className="h-4" />
        <div className="flex gap-2 mb-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask in plain language — e.g. quantum legislation last 90 days"
            className="flex-1 bg-card border border-line rounded-lg px-3.5 py-2.5 text-[13px] text-ink placeholder:text-faint focus:outline-none focus:border-info font-mono"
          />
        </div>
        <div className="flex gap-2 flex-wrap mb-5">
          {EXAMPLES.map((x) => (
            <button key={x} onClick={() => setQ(x)} className="text-[11px] text-info border border-info/30 rounded px-2.5 py-1 hover:bg-info/10">{x}</button>
          ))}
        </div>
        <div className="text-[10px] tracking-wide text-faint uppercase mb-3">{results.length} result{results.length === 1 ? "" : "s"}</div>
        {results.length ? results.map((e) => <EventCard key={e.id} ev={e} />) : <div className="text-muted text-[12.5px] py-10 text-center">No matches. Try a broader term.</div>}
      </div>
    </ViewFrame>
  );
}
