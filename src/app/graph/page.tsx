"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ViewFrame } from "@/components/Shell";
import { ContextRail } from "@/components/ContextRail";
import { Crumbs, PageHead } from "@/components/ui";
import { graphNodes as mockNodes, graphEdges as mockEdges } from "@/data/mock";
import { api } from "@/lib/api";
import type { Edge, GraphNode } from "@/lib/types";

type Pt = { x: number; y: number };

// Hand-placed positions for the bundled mock graph.
const MOCK_POS: Record<string, Pt> = {
  ionq: { x: 230, y: 110 }, rgti: { x: 360, y: 170 }, ibm: { x: 150, y: 200 },
  rklb: { x: 480, y: 130 }, asts: { x: 580, y: 180 },
  quantum: { x: 280, y: 230 }, defense: { x: 430, y: 270 }, space: { x: 540, y: 270 },
  doe: { x: 200, y: 320 }, congress: { x: 120, y: 110 }, dod: { x: 560, y: 90 }, fusion: { x: 120, y: 320 },
};
const COLOR = { company: "#22c55e", theme: "#a855f7", govbody: "#4a90ff", executive: "#f59e0b" } as const;

// Live graphs have arbitrary nodes, so lay them out in columns by kind:
// government on the left, companies (and executives) in the middle, themes on the right.
const COLUMN_X: Record<GraphNode["kind"], number> = { govbody: 70, company: 290, executive: 290, theme: 520 };

function layout(nodes: GraphNode[]): { pos: Record<string, Pt>; height: number } {
  if (nodes.length > 0 && nodes.every((n) => MOCK_POS[n.id])) return { pos: MOCK_POS, height: 380 };

  const cols = new Map<number, GraphNode[]>();
  for (const n of nodes) {
    const x = COLUMN_X[n.kind] ?? 290;
    cols.set(x, [...(cols.get(x) ?? []), n]);
  }
  const rows = Math.max(1, ...Array.from(cols.values(), (c) => c.length));
  const height = Math.max(380, 60 + rows * 24);
  const pos: Record<string, Pt> = {};
  cols.forEach((col, x) => {
    const sorted = [...col].sort((a, b) => a.label.localeCompare(b.label));
    const step = (height - 60) / sorted.length;
    sorted.forEach((n, i) => { pos[n.id] = { x, y: 30 + step * (i + 0.5) }; });
  });
  return { pos, height };
}

const NO_NODES: GraphNode[] = [];
const NO_EDGES: Edge[] = [];

export default function Graph() {
  const router = useRouter();
  const [focus, setFocus] = useState<string | null>(null);
  const [graph, setGraph] = useState<{ nodes: GraphNode[]; edges: Edge[] } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.graph();
        if (!cancelled) setGraph(data ?? { nodes: mockNodes, edges: mockEdges });   // null = no API configured
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const nodes = graph?.nodes ?? NO_NODES;
  const edges = graph?.edges ?? NO_EDGES;
  const { pos, height } = useMemo(() => layout(nodes), [nodes]);
  const ids = useMemo(() => new Set(nodes.map((n) => n.id)), [nodes]);

  const neighbors = focus
    ? new Set([focus, ...edges.filter((e) => (e.a === focus || e.b === focus) && ids.has(e.a) && ids.has(e.b)).flatMap((e) => [e.a, e.b])])
    : null;

  const rail = <ContextRail />;

  return (
    <ViewFrame rail={rail}>
      <div className="px-4 md:px-[26px] py-[18px]">
        <Crumbs items={[{ label: "Graph" }]} />
        <PageHead title="Relationship Graph" stamp="CO-OCCURRENCE · TYPED EDGES" />
        <div className="text-[12px] text-sub mt-1.5">Select a node to focus its neighborhood. Edges link entities that appear together or fund/contract each other.</div>

        <div className="flex gap-3 text-[12px] text-muted mt-3 mb-2">
          <span><span className="inline-block w-2 h-2 rounded-full align-middle mr-1" style={{ background: COLOR.company }} />Company</span>
          <span><span className="inline-block w-2 h-2 rounded-full align-middle mr-1" style={{ background: COLOR.theme }} />Theme</span>
          <span><span className="inline-block w-2 h-2 rounded-full align-middle mr-1" style={{ background: COLOR.govbody }} />Government</span>
        </div>

        <div className="bg-card border border-line rounded-[10px] p-2 mt-1">
          {failed ? (
            <div className="text-neg text-[12.5px] py-16 text-center">Intel API unavailable. The graph could not be loaded.</div>
          ) : !graph ? (
            <div className="text-muted text-[12.5px] py-16 text-center">Loading graph…</div>
          ) : nodes.length === 0 ? (
            <div className="text-muted text-[12.5px] py-16 text-center">No relationships recorded yet.</div>
          ) : (
            <svg width="100%" viewBox={`0 0 700 ${height}`} className="select-none" onClick={() => setFocus(null)}>
              {edges.map((e, i) => {
                if (!ids.has(e.a) || !ids.has(e.b)) return null;   // skip edges whose node is missing
                const a = pos[e.a], b = pos[e.b];
                if (!a || !b) return null;
                const dim = neighbors && !(neighbors.has(e.a) && neighbors.has(e.b));
                const lit = neighbors && !dim;
                return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={dim ? "#161616" : lit ? "#3a3a3a" : "#2a2a2a"} strokeWidth={1} />;
              })}
              {nodes.map((n) => {
                const p = pos[n.id]; if (!p) return null;
                const dim = neighbors && !neighbors.has(n.id);
                const color = COLOR[n.kind] ?? "#a3a3a3";
                const id = encodeURIComponent(n.id);
                return (
                  <g key={n.id} style={{ cursor: "pointer", opacity: dim ? 0.3 : 1 }}
                     onClick={(ev) => {
                       ev.stopPropagation();
                       if (focus !== n.id) { setFocus(n.id); return; }
                       router.push(n.kind === "theme" ? `/themes/${id}` : n.kind === "company" ? `/companies/${id}` : `/government/${id}`);
                     }}>
                    <circle cx={p.x} cy={p.y} r={focus === n.id ? 8 : 6} fill={color} stroke={focus === n.id ? "#fff" : "none"} strokeWidth={1} />
                    <text x={p.x + 11} y={p.y + 4} fill="#ccc" fontSize={12} fontFamily="monospace">{n.label}</text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
        <div className="text-[12px] text-muted mt-2">Select a node to focus it · select it again to open it · select empty space to clear</div>
      </div>
    </ViewFrame>
  );
}
