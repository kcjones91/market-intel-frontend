"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { companies as mockCompanies, themes as mockThemes } from "@/data/mock";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { Company, Theme } from "@/lib/types";

function heatColor(h: number) {
  if (h >= 80) return "text-pos";
  if (h >= 60) return "text-amber";
  if (h >= 40) return "text-sub";
  return "text-faint";
}
function heatIcon(h: number) {
  if (h >= 80) return "🔥";
  if (h >= 60) return "⚠";
  if (h >= 40) return "✓";
  return "·";
}

type RailData = { companies: Company[]; themes: Theme[] };

// The rail remounts on every navigation. Keep the last answer so it does not
// flash a loading state on each page, then refresh it in the background.
let cache: RailData | null = null;

export function ContextRail({
  scopeLabel = "Dashboard",
  suggestions = [
    "Which names benefit from HR-4871?",
    "Quantum legislation, last 90 days",
    "Why is IONQ heat rising?",
  ],
}: {
  scopeLabel?: string;
  suggestions?: string[];
}) {
  const [data, setData] = useState<RailData | null>(cache);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cos, ths] = await Promise.all([api.companies(), api.themes()]);
        // null = no API configured, so use the bundled mock data.
        const next: RailData = { companies: cos ?? mockCompanies, themes: ths ?? mockThemes };
        cache = next;
        if (!cancelled) { setData(next); setFailed(false); }
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const watched = (data?.companies ?? []).filter((c) => c.watched).sort((a, b) => b.heat - a.heat);
  const heatThemes = [...(data?.themes ?? [])].sort((a, b) => b.heat - a.heat).slice(0, 5);

  return (
    <aside className="border-t lg:border-t-0 lg:border-l border-line lg:h-screen lg:sticky lg:top-0 lg:overflow-y-auto pane px-4 lg:px-[18px] py-5">
      <div className="flex gap-4 text-[10px] tracking-[0.15em] text-faint uppercase mb-4">
        <span className="text-sub">Watchlist</span><span>Heat</span>
      </div>

      {!data && !failed && <div className="text-[11px] text-faint py-2">Loading…</div>}
      {!data && failed && <div className="text-[11px] text-neg py-2">Intel API unavailable.</div>}
      {data && watched.length === 0 && <div className="text-[11px] text-faint py-2">No watched companies.</div>}

      {watched.map((c) => (
        <Link
          key={c.id}
          href={`/companies/${c.id}`}
          className="flex items-center justify-between py-[9px] border-b border-linesoft last:border-0 group"
        >
          <div>
            <div className="text-[13px] font-bold group-hover:text-mint">{c.ticker ?? c.name}</div>
            <div className="text-[10px] text-muted mt-0.5">
              {c.eventsToday ? `${c.eventsToday} events today` : "no events"}
            </div>
          </div>
          <div className={cn("flex items-center gap-1.5 text-[13px] font-bold", heatColor(c.heat))}>
            {heatIcon(c.heat)} {c.heat}
          </div>
        </Link>
      ))}

      <div className="mt-7">
        <div className="text-[10px] tracking-[0.15em] text-faint uppercase mb-3">
          Theme Heat Map <span className="text-muted ml-1">7D</span>
        </div>
        {heatThemes.map((t) => (
          <Link key={t.id} href={`/themes/${t.id}`} className="grid grid-cols-[60px_1fr_26px] items-center gap-2 mb-[9px] group">
            <span className="text-[11.5px] text-sub group-hover:text-ink truncate">{t.name}</span>
            <span className="h-1 bg-line rounded-sm overflow-hidden">
              <span className="block h-full bg-mint/85" style={{ width: `${t.heat}%` }} />
            </span>
            <span className="text-[10.5px] text-muted text-right">{t.heat}</span>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] text-faint uppercase mt-7">
        ⚡ Ask the Analyst
      </div>
      <div className="mt-3.5 bg-card border border-line rounded-lg p-3">
        <div className="text-[9.5px] tracking-wide text-mint mb-2">SCOPE · {scopeLabel.toUpperCase()}</div>
        <div className="text-[11.5px] text-faint">Ask across all intel...</div>
        <div className="text-[11px] text-info mt-2.5 leading-7">
          {suggestions.map((s, i) => (
            <div key={i} className="cursor-pointer hover:text-ink before:content-['›_'] before:text-muted">{s}</div>
          ))}
        </div>
      </div>
      <div className="text-[9.5px] text-faint mt-3">Local vLLM · Qwen3.5 · swipe-lab</div>
    </aside>
  );
}
