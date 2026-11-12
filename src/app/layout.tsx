import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";
import { apiEnabled } from "@/lib/api";

// Every view reads live data per request. Without this, a build made with no
// API configured would prerender the pages with mock data and keep serving
// those static pages in the cluster.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Munny Moves Intel",
  description: "Public-source intelligence for investment research. Not investment advice.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-mono antialiased bg-bg text-ink">
        {/* Sample data renders only when no API is configured. Say so on every page. */}
        {!apiEnabled && (
          <div role="status" className="bg-amber text-black text-[12px] font-bold tracking-[0.08em] text-center px-4 py-1.5">
            SAMPLE DATA · no live feed is connected, so nothing on this page is real
          </div>
        )}
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
