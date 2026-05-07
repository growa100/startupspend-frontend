/**
 * Design tokens — TS mirror of CSS vars in globals.css.
 *
 * Use these when a hex string is required (recharts inline props,
 * dynamic dot colors). Otherwise prefer the CSS var via inline style.
 *
 * The token values are the dark-mode hex values. CSS vars handle the
 * light-mode swap at runtime — recharts charts that need the swap
 * should read `getComputedStyle(document.documentElement)` at use time.
 */

export const TOKENS = {
  bg:           "#0a0a0a",
  bgElevated:   "#111111",
  bgSubtle:     "#1a1a1a",
  border:       "#262626",
  borderFocus:  "#404040",
  grid:         "#1f1f1f",

  textPrimary:   "#ffffff",
  textSecondary: "#a1a1aa",
  textMuted:     "#52525b",

  brand:        "#2563eb",
  brandHover:   "#1d4ed8",
  positive:     "#22c55e",
  warning:      "#f59e0b",
  negative:     "#ef4444",

  positiveBg:   "#0a1a0a",
  negativeBg:   "#1a0a0a",
  warningBg:    "#1a1408",

  white:        "#ffffff",

  // === Legacy aliases — kept so existing imports still work ===
  bone:          "#0a0a0a",      // page bg, mapped to dark
  bgDark:        "#0a0a0a",
  surface:       "#111111",
  surfaceDark:   "#111111",
  ink:           "#ffffff",
  inkSoft:       "#a1a1aa",
  inkMuted:      "#52525b",
  inkInverted:   "#0a0a0a",
  rule:          "#262626",
  ruleDark:      "#262626",
  accent:        "#2563eb",
  accentHover:   "#1d4ed8",
  amber:         "#f59e0b",
  darkStrip:     "#000000",
} as const;

export type TokenName = keyof typeof TOKENS;

export {
  PROVIDER_COLORS,
  getProviderColor,
  getProviderColor as providerColor,
  withAlpha,
} from "./providerColors";
