"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { companies as mockCompanies, themes as mockThemes } from "@/data/mock";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";
import { heatVisible, byActivity } from "@/lib/heat";
import { Help } from "@/components/Help";
import type { Company, Theme } from "@/lib/types";

function heatColor(h: number) {
  if (h >= 80) return "text-pos";
  if (h >= 60) return "text-amber";
  if (h >= 40) return "text-sub";
  return "text-muted";
}

type RailData = { companies: Company[]; themes: Theme[]; live: boolean };

// The rail remounts on every navigation. Keep the last answer so it does not
// flash a loading state on each page, then refresh it in the background.
let cache: RailData | null = null;

const WIDE = "(min-width: 1024px)";

// Side panel: watchlist heat and theme heat. Shown beside the content on wide
// screens only. On phones and tablets both lists are one tap away in the nav
// (Watchlist, Themes), and repeating them under every page buried the content.
export function ContextRail() {
  const [data, setData] = useState<RailData | null>(cache);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const mq = window.matchMedia(WIDE);

    const load = async () => {
      if (!mq.matches) return;   // hidden on narrow screens, so do not fetch for it
      try {
        const [cos, ths] = await Promise.all([api.companies(), api.themes()]);
        // null = no API configured, so use the bundled sample data.
        const next: RailData = { companies: cos ?? mockCompanies, themes: ths ?? mockThemes, live: cos !== null };
        cache = next;
        if (!cancelled) { setData(next); setFailed(false); }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    load();
    mq.addEventListener("change", load);
    return () => { cancelled = true; mq.removeEventListener("change", load); };
  }, []);

  // Live heat is not calculated yet (see lib/heat.ts): without it the panel lists by events today.
  const showHeat = heatVisible(data?.live ?? true);
  const watched = (data?.companies ?? []).filter((c) => c.watched).sort(showHeat ? (a, b) => b.heat - a.heat : byActivity);
  const heatThemes = [...(data?.themes ?? [])].sort(showHeat ? (a, b) => b.heat - a.heat : byActivity).slice(0, 5);

  return (
    <aside className="hidden lg:block border-l border-line h-screen sticky top-0 overflow-y-auto pane px-[18px] py-5">
      <div className="text-[12px] tracking-[0.12em] text-muted uppercase mb-3">{showHeat ? <>Watchlist heat <Help term="heat" /></> : "Watchlist"}</div>

      {!data && !failed && <div className="text-[12px] text-muted py-2">Loading…</div>}
      {!data && failed && <div className="text-[12px] text-neg py-2">Intel API unavailable.</div>}
      {data && watched.length === 0 && <div className="text-[12px] text-muted py-2">No watched companies.</div>}

      {watched.map((c) => (
        <Link
          key={c.id}
          href={`/companies/${c.id}`}
          className="flex items-center justify-between py-[9px] border-b border-linesoft last:border-0 group"
        >
          <div>
            <div className="text-[13px] font-bold group-hover:text-mint">{c.ticker ?? c.name}</div>
            <div className="text-[12px] text-muted mt-0.5">
              {c.eventsToday ? `${c.eventsToday} event${c.eventsToday === 1 ? "" : "s"} today` : "no events today"}
            </div>
          </div>
          {showHeat && <div className={cn("text-[13px] font-bold tabular-nums", heatColor(c.heat))}>{c.heat}</div>}
        </Link>
      ))}

      {heatThemes.length > 0 && (
        <div className="mt-7">
          <div className="text-[12px] tracking-[0.12em] text-muted uppercase mb-3">{showHeat ? "Theme heat · 7 days" : "Themes · events today"}</div>
          {heatThemes.map((t) => showHeat ? (
            <Link key={t.id} href={`/themes/${t.id}`} className="grid grid-cols-[112px_1fr_26px] items-center gap-2 py-1.5 group">
              <span className="text-[12px] text-sub group-hover:text-ink truncate">{t.name}</span>
              <span className="h-1 bg-line rounded-sm overflow-hidden">
                <span className="block h-full bg-mint/85" style={{ width: `${t.heat}%` }} />
              </span>
              <span className="text-[12px] text-muted text-right tabular-nums">{t.heat}</span>
            </Link>
          ) : (
            <Link key={t.id} href={`/themes/${t.id}`} className="flex items-center justify-between gap-2 py-1.5 group">
              <span className="text-[12px] text-sub group-hover:text-ink truncate">{t.name}</span>
              <span className="text-[12px] text-muted tabular-nums">{t.eventsToday}</span>
            </Link>
          ))}
        </div>
      )}
    </aside>
  );
}
