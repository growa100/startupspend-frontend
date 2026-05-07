import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  // Default is dark (via CSS vars). Light mode is opt-in via [data-theme="light"].
  darkMode: ["class", '[data-theme="light"]'],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-elevated": "var(--bg-elevated)",
        "bg-subtle": "var(--bg-subtle)",
        border: "var(--border)",
        "border-focus": "var(--border-focus)",

        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",

        brand: "var(--brand)",
        "brand-hover": "var(--brand-hover)",
        positive: "var(--positive)",
        warning: "var(--warning)",
        negative: "var(--negative)",

        // Legacy aliases — keep so existing class names still resolve.
        bone: "var(--bg)",
        "bone-dim": "var(--bg-subtle)",
        surface: "var(--bg-elevated)",
        ink: "var(--text-primary)",
        "ink-soft": "var(--text-secondary)",
        "ink-muted": "var(--text-muted)",
        rule: "var(--border)",
        accent: "var(--brand)",
        "dark-strip": "var(--dark-strip)",
        white: "#ffffff",
      },
      fontFamily: {
        display: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        serif: ["var(--font-source-serif)", "Georgia", "Times New Roman", "serif"],
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "var(--font-jetbrains-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      maxWidth: {
        ft: "1100px",
      },
      borderRadius: {
        none: "0",
        DEFAULT: "0",
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "8px",
      },
      fontSize: {
        hero: ["72px", { lineHeight: "1.0", letterSpacing: "-0.02em" }],
        display: ["32px", { lineHeight: "1.1", letterSpacing: "-0.012em" }],
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
    },
  },
  plugins: [],
};
export default config;
