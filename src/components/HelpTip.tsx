"use client";

import { useState } from "react";

/**
 * Small "?" icon that reveals a tooltip on hover or click.
 *
 * Style follows the FT aesthetic:
 *   - small, clean
 *   - bone background, ink text
 *   - no rounded corners (square edges)
 *   - 150ms hover delay so it doesn't flicker on cursor sweep
 */
export function HelpTip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  const [pinned, setPinned] = useState(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  function show() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => setVisible(true), 150);
  }
  function hide() {
    if (timer) clearTimeout(timer);
    if (!pinned) setVisible(false);
  }

  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-label="Help"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={() => {
          setPinned((p) => !p);
          setVisible((v) => !v || !pinned);
        }}
        className="inline-flex h-4 w-4 items-center justify-center border border-rule text-[10px] font-medium leading-none text-ink-muted hover:border-ink hover:text-ink"
      >
        ?
      </button>
      {visible && (
        <span
          role="tooltip"
          // whitespace-pre-line lets `\n` in the help text render as line
          // breaks (used for multi-step instructions like the Azure CLI
          // commands) while still wrapping long single-line copy.
          // break-words prevents a runaway URL or shell command from
          // overflowing the tooltip.
          className="absolute left-5 top-0 z-20 w-72 whitespace-pre-line break-words border border-rule bg-bone p-3 text-[12px] leading-snug text-ink shadow-none"
        >
          {text}
        </span>
      )}
    </span>
  );
}
