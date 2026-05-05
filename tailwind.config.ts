import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // FT-exact palette. Tokens mirror :root in globals.css.
        bone: "#FFF1E5",
        // bone-dim aliases the warm gray rule colour — FT uses it for
        // hover surfaces. Kept as the same hex so utilities like
        // `hover:bg-bone-dim` already-deployed across the app keep working
        // without a sweep.
        "bone-dim": "#E9E1D9",
        ink: "#33302E",
        "ink-soft": "#4A4642",
        "ink-muted": "#66605A",
        rule: "#E9E1D9",
        accent: "#990F3D",
        "dark-strip": "#1A1817",
        white: "#FFFFFF",
        negative: "#B3231C",
        positive: "#178C3D",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "Times New Roman", "serif"],
        serif: ["var(--font-source-serif)", "Georgia", "Times New Roman", "serif"],
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
      },
      maxWidth: {
        ft: "1220px",
      },
      borderRadius: {
        none: "0",
        DEFAULT: "0",
        sm: "2px",
        md: "2px",
        lg: "2px",
      },
      fontSize: {
        // Backwards-compat aliases for the previous palette. Will be removed
        // once every page-level rewrite drops the old utilities.
        hero: ["64px", { lineHeight: "1.05", letterSpacing: "-0.012em" }],
        display: ["44px", { lineHeight: "1.1", letterSpacing: "-0.012em" }],
      },
    },
  },
  plugins: [],
};
export default config;
