"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type Item = { href: string; label: string; count?: number; alert?: boolean; soon?: boolean };

// Counts are optional. The old hardcoded sample counts (14, 6, 3, 3) were
// removed so the nav never shows numbers that do not come from live data.
const PRIMARY: Item[] = [
  { href: "/", label: "Dashboard" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/companies", label: "Companies" },
  { href: "/themes", label: "Themes" },
  { href: "/government", label: "Government" },
  { href: "/graph", label: "Graph" },
  { href: "/search", label: "Search" },
  { href: "/alerts", label: "Alerts" },
  { href: "/reports", label: "Reports", soon: true },
  { href: "/world", label: "World Events", soon: true },
];

export function Nav() {
  const path = usePathname();
  return (
    <nav className="bg-rail border-r border-line h-screen sticky top-0 overflow-y-auto pane py-4 select-none">
      <Link href="/" className="block px-4 pb-5">
        <div className="text-mint text-[15px] font-extrabold tracking-[0.12em]">◢ MARKET INTEL</div>
        <div className="text-muted text-[9px] tracking-[0.2em] mt-0.5">OSINT WORKSPACE</div>
      </Link>

      <div className="text-faint text-[9px] tracking-[0.15em] px-4 pb-1.5">VIEWS</div>
      {PRIMARY.map((it) => {
        const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex items-center justify-between px-4 py-[7px] text-[12.5px] border-l-2 border-transparent",
              active ? "text-mint border-mint bg-mint/[0.04]" : "text-sub hover:text-ink hover:bg-linesoft"
            )}
          >
            <span className="flex items-center gap-2">
              {it.label}
              {it.soon && <span className="text-[8px] text-faint tracking-wide">SOON</span>}
            </span>
            {it.count != null && (
              <span className={cn("text-[11px]", it.alert ? "text-neg" : active ? "text-mint" : "text-muted")}>
                {it.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
