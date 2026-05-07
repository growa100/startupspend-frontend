"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  /** Total animation length in ms. */
  durationMs?: number;
  /** Decimals to show — money is 2. */
  decimals?: number;
  /** Currency prefix; default "$". Pass "" to omit. */
  prefix?: string;
};

const fmt = (n: number, decimals: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

/**
 * Numeric ease-out countup used for the dashboard hero.
 *
 * Animates ONLY when the target value first becomes non-zero (the
 * dashboard mounts with placeholder zero, then fills with real data).
 * Subsequent value changes (e.g. month picker future-feature) jump
 * directly so we don't replay a 600ms animation every interaction.
 */
export function CountUp({
  value,
  durationMs = 600,
  decimals = 2,
  prefix = "$",
}: Props) {
  const [display, setDisplay] = useState<number>(value === 0 ? 0 : 0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }
    if (hasAnimated.current) {
      setDisplay(value);
      return;
    }
    hasAnimated.current = true;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return (
    <span aria-live="polite">
      {prefix}
      {fmt(display, decimals)}
    </span>
  );
}
