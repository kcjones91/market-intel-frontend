import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/Shell";

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
