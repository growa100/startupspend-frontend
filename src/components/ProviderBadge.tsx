/**
 * Square initials badge per provider, color-coded.
 *
 * No external logo files — we render a single-letter (or two-letter) badge
 * in the provider's brand color. Sized variants: sm (24px), md (32px),
 * lg (48px).
 */

const COLORS: Record<string, { bg: string; fg: string; initials: string }> = {
  digitalocean: { bg: "#0080FF", fg: "#FFFFFF", initials: "DO" },
  azure: { bg: "#0089D6", fg: "#FFFFFF", initials: "Az" },
  exoscale: { bg: "#DA291C", fg: "#FFFFFF", initials: "Ex" },
  openai: { bg: "#10A37F", fg: "#FFFFFF", initials: "AI" },
  anthropic: { bg: "#7C3AED", fg: "#FFFFFF", initials: "An" },
  aws: { bg: "#FF9900", fg: "#0A0A0A", initials: "AW" },
  gcp: { bg: "#1A73E8", fg: "#FFFFFF", initials: "GC" },
  hetzner: { bg: "#D50C2D", fg: "#FFFFFF", initials: "He" },
  vercel: { bg: "#0A0A0A", fg: "#FFFFFF", initials: "Vc" },
  netlify: { bg: "#00C7B7", fg: "#0A0A0A", initials: "Nl" },
  github: { bg: "#0A0A0A", fg: "#FFFFFF", initials: "Gh" },
  stripe: { bg: "#635BFF", fg: "#FFFFFF", initials: "St" },
  google_ads: { bg: "#1A73E8", fg: "#FFFFFF", initials: "GA" },
  meta_ads: { bg: "#1877F2", fg: "#FFFFFF", initials: "Me" },
};

const SIZE_CLS: Record<string, string> = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-12 w-12 text-base",
};

export function ProviderBadge({
  provider,
  size = "md",
  className = "",
}: {
  provider: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const conf = COLORS[provider] ?? {
    bg: "#3A3A3A",
    fg: "#F6F4EE",
    initials: provider.slice(0, 2).toUpperCase(),
  };
  return (
    <span
      aria-hidden
      className={`inline-flex items-center justify-center font-medium tabular ${SIZE_CLS[size]} ${className}`}
      style={{
        background: conf.bg,
        color: conf.fg,
        letterSpacing: "0.02em",
      }}
    >
      {conf.initials}
    </span>
  );
}

export const PROVIDER_BADGE_KEYS = Object.keys(COLORS);
