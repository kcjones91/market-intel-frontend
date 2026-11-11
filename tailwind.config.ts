import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        rail: "#080808",
        card: "#121212",
        cardhi: "#171717",
        line: "#1f1f1f",
        linesoft: "#181818",
        ink: "#e8e8e8",
        sub: "#8a8a8a",
        muted: "#5f5f5f",
        faint: "#444444",
        mint: "#00ff88",
        pos: "#22c55e",
        neg: "#ff5000",
        amber: "#f59e0b",
        info: "#4a90ff",
        theme: "#a855f7",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "SF Mono", "Roboto Mono", "Menlo", "monospace"],
        sans: ["var(--font-sans)", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
