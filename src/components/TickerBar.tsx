"use client";

import { useEffect, useState } from "react";
import { apiGet, type MonthSummary } from "@/lib/api";
import { formatProviderName } from "@/lib/providerColors";

/**
 * 32px dark strip at the very top of every authenticated page.
 *
 * Left: marquee of "Provider $X" pairs from the current month's by_provider
 * breakdown. Loops by rendering the same content twice and animating
 * translateX(-50%).
 * Right: today's date.
 *
 * If no data: a single static line "Connect a provider to see your spend
 * ticker."
 */
export function TickerBar() {
  const [items, setItems] = useState<{ provider: string; amount: string }[] | null>(
    null,
  );

  useEffect(() => {
    apiGet<MonthSummary>("/costs/summary")
      .then((s) => {
        setItems(
          s.by_provider.map((p) => ({
            provider: formatProviderName(p.provider),
            amount: p.amount_usd,
          })),
        );
      })
      .catch(() => setItems([]));
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className="flex h-ticker items-center justify-between overflow-hidden bg-ink text-bone"
      style={{ height: "var(--ticker-height)" }}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex-1 overflow-hidden">
        {items === null ? (
          <TickerStatic text="Loading current month spend …" />
        ) : items.length === 0 ? (
          <TickerStatic text="Connect a provider to see your spend ticker." />
        ) : (
          <TickerMarquee items={items} />
        )}
      </div>
      <span className="hidden shrink-0 px-4 text-[11px] uppercase tracking-[0.12em] text-ink-muted sm:inline">
        {today}
      </span>
    </div>
  );
}

function TickerStatic({ text }: { text: string }) {
  return (
    <span className="block px-4 text-[11px] uppercase tracking-[0.12em] text-bone-deep">
      {text}
    </span>
  );
}

function TickerMarquee({
  items,
}: {
  items: { provider: string; amount: string }[];
}) {
  const sequence = items.map(
    (i) => `${i.provider} $${Number(i.amount).toFixed(0)}`,
  );
  // Render the sequence twice for the seamless loop.
  const doubled = [...sequence, ...sequence];
  return (
    <div className="ticker-track text-[11px] uppercase tracking-[0.12em]">
      {doubled.map((s, idx) => (
        <span
          key={idx}
          className="px-4 text-bone-deep"
          aria-hidden={idx >= sequence.length}
        >
          {s} <span className="text-ink-muted">·</span>
        </span>
      ))}
    </div>
  );
}
