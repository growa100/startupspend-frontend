"use client";

import { getProviderColor } from "@/lib/providerColors";

type ProviderRow = {
  provider: string;
  display_name: string;
  amount_usd: string;
};

type Props = {
  providers: ProviderRow[];
  active: string | null;
  onSelect: (provider: string | null) => void;
};

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Provider filter pills. Provider colours appear ONLY in the dot and as
 * the active-state border colour — never as backgrounds. The pill itself
 * uses the elevated card surface so the dot reads as data identity, not
 * UI chrome.
 */
export function ProviderPills({ providers, active, onSelect }: Props) {
  if (providers.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Provider filters">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className="ui-sans pill-enter inline-flex items-center gap-2 rounded-md transition-colors"
        style={{
          background: "var(--bg-elevated)",
          border: `1px solid ${active === null ? "var(--text-primary)" : "var(--border)"}`,
          padding: "6px 12px",
          color: active === null ? "var(--text-primary)" : "var(--text-secondary)",
          minHeight: 32,
          fontSize: 13,
          fontWeight: 500,
        }}
        aria-pressed={active === null}
      >
        All
      </button>
      {providers.map((p, i) => {
        const color = getProviderColor(p.provider);
        const amount = Number(p.amount_usd);
        const isActive = active === p.provider;
        return (
          <button
            key={p.provider}
            type="button"
            onClick={() => onSelect(isActive ? null : p.provider)}
            className="ui-sans pill-enter inline-flex items-center gap-2 rounded-md transition-colors"
            style={{
              background: "var(--bg-elevated)",
              border: `1px solid ${isActive ? color : "var(--border)"}`,
              padding: "6px 12px",
              minHeight: 32,
              animationDelay: `${i * 40}ms`,
            }}
            aria-pressed={isActive}
          >
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
              }}
            >
              {p.display_name}
            </span>
            <span
              className="mono"
              style={{
                fontSize: 13,
                color: "var(--text-primary)",
                fontWeight: 500,
              }}
            >
              {fmt.format(amount)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
