"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { Crumbs, PageHead } from "@/components/ui";
import { graphNodes, graphEdges } from "@/data/mock";

const POS: Record<string, { x: number; y: number }> = {
  ionq: { x: 230, y: 110 }, rgti: { x: 360, y: 170 }, ibm: { x: 150, y: 200 },
  rklb: { x: 480, y: 130 }, asts: { x: 580, y: 180 },
  quantum: { x: 280, y: 230 }, defense: { x: 430, y: 270 }, space: { x: 540, y: 270 },
  doe: { x: 200, y: 320 }, congress: { x: 120, y: 110 }, dod: { x: 560, y: 90 }, fusion: { x: 120, y: 320 },
};
const COLOR = { company: "#22c55e", theme: "#a855f7", govbody: "#4a90ff", executive: "#f59e0b" } as const;

export default function Graph() {
  const router = useRouter();
  const [focus, setFocus] = useState<string | null>(null);

  const neighbors = focus
    ? new Set(graphEdges.filter((e) => e.a === focus || e.b === focus).flatMap((e) => [e.a, e.b]))
    : null;

  const rail = (
    <ContextRail
      scopeLabel={focus ? focus : "Graph"}
      suggestions={focus ? ["Strongest connections", "Path to government funding", "Co-occurring entities"] : ["Most connected entity", "Quantum cluster overview", "Agencies funding watched names"]}
    />
  );

  return (
    <ViewFrame rail={rail}>
      <div className="px-[26px] py-[18px]">
        <Crumbs items={[{ label: "Graph" }]} />
        <PageHead title="Relationship Graph" stamp="CO-OCCURRENCE · TYPED EDGES" />
        <div className="text-[12px] text-sub mt-1.5">Click a node to focus its neighborhood. Edges link entities that appear together or fund/contract each other.</div>

        <div className="flex gap-3 text-[10px] text-muted mt-3 mb-2">
          <span><span className="inline-block w-2 h-2 rounded-full align-middle mr-1" style={{ background: COLOR.company }} />Company</span>
          <span><span className="inline-block w-2 h-2 rounded-full align-middle mr-1" style={{ background: COLOR.theme }} />Theme</span>
          <span><span className="inline-block w-2 h-2 rounded-full align-middle mr-1" style={{ background: COLOR.govbody }} />Government</span>
        </div>

        <div className="bg-card border border-line rounded-[10px] p-2 mt-1">
          <svg width="100%" viewBox="0 0 700 380" className="select-none">
            {graphEdges.map((e, i) => {
              const a = POS[e.a], b = POS[e.b];
              if (!a || !b) return null;
              const dim = neighbors && !(neighbors.has(e.a) && neighbors.has(e.b));
              return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={dim ? "#161616" : "#2a2a2a"} strokeWidth={1} />;
            })}
            {graphNodes.map((n) => {
              const p = POS[n.id]; if (!p) return null;
              const dim = neighbors && !neighbors.has(n.id);
              const color = COLOR[n.kind];
              return (
                <g key={n.id} style={{ cursor: "pointer", opacity: dim ? 0.3 : 1 }}
                   onClick={() => setFocus(focus === n.id ? null : n.id)}
                   onDoubleClick={() => router.push(n.kind === "theme" ? `/themes/${n.id}` : n.kind === "company" ? `/companies/${n.id}` : `/government/${n.id}`)}>
                  <circle cx={p.x} cy={p.y} r={focus === n.id ? 8 : 6} fill={color} stroke={focus === n.id ? "#fff" : "none"} strokeWidth={1} />
                  <text x={p.x + 11} y={p.y + 4} fill="#ccc" fontSize={11} fontFamily="monospace">{n.label}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="text-[10px] text-faint mt-2">Single-click to focus · double-click to open the entity</div>
      </div>
    </ViewFrame>
  );
}
