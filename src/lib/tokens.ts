/**
 * Design tokens mirrored as constants — for places that need a color
 * string (chart libraries, inline styles for dynamic dot colors, etc.)
 * instead of a Tailwind class.
 *
 * Keep in sync with globals.css :root and tailwind.config.ts.
 *
 * Source of truth: ft.com inspection.
 */

export const TOKENS = {
  bone: "#FFF1E5",
  ink: "#33302E",
  inkSoft: "#4A4642",
  inkMuted: "#66605A",
  rule: "#E9E1D9",
  accent: "#990F3D",
  accentHover: "#7E0C32",
  darkStrip: "#1A1817",
  white: "#FFFFFF",
  negative: "#B3231C",
  positive: "#178C3D",
  amber: "#B8860B",
} as const;

export type TokenName = keyof typeof TOKENS;
