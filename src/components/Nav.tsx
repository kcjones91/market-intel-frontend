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
    <nav className="bg-rail border-b md:border-b-0 md:border-r border-line sticky top-0 z-30 md:h-screen md:overflow-y-auto pane md:py-4 select-none">
      <Link href="/" className="block px-4 pt-3 pb-1.5 md:pt-0 md:pb-5">
        <div className="text-mint text-[15px] font-extrabold tracking-[0.12em]">◢ MARKET INTEL</div>
        <div className="hidden md:block text-muted text-[9px] tracking-[0.2em] mt-0.5">OSINT WORKSPACE</div>
      </Link>

      <div className="hidden md:block text-faint text-[9px] tracking-[0.15em] px-4 pb-1.5">VIEWS</div>
      <div className="flex md:block overflow-x-auto md:overflow-visible no-scrollbar px-1 md:px-0">
      {PRIMARY.map((it) => {
        const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex shrink-0 items-center justify-between whitespace-nowrap px-3 md:px-4 py-2 md:py-[7px] text-[12.5px] border-b-2 md:border-b-0 md:border-l-2 border-transparent",
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
      </div>
    </nav>
  );
}
