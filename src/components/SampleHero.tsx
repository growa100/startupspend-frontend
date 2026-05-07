"use client";

import { Bar, BarChart, ResponsiveContainer } from "recharts";
import { getProviderColor } from "@/lib/providerColors";

const SAMPLE_DAILY = [
  35, 41, 28, 52, 38, 47, 33, 58, 44, 51, 39, 62, 48, 55,
];

/**
 * Marketing-page mock of the dashboard hero. No state, no API. Mirrors
 * the dark TradeLogs aesthetic the live dashboard uses.
 */
export function SampleHero() {
  const data = SAMPLE_DAILY.map((amount, i) => ({
    date: String(i + 1),
    amount,
  }));

  return (
    <div
      style={{
        background: "#111111",
        border: "1px solid #262626",
        borderRadius: 8,
        padding: 20,
      }}
    >
      <p
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
      </p>

      <p
        className="mono"
        style={{
          marginTop: 8,
          fontSize: 48,
          fontWeight: 700,
          color: "#ffffff",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        $1,247.31
      </p>

      <div className="mt-3 flex items-center" style={{ gap: 12 }}>
        <span
          className="ui-sans inline-flex items-center"
          style={{
            padding: "3px 8px",
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 500,
            color: "#ef4444",
            background: "rgba(239,68,68,0.1)",
          }}
        >
          up{" "}
          <span className="mono" style={{ marginLeft: 4 }}>
            $203
          </span>
          <span style={{ marginLeft: 4 }}>(+10%)</span>
        </span>
      </div>

      <p
        className="ui-sans mt-3"
        style={{ fontSize: 13, color: "#52525b" }}
      >
        Projected{" "}
        <span className="mono" style={{ color: "#a1a1aa" }}>
          $2,050
        </span>{" "}
        · medium confidence
      </p>

      <div className="mt-5 h-[80px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barCategoryGap="20%"
            margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
          >
            <Bar dataKey="amount" fill="#2563eb" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 flex flex-col" style={{ gap: 0 }}>
        <SampleRow
          provider="digitalocean"
          name="DigitalOcean"
          amount="$612.40"
        />
        <SampleRow provider="openai" name="OpenAI" amount="$418.91" />
      </div>
    </div>
  );
}

function SampleRow({
  provider,
  name,
  amount,
}: {
  provider: string;
  name: string;
  amount: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid #1a1a1a",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: getProviderColor(provider),
        }}
      />
      <span
        className="ui-sans"
        style={{ color: "#ffffff", fontSize: 13, flexShrink: 0 }}
      >
        {name}
      </span>
      <span
        aria-hidden
        className="ui-sans"
        style={{
          flex: 1,
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
        style={{ color: "#ffffff", fontSize: 13 }}
      >
        {amount}
      </span>
    </div>
  );
}
