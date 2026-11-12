"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type Item = { href: string; label: string; also?: string[] };

// Only views that work are listed. Reports and World Events still exist as
// routes but stay out of the nav until they do something.
const PRIMARY: Item[] = [
  { href: "/", label: "Dashboard", also: ["/event"] },   // event pages are reached from the dashboard
  { href: "/watchlist", label: "Watchlist" },
  { href: "/companies", label: "Companies" },
  { href: "/themes", label: "Themes" },
  { href: "/government", label: "Government" },
  { href: "/graph", label: "Graph" },
  { href: "/search", label: "Search" },
  { href: "/alerts", label: "Alerts" },
];

// Matches a whole path segment, so "/themes" matches "/themes/x" but not "/themes-foo".
const under = (path: string, base: string) => path === base || path.startsWith(base + "/");

export function isActive(path: string, it: Item) {
  if (it.href === "/") return path === "/" || (it.also ?? []).some((p) => under(path, p));
  return under(path, it.href);
}

export function Nav() {
  const path = usePathname();
  const row = useRef<HTMLDivElement>(null);

  // On phones the views are a sideways-scrolling row. Keep the active one in
  // view. Scroll the row itself rather than calling scrollIntoView, which
  // would also move the page.
  useEffect(() => {
    const el = row.current;
    const active = el?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!el || !active || el.scrollWidth <= el.clientWidth) return;
    // Measure against the row itself so this stays right if the nav's own layout changes.
    const a = active.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const target = el.scrollLeft + (a.left - r.left) - (el.clientWidth - a.width) / 2;
    el.scrollLeft = Math.max(0, Math.min(target, el.scrollWidth - el.clientWidth));
  }, [path]);

  return (
    <nav className="bg-rail border-b md:border-b-0 md:border-r border-line sticky top-0 z-30 md:h-screen md:overflow-y-auto pane md:py-4 select-none">
      <Link href="/" className="block px-4 pt-3 pb-1.5 md:pt-0 md:pb-5">
        <div className="text-mint text-[15px] md:text-[13px] font-extrabold tracking-[0.1em] md:tracking-[0.08em] whitespace-nowrap">◢ MUNNY MOVES INTEL</div>
        <div className="hidden md:block text-muted text-[12px] tracking-[0.12em] mt-1">OSINT WORKSPACE</div>
      </Link>

      <div className="hidden md:block text-muted text-[12px] tracking-[0.12em] px-4 pb-1.5">VIEWS</div>
      <div ref={row} className="nav-row flex md:block overflow-x-auto md:overflow-visible no-scrollbar pl-1 pr-8 md:px-0">
        {PRIMARY.map((it) => {
          const active = isActive(path, it);
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center whitespace-nowrap px-3 md:px-4 min-h-[44px] md:min-h-[36px] text-[13px] border-b-2 md:border-b-0 md:border-l-2 border-transparent",
                active ? "text-mint border-mint bg-mint/[0.04]" : "text-sub hover:text-ink hover:bg-linesoft"
              )}
            >
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
