import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";

// Every view reads live data per request. Without this, a build made with no
// API configured would prerender the pages with mock data and keep serving
// those static pages in the cluster.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Market Intel — OSINT Workspace",
  description: "Public-source intelligence for investment research.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-mono antialiased bg-bg text-ink">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
