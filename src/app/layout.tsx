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
        <Shell>{children}</Shell>
        {/* Sample data renders only when no API is configured. Mark every page, at every scroll position. */}
        {!apiEnabled && (
          <div role="status" className="fixed bottom-3 right-3 z-50 bg-ink text-black text-[12px] font-bold tracking-[0.08em] rounded px-2.5 py-1.5 shadow-lg pointer-events-none">
            SAMPLE DATA · NOT LIVE
          </div>
        )}
      </body>
    </html>
  );
}
