import { TOKENS } from "@/lib/tokens";

const COLORS: Record<string, string> = {
  ok: TOKENS.positive,
  success: TOKENS.positive,
  green: TOKENS.positive,
  error: TOKENS.negative,
  red: TOKENS.negative,
  fail: TOKENS.negative,
  failure: TOKENS.negative,
  warning: TOKENS.amber,
  amber: TOKENS.amber,
  warn: TOKENS.amber,
  never: TOKENS.inkMuted,
  gray: TOKENS.inkMuted,
  paused: TOKENS.inkMuted,
};

/**
 * 8px colored dot. Accepts a status string and maps it to one of:
 *   ok / success / green     → --positive
 *   error / red / fail       → --negative
 *   warning / amber          → amber
 *   never / gray / paused    → --ink-muted
 */
export function StatusDot({
  status,
  label,
  size = 8,
}: {
  status: string;
  label?: string;
  size?: number;
}) {
  const color = COLORS[status.toLowerCase()] ?? TOKENS.inkMuted;
  return (
    <span
      className="inline-block rounded-full"
      style={{ width: size, height: size, background: color }}
      title={label ?? status}
      aria-label={label ?? status}
    />
  );
}
