/**
 * Single source of truth for provider colour identity.
 *
 * Provider colours are used ONLY in chart fills, strokes, and dots —
 * never on UI chrome (no coloured borders on rows, no coloured pill
 * backgrounds). Brand blue (#2563eb) owns interactive UI chrome; these
 * own data identity.
 *
 * `default` is the slate fallback for any provider not in the map.
 */
export const PROVIDER_COLORS: Record<string, string> = {
  digitalocean: "#f97316", // orange
  stripe_fees:  "#6366f1", // indigo
  stripe:       "#6366f1",
  openai:       "#10b981", // emerald
  azure:        "#3b82f6", // blue
  exoscale:     "#06b6d4", // cyan
  aws:          "#f59e0b", // amber
  anthropic:    "#8b5cf6", // purple
  gcp:          "#ef4444", // red
  cloudflare:   "#f97316",
  vercel:       "#71717a", // zinc
  mistral:      "#ff6b35",
  groq:         "#00d4aa",
  replicate:    "#6d28d9",
  // Other providers we ship — keep in this map so charts never fall
  // back to the slate default for shipping providers.
  netlify:      "#14b8a6",
  github:       "#6e7681",
  hetzner:      "#d50c2d",
  google_ads:   "#4285f4",
  meta_ads:     "#1877f2",
  resend:       "#71717a",
  gemini:       "#4285f4",
  cohere:       "#39594d",
  together:     "#0f6fff",
  huggingface:  "#ffd21e",
  elevenlabs:   "#a1a1aa",
  deepgram:     "#13ef93",
  supabase:     "#3ecf8e",
  railway:      "#a047e0",
  render:       "#46e3b7",
  flyio:        "#7b3fe4",
  mongodb_atlas:"#00684a",
  upstash:      "#00c389",
  algolia:      "#003dff",
  twilio:       "#f22f46",
  datadog:      "#632ca6",
  planetscale:  "#71717a",
  neon:         "#00e599",
  default:      "#52525b",
};

const FALLBACK_COLOR = PROVIDER_COLORS.default;

export function getProviderColor(name: string | null | undefined): string {
  if (!name) return FALLBACK_COLOR;
  return PROVIDER_COLORS[name] ?? FALLBACK_COLOR;
}

/**
 * Canonical display label for a provider key. Replaces user-entered
 * `display_name` in the UI: the connection should always be labeled by
 * its provider type, formatted nicely. Unknown providers fall back to
 * a capitalised version of the raw key.
 */
const PROVIDER_LABELS: Record<string, string> = {
  digitalocean: "DigitalOcean",
  openai: "OpenAI",
  stripe: "Stripe",
  stripe_fees: "Stripe Fees",
  azure: "Azure",
  exoscale: "Exoscale",
  aws: "AWS",
  gcp: "Google Cloud",
  anthropic: "Anthropic",
  cloudflare: "Cloudflare",
  vercel: "Vercel",
  mistral: "Mistral AI",
  groq: "Groq",
  replicate: "Replicate",
  github: "GitHub",
  hetzner: "Hetzner Cloud",
  netlify: "Netlify",
  resend: "Resend",
  gemini: "Gemini",
  cohere: "Cohere",
  together: "Together AI",
  huggingface: "Hugging Face",
  elevenlabs: "ElevenLabs",
  deepgram: "Deepgram",
  supabase: "Supabase",
  railway: "Railway",
  render: "Render",
  flyio: "Fly.io",
  mongodb_atlas: "MongoDB Atlas",
  upstash: "Upstash",
  algolia: "Algolia",
  twilio: "Twilio",
  datadog: "Datadog",
  planetscale: "PlanetScale",
  neon: "Neon",
  google_ads: "Google Ads",
  meta_ads: "Meta Ads",
};

export function formatProviderName(provider: string | null | undefined): string {
  if (!provider) return "—";
  if (PROVIDER_LABELS[provider]) return PROVIDER_LABELS[provider];
  // Default: capitalize words split on _ or -
  return provider
    .split(/[_-]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

export function withAlpha(hex: string, alpha: number): string {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
