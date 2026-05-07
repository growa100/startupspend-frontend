"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  apiDownload,
  apiGet,
  type ApiError,
  type History,
  type HistoryPeriod,
} from "@/lib/api";
import { SkeletonLine } from "@/components/Skeleton";
import { formatProviderName, getProviderColor } from "@/lib/providerColors";

type Period = "week" | "month" | "quarter" | "year";

type FetchState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; message: string };

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
  { value: "year", label: "Year" },
];

const CATEGORY_LABELS: Record<string, string> = {
  compute: "Compute",
  storage: "Storage",
  network: "Network",
  ai_api: "AI APIs",
  database: "Database",
  subscription: "Subscriptions",
  ads_spend: "Ads",
  other: "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  compute: "#f97316",
  ai_api: "#10b981",
  storage: "#3b82f6",
  database: "#8b5cf6",
  network: "#06b6d4",
  subscription: "#2563eb",
  ads_spend: "#f59e0b",
  other: "#52525b",
};

const fmtMoney = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const fmtCompactMoney = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

function n(s: string | undefined | null): number {
  if (!s) return 0;
  const v = Number(s);
  return Number.isFinite(v) ? v : 0;
}

export function HistoryClient() {
  const [period, setPeriod] = useState<Period>("month");
  const [state, setState] = useState<FetchState<History>>({ status: "loading" });
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const monthsBack = period === "week" ? 3 : period === "year" ? 24 : 6;

  useEffect(() => {
    setState({ status: "loading" });
    setSelectedLabel(null);
    apiGet<History>(
      `/costs/history?period=${period}&months_back=${monthsBack}`,
    )
      .then((data) => setState({ status: "ready", data }))
      .catch((e) =>
        setState({ status: "error", message: (e as ApiError).detail }),
      );
  }, [period, monthsBack]);

  if (state.status === "loading") {
    return (
      <article className="flex flex-col gap-4 pb-32 pt-8">
        <Header period={period} onPeriod={setPeriod} disabled />
        <HistoryLoading />
      </article>
    );
  }
  if (state.status === "error") {
    return (
      <article className="flex flex-col gap-4 pb-32 pt-8">
        <Header period={period} onPeriod={setPeriod} />
        <p
          className="ui-sans pl-4"
          style={{
            borderLeft: "2px solid var(--negative)",
            color: "var(--negative)",
            fontSize: 14,
          }}
        >
          {state.message}
        </p>
      </article>
    );
  }

  const h = state.data;
  const allEmpty = h.periods.every((p) => n(p.total_usd) === 0);

  if (allEmpty && !h.has_connections) {
    return (
      <article className="flex flex-col gap-4 pb-32 pt-8">
        <Header period={period} onPeriod={setPeriod} />
        <HistoryEmpty />
      </article>
    );
  }

  const completes = h.periods.filter((p) => !p.is_current);
  const fallback =
    completes.length > 0
      ? completes[completes.length - 1]
      : h.periods[h.periods.length - 1];
  const selected =
    h.periods.find((p) => p.label === selectedLabel) ?? fallback ?? null;

  return (
    <article className="flex flex-col gap-4 pb-32 pt-8">
      <Header period={period} onPeriod={setPeriod} />

      <StackedAreaCard history={h} />

      <PeriodStrip
        history={h}
        selectedLabel={selected?.label ?? null}
        onSelect={(label) => setSelectedLabel(label)}
      />

      {selected && (
        <PeriodDetail period={selected} previous={previousOf(h, selected)} />
      )}

      <StatsRow history={h} />

      <Insights history={h} />
    </article>
  );
}

function previousOf(h: History, period: HistoryPeriod): HistoryPeriod | null {
  const idx = h.periods.findIndex((p) => p.label === period.label);
  if (idx > 0) return h.periods[idx - 1];
  return null;
}

/* =================================================================
 * HEADER
 * ================================================================= */

function Header({
  period,
  onPeriod,
  disabled = false,
}: {
  period: Period;
  onPeriod: (p: Period) => void;
  disabled?: boolean;
}) {
  return (
    <header>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="cat-label">Spending history</p>
          <h1 className="page-title mt-2">Spend over time</h1>
        </div>
        <ExportButton />
      </div>
      <div className="ui-sans mt-5 inline-flex items-center" style={{ gap: 4 }}>
        {PERIOD_OPTIONS.map((opt) => {
          const active = period === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => onPeriod(opt.value)}
              className="transition-colors"
              style={{
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 500,
                border: "none",
                borderRadius: 4,
                color: active ? "var(--text-primary)" : "var(--text-muted)",
                background: active ? "var(--bg-subtle)" : "transparent",
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}

function ExportButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setError(null);
    try {
      const blob = await apiDownload("/costs/export.xlsx?months=12");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "startupspend-history-12mo.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError((e as ApiError).detail || "Export failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ui-sans flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={go}
        disabled={busy}
        className="btn-secondary"
      >
        {busy ? "Preparing…" : "Export 12 months"}
      </button>
      {error && (
        <span style={{ color: "var(--negative)", fontSize: 12 }}>
          {error}
        </span>
      )}
    </div>
  );
}

/* =================================================================
 * STACKED AREA — the hero of /history.
 * ================================================================= */

function StackedAreaCard({ history: h }: { history: History }) {
  const providers = useMemo(() => collectProviders(h), [h]);
  const data = useMemo(() => {
    return h.periods.map((p) => {
      const row: Record<string, unknown> = { label: p.label };
      for (const prov of providers) {
        const m = p.by_provider.find((x) => x.provider === prov.provider);
        row[prov.provider] = m ? n(m.amount_usd) : 0;
      }
      row.total = n(p.total_usd);
      return row;
    });
  }, [h.periods, providers]);

  const [activeArea, setActiveArea] = useState<string | null>(null);

  const range = formatRange(h.periods);

  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="cat-label">By provider</p>
        <span
          className="ui-sans mono"
          style={{ fontSize: 12, color: "var(--text-muted)" }}
        >
          {range}
        </span>
      </div>

      {providers.length === 0 ? (
        <div
          className="mt-5 flex h-[400px] items-center justify-center"
          style={{ border: "1px solid var(--border)", borderRadius: 6 }}
        >
          <p
            className="ui-sans"
            style={{ color: "var(--text-muted)", fontSize: 13 }}
          >
            No provider data yet.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
              >
                <defs>
                  {providers.map((p) => {
                    const color = getProviderColor(p.provider);
                    return (
                      <linearGradient
                        key={p.provider}
                        id={`grad-${p.provider}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor={color} stopOpacity={0.7} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    );
                  })}
                </defs>
                <CartesianGrid
                  stroke="#1a1a1a"
                  strokeDasharray="4 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{
                    fontSize: 11,
                    fill: "#52525b",
                    fontFamily: "var(--font-jetbrains-mono)",
                  }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tick={{
                    fontSize: 11,
                    fill: "#52525b",
                    fontFamily: "var(--font-jetbrains-mono)",
                  }}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(v) =>
                    v === 0 ? "$0" : fmtCompactMoney.format(v as number)
                  }
                />
                <Tooltip
                  cursor={{ stroke: "#404040", strokeWidth: 1 }}
                  content={
                    <AreaTooltip
                      providers={providers}
                      previousByLabel={previousByLabel(h.periods)}
                      activeAreaProvider={activeArea}
                    />
                  }
                />
                {providers.map((p) => {
                  const color = getProviderColor(p.provider);
                  const dim = activeArea !== null && activeArea !== p.provider;
                  return (
                    <Area
                      key={p.provider}
                      yAxisId="left"
                      type="monotone"
                      dataKey={p.provider}
                      stackId="history"
                      stroke={color}
                      strokeWidth={2.5}
                      fill={`url(#grad-${p.provider})`}
                      fillOpacity={dim ? 0.2 : 1}
                      strokeOpacity={dim ? 0.2 : 1}
                      dot={false}
                      activeDot={{ r: 5, fill: color, strokeWidth: 0 }}
                      animationDuration={1000}
                      animationEasing="ease-out"
                      onMouseEnter={() => setActiveArea(p.provider)}
                      onMouseLeave={() => setActiveArea(null)}
                      style={{
                        transition:
                          "fill-opacity 150ms ease, stroke-opacity 150ms ease",
                      }}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
            {providers.map((p) => {
              const isActive = activeArea === p.provider;
              return (
                <button
                  key={p.provider}
                  type="button"
                  onMouseEnter={() => setActiveArea(p.provider)}
                  onMouseLeave={() => setActiveArea(null)}
                  className="ui-sans flex items-center"
                  style={{
                    fontSize: 12,
                    gap: 6,
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "default",
                    transition: "color 120ms ease",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 8,
                      height: 8,
                      background: getProviderColor(p.provider),
                      borderRadius: "50%",
                    }}
                  />
                  <span
                    style={{
                      color: isActive
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                      fontWeight: isActive ? 600 : 400,
                      transition: "color 120ms ease, font-weight 120ms ease",
                    }}
                  >
                    {formatProviderName(p.provider)}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}

function collectProviders(h: History): { provider: string }[] {
  const seen = new Set<string>();
  const totals: Record<string, number> = {};
  for (const p of h.periods) {
    for (const prov of p.by_provider) {
      seen.add(prov.provider);
      totals[prov.provider] = (totals[prov.provider] ?? 0) + n(prov.amount_usd);
    }
  }
  return Array.from(seen)
    .sort((a, b) => (totals[b] ?? 0) - (totals[a] ?? 0))
    .map((p) => ({ provider: p }));
}

function previousByLabel(periods: HistoryPeriod[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (let i = 1; i < periods.length; i++) {
    out[periods[i].label] = n(periods[i - 1].total_usd);
  }
  return out;
}

function formatRange(periods: HistoryPeriod[]): string {
  if (periods.length === 0) return "";
  const first = periods[0].label;
  const last = periods[periods.length - 1].label;
  return first === last ? first : `${first} — ${last}`;
}

function AreaTooltip({
  active,
  payload,
  label,
  providers,
  previousByLabel,
  activeAreaProvider,
}: {
  active?: boolean;
  payload?: { payload: Record<string, unknown> }[];
  label?: string;
  providers: { provider: string }[];
  previousByLabel: Record<string, number>;
  activeAreaProvider?: string | null;
}) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;
  const total = providers.reduce(
    (s, p) =>
      s + (typeof row[p.provider] === "number" ? (row[p.provider] as number) : 0),
    0,
  );
  const items = providers
    .map((p) => ({
      provider: p.provider,
      amount:
        typeof row[p.provider] === "number" ? (row[p.provider] as number) : 0,
    }))
    .filter((x) => x.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const prev = previousByLabel[label ?? ""];
  let deltaText: string | null = null;
  let deltaColor = "#a1a1aa";
  if (prev != null && prev > 0) {
    const delta = total - prev;
    const pct = (delta / prev) * 100;
    if (delta > 0) deltaColor = "#ef4444";
    else if (delta < 0) deltaColor = "#22c55e";
    deltaText = `vs prev: ${delta >= 0 ? "+" : ""}${fmtMoney.format(delta)} (${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%)`;
  }

  return (
    <div
      style={{
        background: "#000000",
        border: "1px solid #333333",
        borderRadius: 6,
        boxShadow: "0 4px 24px rgba(0,0,0,0.8)",
        padding: "10px 14px",
        minWidth: 180,
        pointerEvents: "none",
      }}
    >
      <p
        className="ui-sans"
        style={{ fontSize: 11, color: "#52525b" }}
      >
        {label}
      </p>
      <div
        className="flex items-center justify-between"
        style={{ marginTop: 4, gap: 8 }}
      >
        <span
          className="ui-sans"
          style={{ fontSize: 12, color: "#a1a1aa" }}
        >
          Total
        </span>
        <span
          className="mono"
          style={{ fontSize: 18, fontWeight: 700, color: "#ffffff" }}
        >
          {fmtMoney.format(total)}
        </span>
      </div>
      {items.length > 0 && (
        <>
          <div
            style={{
              height: 1,
              background: "#1f1f1f",
              margin: "6px 0",
            }}
          />
          <ul style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {items.map((p) => {
              const isActive = activeAreaProvider === p.provider;
              const dotSize = isActive ? 10 : 6;
              const color = getProviderColor(p.provider);
              return (
                <li
                  key={p.provider}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: 22,
                    gap: 8,
                    padding: isActive ? "2px 4px" : 0,
                    margin: isActive ? "0 -4px" : 0,
                    borderRadius: 4,
                    background: isActive
                      ? "rgba(255,255,255,0.04)"
                      : "transparent",
                    transition:
                      "background 120ms ease, padding 120ms ease",
                  }}
                >
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: dotSize,
                        height: dotSize,
                        borderRadius: "50%",
                        background: color,
                        flexShrink: 0,
                        transition:
                          "width 120ms ease, height 120ms ease",
                      }}
                    />
                    <span
                      className="ui-sans"
                      style={{
                        fontSize: 12,
                        fontWeight: isActive ? 700 : 400,
                        color: isActive ? "#ffffff" : "#a1a1aa",
                        transition: "color 120ms ease",
                      }}
                    >
                      {formatProviderName(p.provider)}
                    </span>
                  </span>
                  <span
                    className="mono"
                    style={{
                      fontSize: 12,
                      color,
                      fontWeight: isActive ? 700 : 600,
                    }}
                  >
                    {fmtMoney.format(p.amount)}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
      {deltaText && (
        <p
          className="ui-sans"
          style={{ fontSize: 11, color: deltaColor, marginTop: 6 }}
        >
          {deltaText}
        </p>
      )}
    </div>
  );
}

/* =================================================================
 * PERIOD STRIP
 * ================================================================= */

function PeriodStrip({
  history: h,
  selectedLabel,
  onSelect,
}: {
  history: History;
  selectedLabel: string | null;
  onSelect: (label: string) => void;
}) {
  return (
    <div
      className="no-scrollbar flex overflow-x-auto"
      style={{ gap: 8, padding: "4px 0" }}
    >
      {h.periods.map((p) => {
        const isActive = p.label === selectedLabel;
        const total = n(p.total_usd);
        const pct = p.vs_previous_pct;
        let deltaColor = "var(--text-muted)";
        let deltaText: string | null = null;
        if (pct !== null && pct !== undefined) {
          const abs = Math.abs(pct).toFixed(0);
          if (pct > 0) {
            deltaColor = "#ef4444";
            deltaText = `up ${abs}%`;
          } else if (pct < 0) {
            deltaColor = "#22c55e";
            deltaText = `down ${abs}%`;
          } else {
            deltaText = `flat`;
          }
        }
        return (
          <button
            key={p.label}
            type="button"
            onClick={() => onSelect(p.label)}
            className="text-left transition-colors"
            style={{
              padding: "12px 16px",
              borderRadius: 6,
              border: "1px solid",
              borderColor: isActive ? "#2563eb" : "#262626",
              background: isActive
                ? "rgba(37, 99, 235, 0.06)"
                : "transparent",
              minWidth: 120,
              cursor: "pointer",
              flexShrink: 0,
            }}
            aria-pressed={isActive}
            onMouseEnter={(e) => {
              if (!isActive)
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#404040";
            }}
            onMouseLeave={(e) => {
              if (!isActive)
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "#262626";
            }}
          >
            <p
              className="ui-sans"
              style={{
                color: isActive ? "#2563eb" : "var(--text-muted)",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {p.label.toUpperCase()}
              {p.is_current && <span style={{ marginLeft: 4 }}>·</span>}
            </p>
            <p
              className="mono"
              style={{
                marginTop: 6,
                color: "var(--text-primary)",
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {fmtMoney.format(total)}
            </p>
            {deltaText && (
              <p
                className="ui-sans"
                style={{
                  color: deltaColor,
                  fontSize: 11,
                  marginTop: 4,
                }}
              >
                {deltaText}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* =================================================================
 * SELECTED PERIOD DETAIL
 * ================================================================= */

function PeriodDetail({
  period,
  previous,
}: {
  period: HistoryPeriod;
  previous: HistoryPeriod | null;
}) {
  const total = n(period.total_usd);
  const prevTotal = previous ? n(previous.total_usd) : null;

  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="cat-label">{period.label.toUpperCase()} BREAKDOWN</p>
        <span
          className="mono"
          style={{
            color: "var(--text-primary)",
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          {fmtMoney.format(total)}
        </span>
      </div>

      <div
        className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[55fr_45fr]"
      >
        <div>
          <p
            className="ui-sans"
            style={{
              color: "var(--text-muted)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 600,
            }}
          >
            Daily
          </p>
          <div className="mt-3 h-[200px] w-full">
            <PeriodDailyChart period={period} />
          </div>
        </div>

        <div
          className="flex flex-col gap-5"
          style={{ minWidth: 0 }}
        >
          <ProviderBreakdown period={period} />
          <CategoryBreakdown period={period} />
          {prevTotal !== null && (
            <PeriodVsPrev
              current={total}
              previous={prevTotal}
              previousLabel={previous!.label}
            />
          )}
        </div>
      </div>
    </Card>
  );
}

function PeriodDailyChart({ period }: { period: HistoryPeriod }) {
  const daily = useMemo(() => period.daily ?? [], [period.daily]);
  const providers = useMemo(() => {
    const set = new Set<string>();
    for (const d of daily) for (const p of d.providers) set.add(p.provider);
    return Array.from(set);
  }, [daily]);

  if (daily.length === 0) {
    // TODO: use daily_by_provider once backend is updated.
    return (
      <div
        className="flex h-full items-center justify-center"
        style={{ border: "1px solid var(--border)", borderRadius: 6 }}
      >
        <p
          className="ui-sans"
          style={{ color: "var(--text-muted)", fontSize: 12 }}
        >
          No daily breakdown for this period.
        </p>
      </div>
    );
  }

  const data = daily.map((d) => {
    const row: Record<string, unknown> = {
      date: d.date.slice(8),
      full: d.date,
    };
    for (const p of providers) {
      const m = d.providers.find((x) => x.provider === p);
      row[p] = m ? n(m.amount) : 0;
    }
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
        barSize={12}
        barGap={1}
      >
        <CartesianGrid
          stroke="#1a1a1a"
          strokeDasharray="0"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{
            fontSize: 10,
            fill: "#52525b",
            fontFamily: "var(--font-jetbrains-mono)",
          }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{
            fontSize: 10,
            fill: "#52525b",
            fontFamily: "var(--font-jetbrains-mono)",
          }}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v) =>
            v === 0 ? "$0" : fmtCompactMoney.format(v as number)
          }
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          contentStyle={{
            background: "#000000",
            border: "1px solid #333333",
            borderRadius: 6,
            fontSize: 12,
            padding: "8px 12px",
            color: "#ffffff",
            boxShadow: "0 4px 24px rgba(0,0,0,0.8)",
          }}
          itemStyle={{ color: "#ffffff" }}
          labelStyle={{
            color: "#52525b",
            marginBottom: 2,
            fontFamily: "var(--font-inter)",
          }}
          formatter={(v: number, key: string) => [fmtMoney.format(v), key]}
          labelFormatter={(_, p) => p[0]?.payload?.full ?? ""}
        />
        {providers.map((prov) => (
          <Bar
            key={prov}
            dataKey={prov}
            stackId="period"
            fill={getProviderColor(prov)}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function ProviderBreakdown({ period }: { period: HistoryPeriod }) {
  if (period.by_provider.length === 0) return null;
  const total = period.by_provider.reduce((s, p) => s + n(p.amount_usd), 0);
  return (
    <div>
      <p className="cat-label">Providers</p>
      <div className="mt-2">
        {period.by_provider.map((p) => {
          const amount = n(p.amount_usd);
          const pct = total > 0 ? (amount / total) * 100 : 0;
          const color = getProviderColor(p.provider);
          return (
            <DotLeaderRow
              key={p.provider}
              label={formatProviderName(p.provider)}
              amount={amount}
              pct={pct}
              color={color}
            />
          );
        })}
      </div>
    </div>
  );
}

function CategoryBreakdown({ period }: { period: HistoryPeriod }) {
  if (period.by_category.length === 0) return null;
  const total = period.by_category.reduce((s, c) => s + n(c.amount_usd), 0);
  return (
    <div>
      <p className="cat-label">Categories</p>
      <div className="mt-2">
        {period.by_category.map((c) => {
          const amount = n(c.amount_usd);
          const pct = total > 0 ? (amount / total) * 100 : 0;
          const color = CATEGORY_COLORS[c.category] ?? CATEGORY_COLORS.other;
          return (
            <DotLeaderRow
              key={c.category}
              label={CATEGORY_LABELS[c.category] ?? c.category}
              amount={amount}
              pct={pct}
              color={color}
            />
          );
        })}
      </div>
    </div>
  );
}

function DotLeaderRow({
  label,
  amount,
  pct,
  color,
}: {
  label: string;
  amount: number;
  pct: number;
  color: string;
}) {
  return (
    <div
      style={{
        display: "block",
        width: "100%",
        minWidth: 0,
        padding: "10px 0",
        borderBottom: "1px solid var(--border)",
        overflow: "visible",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          minWidth: 0,
          overflow: "visible",
        }}
      >
        <span
          className="ui-sans"
          style={{
            color: "var(--text-primary)",
            fontSize: 13,
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
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
            color: "var(--text-muted)",
            letterSpacing: "0.4em",
            whiteSpace: "nowrap",
            fontSize: 11,
            lineHeight: 1,
          }}
        >
          {".".repeat(200)}
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          <span
            className="mono"
            style={{
              color: "var(--text-primary)",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {fmtMoney.format(amount)}
          </span>
          <span
            className="ui-sans"
            style={{
              color: "var(--text-muted)",
              fontSize: 11,
            }}
          >
            {pct.toFixed(0)}%
          </span>
        </div>
      </div>
      <div
        aria-hidden
        style={{
          width: "100%",
          height: 2,
          marginTop: 6,
          background: "var(--bg-subtle)",
          borderRadius: 1,
        }}
      >
        <div
          style={{
            width: `${Math.max(0.5, pct)}%`,
            background: color,
            height: "100%",
            borderRadius: 1,
            transition: "width 600ms ease-out",
          }}
        />
      </div>
    </div>
  );
}

function PeriodVsPrev({
  current,
  previous,
  previousLabel,
}: {
  current: number;
  previous: number;
  previousLabel: string;
}) {
  if (previous === 0) return null;
  const delta = current - previous;
  const pct = (delta / previous) * 100;
  const up = delta > 0;
  const color = up ? "var(--negative)" : "var(--positive)";
  return (
    <p
      className="ui-sans"
      style={{ color: "var(--text-muted)", fontSize: 12 }}
    >
      vs {previousLabel}:{" "}
      <span className="mono" style={{ color, fontWeight: 600 }}>
        {up ? "↑" : "↓"} {fmtMoney.format(Math.abs(delta))} ({Math.abs(pct).toFixed(0)}%)
      </span>
    </p>
  );
}

/* =================================================================
 * STATS ROW
 * ================================================================= */

function StatsRow({ history: h }: { history: History }) {
  const trend = h.trend;
  const trendMeta =
    trend === "up"
      ? { color: "#ef4444", arrow: "↑", label: "Spending up" }
      : trend === "down"
        ? { color: "#22c55e", arrow: "↓", label: "Spending down" }
        : { color: "var(--text-muted)", arrow: "→", label: "Flat" };

  const items: {
    label: string;
    value: string;
    sub?: string;
    valueColor?: string;
    prefix?: string;
    isMono?: boolean;
  }[] = [
    {
      label: "6-period avg",
      value: fmtMoney.format(n(h.avg_monthly_usd)),
      isMono: true,
    },
    {
      label: "Highest",
      value: h.highest_month
        ? fmtMoney.format(n(h.highest_month.total_usd))
        : "—",
      sub: h.highest_month?.label,
      isMono: true,
    },
    {
      label: "Trend",
      value: trendMeta.label,
      valueColor: trendMeta.color,
      prefix: trendMeta.arrow,
      isMono: false,
    },
    {
      label: "YoY",
      value:
        h.yoy_change_pct !== null && h.yoy_change_pct !== undefined
          ? `${h.yoy_change_pct >= 0 ? "+" : ""}${h.yoy_change_pct.toFixed(0)}%`
          : "—",
      sub: h.yoy_change_pct === null ? "need 12mo data" : undefined,
      isMono: true,
    },
  ];

  return (
    <Card>
      <div className="grid grid-cols-2 md:grid-cols-4">
        {items.map((it, i) => (
          <div
            key={it.label}
            style={{
              padding: "0 16px",
              borderLeft: i === 0 ? "none" : "1px solid #262626",
            }}
          >
            <p
              className="ui-sans"
              style={{
                color: "var(--text-muted)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 500,
              }}
            >
              {it.label}
            </p>
            <p
              className={it.isMono ? "mono" : "ui-sans"}
              style={{
                marginTop: 8,
                fontSize: 24,
                fontWeight: 600,
                color: it.valueColor ?? "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              {it.prefix && (
                <span style={{ marginRight: 6 }}>{it.prefix}</span>
              )}
              {it.value}
            </p>
            {it.sub && (
              <p
                className="ui-sans"
                style={{
                  marginTop: 4,
                  color: "var(--text-muted)",
                  fontSize: 11,
                }}
              >
                {it.sub}
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* =================================================================
 * INSIGHTS
 * ================================================================= */

type InsightTone = "info" | "warning" | "good";
type Insight = { id: string; text: string; tone: InsightTone };

function buildInsights(h: History): Insight[] {
  const out: Insight[] = [];
  const periods = h.periods;
  if (periods.length < 2) return out;

  const complete = periods.filter((p) => !p.is_current);
  const current = periods.find((p) => p.is_current);
  const prevComplete =
    complete.length >= 1 ? complete[complete.length - 1] : null;

  if (complete.length >= 2) {
    const last = complete[complete.length - 1];
    const prev = complete[complete.length - 2];
    const prevTotalsByProv: Record<string, number> = {};
    for (const p of prev.by_provider)
      prevTotalsByProv[p.provider] = n(p.amount_usd);
    for (const p of last.by_provider) {
      const cur = n(p.amount_usd);
      const old = prevTotalsByProv[p.provider] ?? 0;
      if (old > 0 && cur / old >= 1.5) {
        const pct = Math.round(((cur - old) / old) * 100);
        out.push({
          id: `grew-${p.provider}`,
          text: `Your ${formatProviderName(p.provider)} spend grew ${pct}% in ${last.label}. Consider reviewing your usage.`,
          tone: "warning",
        });
      }
    }
  }

  if (current && complete.length > 0) {
    const start = new Date(current.period_start + "T00:00:00Z");
    const end = new Date(current.period_end + "T23:59:59Z");
    const elapsedMs = Math.max(1, Date.now() - start.getTime());
    const totalMs = Math.max(elapsedMs, end.getTime() - start.getTime());
    const fraction = Math.min(1, elapsedMs / totalMs);
    const projected = fraction > 0.05 ? n(current.total_usd) / fraction : 0;
    const highestComplete = Math.max(
      ...complete.map((p) => n(p.total_usd)),
      0,
    );
    if (projected > highestComplete && highestComplete > 0) {
      out.push({
        id: "tracking-highest",
        text: "This period is tracking to be your highest spend on record.",
        tone: "warning",
      });
    }
  }

  if (complete.length >= 3) {
    const tail = complete.slice(-Math.min(complete.length, 6));
    let flatStreak = 1;
    for (let i = tail.length - 1; i > 0; i--) {
      const a = n(tail[i].total_usd);
      const b = n(tail[i - 1].total_usd);
      if (b === 0) break;
      const delta = Math.abs((a - b) / b);
      if (delta <= 0.05) flatStreak += 1;
      else break;
    }
    if (flatStreak >= 3) {
      out.push({
        id: "flat",
        text: `Your spending has been stable for ${flatStreak} ${flatStreak === 1 ? "period" : "periods"}.`,
        tone: "good",
      });
    }
  }

  const emptyComplete = complete.filter((p) => n(p.total_usd) === 0);
  if (emptyComplete.length > 0 && complete.length > emptyComplete.length) {
    out.push({
      id: "missing-data",
      text: `No data for ${emptyComplete[emptyComplete.length - 1].label} — connect more providers to see your full picture.`,
      tone: "info",
    });
  }

  if (complete.length >= 2 && prevComplete) {
    const last = prevComplete;
    if (last.vs_previous_pct !== null && last.vs_previous_pct > 25) {
      const exists = out.some((o) => o.id === `jump-${last.label}`);
      if (!exists) {
        out.push({
          id: `jump-${last.label}`,
          text: `${last.label} was ${last.vs_previous_pct.toFixed(0)}% higher than the previous period.`,
          tone: "warning",
        });
      }
    }
    if (last.vs_previous_pct !== null && last.vs_previous_pct < -10) {
      out.push({
        id: `down-${last.label}`,
        text: `${last.label} was ${Math.abs(last.vs_previous_pct).toFixed(0)}% lower than the previous period — savings stuck.`,
        tone: "good",
      });
    }
  }

  return out;
}

function Insights({ history: h }: { history: History }) {
  const insights = useMemo(() => buildInsights(h), [h]);
  if (insights.length === 0) {
    return (
      <Card>
        <p className="cat-label">Insights</p>
        <p
          className="ui-sans mt-3"
          style={{ color: "var(--text-muted)", fontSize: 13 }}
        >
          Nothing notable in this window.
        </p>
      </Card>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="cat-label" style={{ marginBottom: 4 }}>
        Insights
      </p>
      {insights.map((ins) => {
        const color =
          ins.tone === "warning"
            ? "#f59e0b"
            : ins.tone === "good"
              ? "#22c55e"
              : "#2563eb";
        return (
          <div
            key={ins.id}
            className="ui-sans"
            style={{
              background: "var(--bg-elevated)",
              borderLeft: `3px solid ${color}`,
              borderTop: "1px solid #262626",
              borderRight: "1px solid #262626",
              borderBottom: "1px solid #262626",
              borderRadius: 6,
              padding: "12px 16px",
              color: "var(--text-secondary)",
              fontSize: 14,
            }}
          >
            {ins.text}
          </div>
        );
      })}
    </div>
  );
}

/* =================================================================
 * EMPTY / LOADING STATES
 * ================================================================= */

function HistoryEmpty() {
  return (
    <div className="flex flex-col items-center pb-24 pt-24 text-center">
      <p className="cat-label">Nothing to see yet</p>
      <h1
        className="font-display mt-4"
        style={{
          color: "var(--text-primary)",
          fontSize: "clamp(24px, 4vw, 28px)",
          lineHeight: 1.15,
          letterSpacing: "-0.012em",
        }}
      >
        Connect a provider and sync to start building your history.
      </h1>
      <Link href="/connections" className="btn-primary mt-8">
        Add a provider
      </Link>
    </div>
  );
}

function HistoryLoading() {
  return (
    <div>
      <SkeletonLine className="h-[400px] w-full" />
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 16,
            }}
          >
            <SkeletonLine className="h-3 w-20" />
            <div className="mt-3">
              <SkeletonLine className="h-6 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =================================================================
 * SHARED CARD
 * ================================================================= */

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={className}
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 20,
      }}
    >
      {children}
    </section>
  );
}
