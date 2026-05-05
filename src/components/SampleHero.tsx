"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { TOKENS } from "@/lib/tokens";
import { ProviderBadge } from "@/components/ProviderBadge";

const SAMPLE_DAILY = [
  35, 41, 28, 52, 38, 47, 33, 58, 44, 51, 39, 62, 48, 55,
];

/**
 * Hardcoded sample of the dashboard hero used on the landing page.
 * Mirrors <Hero /> in DashboardClient but with no state, no API, no
 * recharts ResponsiveContainer wrapper sized larger than necessary —
 * the marketing page can render it server-side.
 */
export function SampleHero() {
  const data = SAMPLE_DAILY.map((amount, i) => ({
    date: String(i + 1),
    amount,
    isToday: i === SAMPLE_DAILY.length - 1,
  }));

  return (
    <div className="border border-rule bg-white p-6">
      <p className="cat-label">Overview — sample</p>

      <div className="mt-3 flex items-baseline justify-between gap-4">
        <p
          className="font-display tabular text-ink"
          style={{
            fontSize: "44px",
            lineHeight: 1.05,
            letterSpacing: "-0.012em",
          }}
        >
          $1,247.31
        </p>
        <span
          className="ui-sans tabular text-[12px]"
          style={{ color: TOKENS.negative }}
        >
          +$203 (+10%)
        </span>
      </div>
      <p className="ui-sans mt-2 text-[13px] text-ink-muted">
        Projected $2,050 · medium confidence
      </p>

      <div className="mt-5 h-[100px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            barCategoryGap="20%"
            margin={{ top: 4, right: 0, left: -28, bottom: 0 }}
          >
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: TOKENS.inkMuted }}
              stroke={TOKENS.rule}
              tickLine={false}
              axisLine={{ stroke: TOKENS.rule }}
              interval="preserveStartEnd"
            />
            <YAxis hide />
            <Bar dataKey="amount" isAnimationActive={false}>
              {data.map((d) => (
                <Cell
                  key={d.date}
                  fill={TOKENS.accent}
                  fillOpacity={d.isToday ? 1 : 0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="ui-sans mt-5 flex flex-col gap-3 text-[13px]">
        <SampleProviderRow provider="digitalocean" name="DigitalOcean" amount="$612.40" />
        <SampleProviderRow provider="openai" name="OpenAI" amount="$418.91" />
      </div>
    </div>
  );
}

function SampleProviderRow({
  provider,
  name,
  amount,
}: {
  provider: string;
  name: string;
  amount: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2">
        <ProviderBadge provider={provider} size="sm" />
        <span className="text-ink">{name}</span>
      </span>
      <span className="tabular text-ink">{amount}</span>
    </div>
  );
}
