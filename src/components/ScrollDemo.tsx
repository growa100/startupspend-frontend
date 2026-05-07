"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Apple-style scroll-driven animation. The parent is 300vh tall; the
 * child sticks to the top of the viewport so different "scenes" play
 * out as the user scrolls through the parent. Progress is read directly
 * from the parent's bounding rect on every scroll event — no library.
 *
 * Scenes (mapped to scrollProgress 0..1):
 *   1. The problem      — sp 0.00 → 0.50 (fades out 0.40 → 0.55)
 *      Big counter $0 → $1,247, four provider rows appearing in
 *      sequence, subtext fades in at 0.30.
 *   2. The solution     — sp 0.30 → 1.00 (fades in 0.30 → 0.55)
 *      Mock dashboard card slides up; "One number. Every provider."
 *      headline above.
 *   3. The outcome      — sp 0.66 → 1.00
 *      Three annotations fade in around the card: spike, idle VM,
 *      under-budget total.
 */

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function fadeIn(sp: number, start: number, end: number): number {
  return clamp((sp - start) / (end - start), 0, 1);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const fmtMoney = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function ScrollDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sp, setSp] = useState(0);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const viewportH = window.innerHeight;
        const totalScroll = rect.height - viewportH;
        if (totalScroll <= 0) return;
        const scrolled = -rect.top;
        setSp(clamp(scrolled / totalScroll, 0, 1));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Scene 1 — The problem
  const scene1Opacity = 1 - fadeIn(sp, 0.4, 0.55);
  const counterValue = Math.round(lerp(0, 1247, fadeIn(sp, 0.0, 0.33)));
  const subtextOpacity = fadeIn(sp, 0.3, 0.36);
  const row1 = fadeIn(sp, 0.1, 0.13);
  const row2 = fadeIn(sp, 0.16, 0.19);
  const row3 = fadeIn(sp, 0.22, 0.25);
  const row4 = fadeIn(sp, 0.28, 0.31);

  // Scene 2 — The solution
  const cardOpacity = fadeIn(sp, 0.3, 0.55);
  const cardTranslate = lerp(80, 0, fadeIn(sp, 0.3, 0.55));
  const headlineOpacity = fadeIn(sp, 0.4, 0.55);
  const headlineFade = 1 - fadeIn(sp, 0.85, 1);

  // Scene 3 — Annotations
  const ann1 = fadeIn(sp, 0.66, 0.72);
  const ann2 = fadeIn(sp, 0.74, 0.8);
  const ann3 = fadeIn(sp, 0.82, 0.88);

  return (
    <section
      ref={containerRef}
      style={{
        position: "relative",
        background: "#000000",
        height: "300vh",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div
          className="mx-auto max-w-ft px-8"
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Scene 1 — fades out */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: scene1Opacity,
              pointerEvents: scene1Opacity < 0.05 ? "none" : "auto",
              transition: "opacity 80ms linear",
            }}
          >
            <p
              className="ui-sans"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#52525b",
              }}
            >
              The problem
            </p>
            <p
              className="mono"
              style={{
                marginTop: 16,
                fontSize: "clamp(56px, 9vw, 112px)",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1,
                letterSpacing: "-0.02em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {fmtMoney.format(counterValue)}
            </p>

            <div
              style={{
                marginTop: 32,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                width: "100%",
                maxWidth: 360,
              }}
            >
              <ProviderTeaser
                color="#f97316"
                label="DigitalOcean"
                amount="$38.02"
                opacity={row1}
              />
              <ProviderTeaser
                color="#6366f1"
                label="Stripe Fees"
                amount="$29.41"
                opacity={row2}
              />
              <ProviderTeaser
                color="#10b981"
                label="OpenAI"
                amount="$26.18"
                opacity={row3}
              />
              <ProviderTeaser
                color="#3b82f6"
                label="Azure"
                amount="$6.07"
                opacity={row4}
              />
            </div>

            <p
              className="ui-sans"
              style={{
                marginTop: 32,
                fontSize: 18,
                color: "#a1a1aa",
                opacity: subtextOpacity,
                textAlign: "center",
                maxWidth: 480,
              }}
            >
              Your cloud costs, scattered across 5 dashboards.
            </p>
          </div>

          {/* Scene 2 + 3 — solution + annotations */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: cardOpacity,
              pointerEvents: cardOpacity < 0.05 ? "none" : "auto",
            }}
          >
            <h2
              className="ui-sans"
              style={{
                fontSize: "clamp(28px, 4vw, 36px)",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.012em",
                textAlign: "center",
                opacity: headlineOpacity * headlineFade,
                marginBottom: 32,
              }}
            >
              One number.{" "}
              <span style={{ color: "#2563eb" }}>Every provider.</span>
            </h2>

            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 540,
                transform: `translateY(${cardTranslate}px)`,
                transition: "transform 80ms linear",
              }}
            >
              <MockDashboardCard activeAnnotation={{ ann1, ann2, ann3 }} />

              <Annotation
                opacity={ann1}
                style={{
                  position: "absolute",
                  top: -16,
                  right: -8,
                  textAlign: "right",
                }}
                arrowDirection="down-left"
              >
                Spike detected automatically
              </Annotation>
              <Annotation
                opacity={ann2}
                style={{
                  position: "absolute",
                  bottom: 56,
                  right: -180,
                  textAlign: "left",
                }}
                arrowDirection="left"
              >
                Idle VM found — saving $26/mo
              </Annotation>
              <Annotation
                opacity={ann3}
                style={{
                  position: "absolute",
                  top: 24,
                  left: -200,
                  textAlign: "right",
                }}
                arrowDirection="right"
              >
                15% under budget
              </Annotation>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProviderTeaser({
  color,
  label,
  amount,
  opacity,
}: {
  color: string;
  label: string;
  amount: string;
  opacity: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        opacity,
        transform: `translateY(${(1 - opacity) * 8}px)`,
        transition: "opacity 80ms linear, transform 80ms linear",
      }}
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
        className="ui-sans"
        style={{ fontSize: 14, color: "#a1a1aa", flexShrink: 0 }}
      >
        {label}
      </span>
      <span
        aria-hidden
        className="ui-sans"
        style={{
          flex: "1 1 0",
          minWidth: 0,
          overflow: "hidden",
          color: "#52525b",
          letterSpacing: "0.4em",
          whiteSpace: "nowrap",
          fontSize: 11,
          lineHeight: 1,
        }}
      >
        {".".repeat(80)}
      </span>
      <span
        className="mono"
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#ffffff",
          whiteSpace: "nowrap",
        }}
      >
        {amount}
      </span>
    </div>
  );
}

const MOCK_DAILY = [12, 18, 14, 22, 16, 26, 20, 32, 24, 28, 19, 38, 28, 33];

function MockDashboardCard({
  activeAnnotation,
}: {
  activeAnnotation: { ann1: number; ann2: number; ann3: number };
}) {
  const max = Math.max(...MOCK_DAILY);
  const total = "$1,247";
  return (
    <div
      style={{
        background: "#111111",
        border: "1px solid #262626",
        borderRadius: 8,
        padding: 24,
      }}
    >
      <div className="flex items-center justify-between" style={{ gap: 12 }}>
        <span
          className="ui-sans"
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#a1a1aa",
          }}
        >
          May 2026
        </span>
        <span
          className="ui-sans"
          style={{
            fontSize: 11,
            color: "#22c55e",
            opacity: activeAnnotation.ann3,
            transition: "opacity 80ms linear",
          }}
        >
          15% under budget
        </span>
      </div>

      <p
        className="mono"
        style={{
          marginTop: 12,
          fontSize: 56,
          fontWeight: 700,
          color: "#ffffff",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {total}
      </p>

      <div
        style={{
          marginTop: 20,
          display: "flex",
          gap: 4,
          alignItems: "flex-end",
          height: 80,
        }}
      >
        {MOCK_DAILY.map((v, i) => {
          // Highlight the spike day (day 11 — value 38)
          const isSpike = v === 38;
          const h = (v / max) * 100;
          const spikeOpacity = activeAnnotation.ann1;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h}%`,
                background: isSpike
                  ? `rgba(239,68,68,${0.3 + spikeOpacity * 0.7})`
                  : "#2563eb",
                borderRadius: 1,
                transition: "background 200ms linear",
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        <MockProviderRow
          color="#f97316"
          label="DigitalOcean"
          amount="$612.40"
        />
        <MockProviderRow
          color="#10b981"
          label="OpenAI"
          amount="$418.91"
        />
        <MockProviderRow
          color="#06b6d4"
          label="Exoscale"
          amount="$141.20"
          highlight={activeAnnotation.ann2}
        />
        <MockProviderRow
          color="#6366f1"
          label="Stripe Fees"
          amount="$74.49"
        />
      </div>
    </div>
  );
}

function MockProviderRow({
  color,
  label,
  amount,
  highlight = 0,
}: {
  color: string;
  label: string;
  amount: string;
  highlight?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 0",
        borderBottom: "1px solid #1a1a1a",
        background:
          highlight > 0 ? `rgba(255,255,255,${highlight * 0.04})` : "transparent",
        transition: "background 80ms linear",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
        }}
      />
      <span
        className="ui-sans"
        style={{ fontSize: 13, color: "#ffffff", flexShrink: 0 }}
      >
        {label}
      </span>
      <span
        aria-hidden
        className="ui-sans"
        style={{
          flex: "1 1 0",
          minWidth: 0,
          overflow: "hidden",
          color: "#52525b",
          letterSpacing: "0.4em",
          whiteSpace: "nowrap",
          fontSize: 11,
          lineHeight: 1,
        }}
      >
        {".".repeat(80)}
      </span>
      <span
        className="mono"
        style={{ fontSize: 13, color: "#ffffff", whiteSpace: "nowrap" }}
      >
        {amount}
      </span>
    </div>
  );
}

function Annotation({
  children,
  opacity,
  style,
  arrowDirection,
}: {
  children: React.ReactNode;
  opacity: number;
  style: React.CSSProperties;
  arrowDirection: "down-left" | "left" | "right";
}) {
  const arrows: Record<string, string> = {
    "down-left": "↘",
    left: "←",
    right: "→",
  };
  return (
    <div
      className="ui-sans"
      style={{
        ...style,
        opacity,
        transform: `translateY(${(1 - opacity) * 6}px)`,
        transition: "opacity 80ms linear, transform 80ms linear",
        fontSize: 13,
        color: "#a1a1aa",
        maxWidth: 200,
        lineHeight: 1.4,
        pointerEvents: "none",
      }}
    >
      <span
        aria-hidden
        className="mono"
        style={{
          color: "#2563eb",
          fontWeight: 700,
          marginRight: arrowDirection === "right" ? 6 : 0,
          marginLeft: arrowDirection === "left" ? 6 : 0,
        }}
      >
        {arrowDirection === "right" ? null : arrows[arrowDirection]}
      </span>
      {children}
      {arrowDirection === "right" && (
        <span
          aria-hidden
          className="mono"
          style={{
            color: "#2563eb",
            fontWeight: 700,
            marginLeft: 6,
          }}
        >
          {arrows[arrowDirection]}
        </span>
      )}
    </div>
  );
}
