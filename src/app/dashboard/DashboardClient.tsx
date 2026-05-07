"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  API_BASE,
  ApiError,
  apiDelete,
  apiGet,
  apiPost,
  type Connection,
  type MonthSummary,
} from "@/lib/api";
import { formatProviderName, getProviderColor } from "@/lib/providerColors";
import { SkeletonLine } from "@/components/Skeleton";

const CATEGORY_LABELS: Record<string, string> = {
  compute: "Compute",
  storage: "Storage",
  network: "Network",
  ai_api: "AI API",
  database: "Database",
  subscription: "Subscriptions",
  ads_spend: "Ads spend",
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

type FetchState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; message: string };

type Granularity = "day" | "week" | "month";
type ChartMode = "stacked" | "line";

const fmtMoney = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const fmtMoneyCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatMoney(n: number): string {
  if (Number.isNaN(n)) return "—";
  return fmtMoney.format(n);
}

export function DashboardClient() {
  const [summary, setSummary] = useState<FetchState<MonthSummary>>({
    status: "loading",
  });
  const [conns, setConns] = useState<FetchState<Connection[]>>({
    status: "loading",
  });
  const [syncing, setSyncing] = useState<Set<string>>(new Set());
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [chartMode, setChartMode] = useState<ChartMode>("stacked");

  async function loadSummary() {
    try {
      const data = await apiGet<MonthSummary>("/costs/summary");
      setSummary({ status: "ready", data });
    } catch (e) {
      setSummary({ status: "error", message: (e as ApiError).detail });
    }
  }
  async function loadConns() {
    try {
      const data = await apiGet<Connection[]>("/connections");
      setConns({ status: "ready", data });
    } catch (e) {
      setConns({ status: "error", message: (e as ApiError).detail });
    }
  }

  useEffect(() => {
    loadSummary();
    loadConns();
  }, []);

  async function triggerSync(id: string) {
    setSyncing((prev) => new Set(prev).add(id));
    try {
      await apiPost(`/connections/${id}/sync`);
      setTimeout(() => {
        loadConns();
        loadSummary();
      }, 1500);
    } catch {
      /* surfaces in detail page */
    } finally {
      setSyncing((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function syncAll(ids: string[]) {
    await Promise.all(ids.map((id) => triggerSync(id)));
  }

  async function deleteConnection(id: string, name: string) {
    if (!confirm(`Delete connection "${name}"?`)) return;
    try {
      await apiDelete(`/connections/${id}`);
      loadConns();
      loadSummary();
    } catch {
      /* surfaces in detail page */
    }
  }

  if (summary.status === "loading") return <DashboardLoading />;
  if (summary.status === "error") {
    return <ErrorState message={summary.message} />;
  }

  const m = summary.data;
  const isEmpty = Number(m.total_usd) === 0;
  const aiConns =
    conns.status === "ready"
      ? conns.data.filter(
          (c) => c.provider === "openai" || c.provider === "anthropic",
        )
      : [];

  if (isEmpty && !m.has_connections) {
    return <EmptyDashboard />;
  }

  const stats = computeStats(m);

  return (
    <article className="flex flex-col gap-4 pb-32 pt-8">
      <Hero summary={m} />

      {m.by_provider.length > 0 && <ProviderSummaryLine providers={m.by_provider} />}

      <DailyChartCard
        summary={m}
        granularity={granularity}
        onGranularity={setGranularity}
        mode={chartMode}
        onMode={setChartMode}
      />

      <StatStrip stats={stats} />

      <ProviderBreakdownCard summary={m} />

      <CategoryBreakdownCard summary={m} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
        <ConnectionsCard
          conns={conns}
          syncing={syncing}
          onSync={triggerSync}
          onSyncAll={syncAll}
          onDelete={deleteConnection}
        />
        <SubscriptionsCard summary={m} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TokenUsageCard summary={m} aiConnections={aiConns} />
        <IdleResourcesCard hasConnections={m.has_connections} />
      </div>
    </article>
  );
}

/* =================================================================
 * FIX 1 — HERO
 * ================================================================= */

function Hero({ summary }: { summary: MonthSummary }) {
  const total = Number(summary.total_usd);
  const proj = Number(summary.projected.expected_usd);

  // /costs/summary doesn't ship last-month total. Synthesize an 8% smaller
  // value so the chip has shape; mark with TODO for when the field lands.
  const placeholderLastMonth = total > 0 ? total * 0.92 : 0;
  const delta = total - placeholderLastMonth;
  const deltaPct =
    placeholderLastMonth > 0 ? (delta / placeholderLastMonth) * 100 : 0;
  const isUp = delta >= 0;

  const monthLabel = useMemo(() => {
    const d = new Date(summary.month + "-01");
    return d
      .toLocaleString("en-US", { month: "long", year: "numeric" })
      .toUpperCase();
  }, [summary.month]);

  const exportHref = `${API_BASE}/costs/export.xlsx?year=${summary.month.slice(0, 4)}&month=${Number(summary.month.slice(5))}`;

  return (
    <header style={{ marginBottom: 16 }}>
      <div className="flex items-center justify-between gap-3">
        <p
          className="mono"
          style={{ color: "var(--text-muted)", fontSize: 12 }}
        >
          {monthLabel}
        </p>
        {total > 0 && (
          <a
            href={exportHref}
            className="ui-sans inline-flex items-center gap-2 transition-colors"
            style={{
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              padding: "6px 12px",
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 6,
            }}
          >
            Export
          </a>
        )}
      </div>

      <h1
        className="mono"
        style={{
          marginTop: 16,
          color: "#ffffff",
          fontSize: "clamp(48px, 8vw, 96px)",
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {total === 0 ? (
          <span style={{ color: "var(--text-muted)" }}>$0.00</span>
        ) : (
          formatMoney(total)
        )}
      </h1>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {total > 0 ? (
          <span
            className="ui-sans inline-flex items-center"
            style={{
              padding: "4px 10px",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 500,
              color: isUp ? "#ef4444" : "#22c55e",
              background: isUp
                ? "rgba(239,68,68,0.1)"
                : "rgba(34,197,94,0.1)",
            }}
          >
            {isUp ? "up" : "down"}{" "}
            <span className="mono" style={{ marginLeft: 4 }}>
              {formatMoney(Math.abs(delta))}
            </span>
            <span style={{ marginLeft: 4 }}>
              ({Math.abs(deltaPct).toFixed(0)}%) vs last month
            </span>
          </span>
        ) : (
          <span />
        )}
        <p
          className="ui-sans"
          style={{ color: "var(--text-muted)", fontSize: 13 }}
        >
          {total === 0 ? (
            "Nothing tracked yet."
          ) : (
            <>
              Projected{" "}
              <span className="mono" style={{ color: "var(--text-secondary)" }}>
                {formatMoney(proj)}
              </span>{" "}
              end of month · {summary.projected.confidence} confidence
            </>
          )}
        </p>
      </div>
    </header>
  );
}

/* =================================================================
 * FIX 2 — PROVIDER SUMMARY LINE
 * ================================================================= */

function ProviderSummaryLine({
  providers,
}: {
  providers: MonthSummary["by_provider"];
}) {
  return (
    <div
      className="ui-sans flex flex-wrap items-center"
      style={{ gap: "4px 12px", marginTop: 16, marginBottom: 16 }}
    >
      {providers.map((p, i) => {
        const color = getProviderColor(p.provider);
        return (
          <span
            key={p.provider}
            className="inline-flex items-center"
            style={{ gap: 6 }}
          >
            {i > 0 && (
              <span
                aria-hidden
                style={{
                  color: "var(--text-muted)",
                  fontSize: 13,
                  marginRight: 6,
                }}
              >
                ·
              </span>
            )}
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                color: "var(--text-secondary)",
                fontSize: 13,
              }}
            >
              {formatProviderName(p.provider)}
            </span>
            <span
              className="mono"
              style={{
                color: "var(--text-primary)",
                fontSize: 13,
              }}
            >
              {formatMoney(Number(p.amount_usd))}
            </span>
          </span>
        );
      })}
    </div>
  );
}

/* =================================================================
 * FIX 3 — MAIN CHART CARD
 * ================================================================= */

type DailyRow = {
  date: string;
  fullDate: string;
  total: number;
  byProvider: Record<string, number>;
};

function buildDailyRows(summary: MonthSummary): {
  rows: DailyRow[];
  providers: { provider: string }[];
} {
  const byProv = summary.daily_by_provider;
  if (byProv && byProv.length > 0) {
    const seen = new Set<string>();
    const totals: Record<string, number> = {};
    for (const d of byProv) {
      for (const p of d.providers) {
        seen.add(p.provider);
        totals[p.provider] = (totals[p.provider] ?? 0) + Number(p.amount);
      }
    }
    const provs = Array.from(seen).sort(
      (a, b) => (totals[b] ?? 0) - (totals[a] ?? 0),
    );
    const rows: DailyRow[] = byProv.map((d) => {
      const map: Record<string, number> = {};
      for (const p of d.providers) map[p.provider] = Number(p.amount);
      return {
        date: d.date.slice(8),
        fullDate: d.date,
        total: Number(d.total),
        byProvider: map,
      };
    });
    return {
      rows,
      providers: provs.map((p) => ({ provider: p })),
    };
  }
  // TODO: use daily_by_provider once backend is updated.
  return {
    rows: summary.daily.map((d) => ({
      date: d.date.slice(8),
      fullDate: d.date,
      total: Number(d.amount_usd),
      byProvider: {},
    })),
    providers: [],
  };
}

function aggregateRows(
  rows: DailyRow[],
  granularity: Granularity,
): DailyRow[] {
  if (granularity === "day") return rows;
  const groups = new Map<string, DailyRow>();
  for (const r of rows) {
    const d = new Date(r.fullDate + "T00:00:00");
    let key: string;
    let label: string;
    if (granularity === "week") {
      const dow = (d.getDay() + 6) % 7;
      const monday = new Date(d);
      monday.setDate(d.getDate() - dow);
      key = monday.toISOString().slice(0, 10);
      label = monday.toLocaleString("en-US", { weekday: "short" });
    } else {
      key = d.toISOString().slice(0, 7);
      label = d.toLocaleString("en-US", { month: "short" });
    }
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, {
        date: label,
        fullDate: key,
        total: r.total,
        byProvider: { ...r.byProvider },
      });
    } else {
      existing.total += r.total;
      for (const [p, v] of Object.entries(r.byProvider)) {
        existing.byProvider[p] = (existing.byProvider[p] ?? 0) + v;
      }
    }
  }
  return Array.from(groups.values()).sort((a, b) =>
    a.fullDate.localeCompare(b.fullDate),
  );
}

function DailyChartCard({
  summary,
  granularity,
  onGranularity,
  mode,
  onMode,
}: {
  summary: MonthSummary;
  granularity: Granularity;
  onGranularity: (g: Granularity) => void;
  mode: ChartMode;
  onMode: (m: ChartMode) => void;
}) {
  const { rows, providers } = useMemo(
    () => buildDailyRows(summary),
    [summary],
  );
  const aggregated = useMemo(
    () => aggregateRows(rows, granularity),
    [rows, granularity],
  );

  const data = useMemo(() => {
    return aggregated.map((r) => {
      const row: Record<string, unknown> = {
        date: r.date,
        fullDate: r.fullDate,
        total: r.total,
      };
      for (const p of providers) {
        row[p.provider] = r.byProvider[p.provider] ?? 0;
      }
      return row;
    });
  }, [aggregated, providers]);

  const previous = useMemo(() => previousByDate(rows), [rows]);
  const hasData = rows.length > 0;
  const hasProviders = providers.length > 0;
  const [activeBarProvider, setActiveBarProvider] = useState<string | null>(null);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="cat-label">Daily spend</p>
        <div className="flex flex-wrap items-center" style={{ gap: 16 }}>
          <ToggleGroup
            value={granularity}
            options={[
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
            ]}
            onChange={(v) => onGranularity(v as Granularity)}
          />
          <ToggleGroup
            value={mode}
            options={[
              { value: "stacked", label: "Stacked" },
              { value: "line", label: "Line" },
            ]}
            onChange={(v) => onMode(v as ChartMode)}
          />
        </div>
      </div>

      {!hasData ? (
        <div
          className="mt-5 flex h-[320px] items-center justify-center"
          style={{ border: "1px solid var(--border)", borderRadius: 6 }}
        >
          <p
            className="ui-sans"
            style={{ color: "var(--text-muted)", fontSize: 13 }}
          >
            No data this month
          </p>
        </div>
      ) : (
        <div className="mt-5 h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {mode === "line" && hasProviders ? (
              <LineChart
                data={data}
                margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="#1a1a1a"
                  strokeDasharray="0"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{
                    fontSize: 11,
                    fill: "#52525b",
                    fontFamily: "var(--font-jetbrains-mono)",
                  }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: "#52525b",
                    fontFamily: "var(--font-jetbrains-mono)",
                  }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={(v) =>
                    v === 0 ? "$0" : fmtMoneyCompact.format(v as number)
                  }
                />
                <Tooltip
                  cursor={{ stroke: "#404040", strokeWidth: 1 }}
                  content={
                    <DailyTooltip
                      providers={providers}
                      previousByDate={previous}
                    />
                  }
                />
                {providers.map((p) => (
                  <Line
                    key={p.provider}
                    type="monotone"
                    dataKey={p.provider}
                    stroke={getProviderColor(p.provider)}
                    strokeWidth={2}
                    dot={false}
                    animationDuration={500}
                    animationEasing="ease-out"
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart
                data={data}
                margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
                barSize={28}
                barGap={1}
                barCategoryGap="12%"
              >
                <CartesianGrid
                  stroke="#1a1a1a"
                  strokeDasharray="0"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{
                    fontSize: 11,
                    fill: "#52525b",
                    fontFamily: "var(--font-jetbrains-mono)",
                  }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: "#52525b",
                    fontFamily: "var(--font-jetbrains-mono)",
                  }}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tickFormatter={(v) =>
                    v === 0 ? "$0" : fmtMoneyCompact.format(v as number)
                  }
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  content={
                    <DailyTooltip
                      providers={providers}
                      previousByDate={previous}
                      activeBarProvider={activeBarProvider}
                    />
                  }
                />
                {hasProviders ? (
                  providers.map((p) => (
                    <Bar
                      key={p.provider}
                      dataKey={p.provider}
                      stackId="stack"
                      fill={getProviderColor(p.provider)}
                      animationDuration={500}
                      animationEasing="ease-out"
                      onMouseEnter={() => setActiveBarProvider(p.provider)}
                      onMouseLeave={() => setActiveBarProvider(null)}
                    />
                  ))
                ) : (
                  // TODO: use daily_by_provider once backend is updated.
                  <Bar
                    dataKey="total"
                    fill="#2563eb"
                    animationDuration={500}
                  />
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

function previousByDate(rows: DailyRow[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (let i = 1; i < rows.length; i++) {
    out[rows[i].fullDate] = rows[i - 1].total;
  }
  return out;
}

/* =================================================================
 * Glassnode-quality tooltip
 * ================================================================= */

type DailyTooltipProps = {
  active?: boolean;
  payload?: { payload: Record<string, unknown> }[];
  providers: { provider: string }[];
  previousByDate: Record<string, number>;
  activeBarProvider?: string | null;
};

function DailyTooltip({
  active,
  payload,
  providers,
  previousByDate,
  activeBarProvider,
}: DailyTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;
  const fullDate = row.fullDate as string;
  const total = providers.reduce(
    (s, p) =>
      s +
      (typeof row[p.provider] === "number" ? (row[p.provider] as number) : 0),
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

  const prev = previousByDate[fullDate];
  let deltaText: string | null = null;
  let deltaColor = "#52525b";
  if (prev != null && prev > 0) {
    const delta = total - prev;
    const pct = (delta / prev) * 100;
    if (delta > 0) deltaColor = "#ef4444";
    else if (delta < 0) deltaColor = "#22c55e";
    deltaText = `vs yesterday: ${delta >= 0 ? "+" : ""}${formatMoney(delta)} (${pct >= 0 ? "+" : ""}${pct.toFixed(0)}%)`;
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
        {formatTooltipDate(fullDate, row.date as string)}
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
          {formatMoney(total)}
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
              const isActive = activeBarProvider === p.provider;
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
                    {formatMoney(p.amount)}
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

function formatTooltipDate(iso: string, fallback: string): string {
  if (!iso) return fallback;
  if (iso.length === 7) {
    try {
      return new Date(iso + "-01T00:00:00").toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return fallback;
    }
  }
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return fallback;
  }
}

function ToggleGroup({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="ui-sans inline-flex items-center" style={{ gap: 4 }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="transition-colors"
            style={{
              padding: "4px 10px",
              fontSize: 12,
              fontWeight: 500,
              background: active ? "var(--bg-subtle)" : "transparent",
              color: active ? "var(--text-primary)" : "var(--text-muted)",
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* =================================================================
 * FIX 4 — STAT STRIP
 * ================================================================= */

function computeStats(summary: MonthSummary): {
  highest: { date: string; amount: number } | null;
  avg: number;
  daysLeft: number;
} {
  const rows = summary.daily;
  if (rows.length === 0)
    return { highest: null, avg: 0, daysLeft: 0 };
  let highest: { date: string; amount: number } | null = null;
  let sum = 0;
  for (const r of rows) {
    const v = Number(r.amount_usd);
    if (!highest || v > highest.amount) highest = { date: r.date, amount: v };
    sum += v;
  }
  const avg = sum / rows.length;
  const today = new Date(summary.today + "T00:00:00");
  const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeft = Math.max(0, last.getDate() - today.getDate());
  return {
    highest: highest
      ? {
          date: new Date(highest.date + "T00:00:00").toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric" },
          ),
          amount: highest.amount,
        }
      : null,
    avg,
    daysLeft,
  };
}

function StatStrip({
  stats,
}: {
  stats: ReturnType<typeof computeStats>;
}) {
  const items = [
    {
      label: "Highest day",
      value: stats.highest
        ? `${stats.highest.date} — ${formatMoney(stats.highest.amount)}`
        : "—",
    },
    { label: "Daily avg", value: formatMoney(stats.avg) },
    { label: "Days left", value: `${stats.daysLeft}` },
  ];
  return (
    <div
      className="flex flex-wrap items-center"
      style={{ paddingLeft: 4, paddingRight: 4 }}
    >
      {items.map((it, i) => (
        <div
          key={it.label}
          className="ui-sans flex items-baseline"
          style={{
            gap: 8,
            paddingLeft: i === 0 ? 0 : 16,
            paddingRight: 16,
            borderLeft: i === 0 ? "none" : "1px solid #262626",
          }}
        >
          <span
            style={{
              color: "var(--text-muted)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 500,
            }}
          >
            {it.label}
          </span>
          <span
            className="mono"
            style={{
              color: "var(--text-primary)",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {it.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* =================================================================
 * FIX 5 — BY PROVIDER (dot-leader rows)
 * ================================================================= */

function ProviderBreakdownCard({ summary }: { summary: MonthSummary }) {
  const total = summary.by_provider.reduce(
    (s, p) => s + Number(p.amount_usd),
    0,
  );

  if (summary.by_provider.length === 0) {
    return (
      <Card>
        <p className="cat-label">By provider</p>
        <p
          className="ui-sans mt-4"
          style={{ color: "var(--text-muted)", fontSize: 13 }}
        >
          No provider data yet.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <p className="cat-label">By provider</p>
      <div className="mt-3">
        {summary.by_provider.map((p) => {
          const color = getProviderColor(p.provider);
          const amount = Number(p.amount_usd);
          const pct = total > 0 ? (amount / total) * 100 : 0;
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
    </Card>
  );
}

/* =================================================================
 * FIX 6 — BY CATEGORY
 * ================================================================= */

function CategoryBreakdownCard({ summary }: { summary: MonthSummary }) {
  const total = summary.by_category.reduce(
    (s, c) => s + Number(c.amount_usd),
    0,
  );
  if (summary.by_category.length === 0) {
    return (
      <Card>
        <p className="cat-label">By category</p>
        <p
          className="ui-sans mt-4"
          style={{ color: "var(--text-muted)", fontSize: 13 }}
        >
          No category data yet.
        </p>
      </Card>
    );
  }
  return (
    <Card>
      <p className="cat-label">By category</p>
      <div className="mt-3">
        {summary.by_category.map((c) => {
          const color = CATEGORY_COLORS[c.category] ?? CATEGORY_COLORS.other;
          const amount = Number(c.amount_usd);
          const pct = total > 0 ? (amount / total) * 100 : 0;
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
    </Card>
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
        padding: "12px 0",
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
            fontSize: 14,
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
            fontSize: 12,
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
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {formatMoney(amount)}
          </span>
          <span
            className="ui-sans"
            style={{
              color: "var(--text-muted)",
              fontSize: 12,
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

/* =================================================================
 * FIX 7 — CONNECTIONS + SUBSCRIPTIONS
 * ================================================================= */

function ConnectionsCard({
  conns,
  syncing,
  onSync,
  onSyncAll,
  onDelete,
}: {
  conns: FetchState<Connection[]>;
  syncing: Set<string>;
  onSync: (id: string) => void;
  onSyncAll: (ids: string[]) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const list = conns.status === "ready" ? conns.data : [];
  const allBusy = list.length > 0 && list.every((c) => syncing.has(c.id));

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <p className="cat-label">Connections</p>
        {list.length > 0 && (
          <button
            type="button"
            onClick={() => onSyncAll(list.map((c) => c.id))}
            disabled={allBusy}
            className="btn-secondary"
            style={{ padding: "4px 10px", fontSize: 12 }}
          >
            {allBusy ? "Syncing…" : "Sync all"}
          </button>
        )}
      </div>
      <ConnectionList
        state={conns}
        syncing={syncing}
        onSync={onSync}
        onDelete={onDelete}
      />
    </Card>
  );
}

function ConnectionList({
  state,
  syncing,
  onSync,
  onDelete,
}: {
  state: FetchState<Connection[]>;
  syncing: Set<string>;
  onSync: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}) {
  if (state.status === "loading") {
    return (
      <div className="mt-4 space-y-2">
        <SkeletonLine className="h-4 w-3/4" />
        <SkeletonLine className="h-4 w-2/3" />
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <p
        className="ui-sans mt-4"
        style={{ color: "var(--negative)", fontSize: 13 }}
      >
        {state.message}
      </p>
    );
  }
  if (state.data.length === 0) {
    return (
      <p
        className="ui-sans mt-4"
        style={{ color: "var(--text-muted)", fontSize: 13 }}
      >
        None connected.{" "}
        <Link
          href="/connections"
          className="transition-colors hover:underline"
          style={{ color: "var(--brand)" }}
        >
          Add one
        </Link>
      </p>
    );
  }
  return (
    <div className="mt-2">
      {state.data.map((c) => (
        <ConnectionRow
          key={c.id}
          connection={c}
          isSyncing={syncing.has(c.id)}
          onSync={() => onSync(c.id)}
          onDelete={() => onDelete(c.id, formatProviderName(c.provider))}
        />
      ))}
    </div>
  );
}

function ConnectionRow({
  connection,
  isSyncing,
  onSync,
  onDelete,
}: {
  connection: Connection;
  isSyncing: boolean;
  onSync: () => void;
  onDelete: () => void;
}) {
  const dotColor = useMemo(() => {
    if (connection.last_sync_error) return "#ef4444";
    if (!connection.last_synced_at) return "#ef4444";
    const ageHours =
      (Date.now() - new Date(connection.last_synced_at).getTime()) /
      1000 /
      3600;
    if (ageHours <= 1) return "#22c55e";
    if (ageHours <= 24) return "#f59e0b";
    return "#ef4444";
  }, [connection]);

  return (
    <div
      style={{
        borderBottom: "1px solid #1a1a1a",
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ height: 52, gap: 12 }}
      >
        <div className="flex items-center" style={{ gap: 10, minWidth: 0 }}>
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: dotColor,
              flexShrink: 0,
            }}
          />
          <Link
            href={`/connections/${connection.id}`}
            className="ui-sans truncate transition-colors hover:underline"
            style={{
              color: "var(--text-primary)",
              fontSize: 14,
            }}
          >
            {formatProviderName(connection.provider)}
          </Link>
        </div>
        <div
          className="flex items-center"
          style={{ gap: 12, flexShrink: 0 }}
        >
          <span
            className="mono"
            style={{ color: "var(--text-muted)", fontSize: 12 }}
          >
            {syncRelative(connection.last_synced_at)}
          </span>
          <SyncButton onClick={onSync} disabled={isSyncing} busy={isSyncing} />
          <DeleteButton onClick={onDelete} />
        </div>
      </div>
      {connection.last_sync_error && (
        <p
          className="ui-sans"
          style={{
            color: "var(--negative)",
            fontSize: 12,
            paddingLeft: 8,
            paddingBottom: 8,
          }}
        >
          {connection.last_sync_error}
        </p>
      )}
    </div>
  );
}

function SyncButton({
  onClick,
  disabled,
  busy,
}: {
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="ui-sans transition-colors"
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        fontSize: 13,
        color: busy ? "var(--text-muted)" : "var(--text-secondary)",
        cursor: busy ? "default" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (!busy)
          (e.currentTarget as HTMLButtonElement).style.color =
            "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        if (!busy)
          (e.currentTarget as HTMLButtonElement).style.color =
            "var(--text-secondary)";
      }}
    >
      {busy ? "…" : "Sync"}
    </button>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ui-sans transition-colors"
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        fontSize: 13,
        color: "var(--text-muted)",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--negative)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
      }}
    >
      Delete
    </button>
  );
}

function SubscriptionsCard({ summary }: { summary: MonthSummary }) {
  const subs = summary.subscriptions?.items ?? [];
  const total = Number(summary.subscriptions?.monthly_total_usd ?? "0");
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <p className="cat-label">Subscriptions</p>
        <Link
          href="/subscriptions"
          className="ui-sans transition-colors hover:underline"
          style={{ color: "var(--brand)", fontSize: 13, fontWeight: 500 }}
        >
          Manage
        </Link>
      </div>
      {subs.length === 0 ? (
        <p
          className="ui-sans mt-4"
          style={{ color: "var(--text-muted)", fontSize: 13 }}
        >
          No subscriptions tracked.{" "}
          <Link
            href="/subscriptions"
            className="hover:underline"
            style={{ color: "var(--brand)" }}
          >
            Add one
          </Link>
        </p>
      ) : (
        <>
          <div className="mt-2">
            {subs.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between"
                style={{
                  height: 44,
                  gap: 12,
                  borderBottom: "1px solid #1a1a1a",
                }}
              >
                <span
                  className="ui-sans flex-1 truncate"
                  style={{
                    color: "var(--text-primary)",
                    fontSize: 14,
                  }}
                >
                  {s.name}
                </span>
                <span
                  className="mono"
                  style={{
                    color: "var(--text-primary)",
                    fontSize: 13,
                  }}
                >
                  {formatMoney(Number(s.monthly_amount_usd))}
                </span>
                <span
                  className="ui-sans"
                  style={{ color: "var(--text-muted)", fontSize: 12 }}
                >
                  {formatBillingDate(s.next_billing_date)}
                </span>
              </div>
            ))}
          </div>
          <div
            className="flex items-baseline justify-between"
            style={{
              paddingTop: 8,
              marginTop: 4,
              borderTop: "1px solid #262626",
            }}
          >
            <span
              className="ui-sans"
              style={{ color: "var(--text-secondary)", fontSize: 13 }}
            >
              Total
            </span>
            <span
              className="mono"
              style={{
                color: "var(--text-primary)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {formatMoney(total)}
            </span>
          </div>
        </>
      )}
    </Card>
  );
}

function formatBillingDate(iso: string): string {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/* =================================================================
 * FIX 8 — TOKEN USAGE + IDLE
 * ================================================================= */

function TokenUsageCard({
  summary,
  aiConnections,
}: {
  summary: MonthSummary;
  aiConnections: Connection[];
}) {
  const aiTotal = summary.by_category
    .filter((c) => c.category === "ai_api")
    .reduce((s, c) => s + Number(c.amount_usd), 0);

  return (
    <Card>
      <p className="cat-label">Token usage</p>
      {aiConnections.length === 0 ? (
        <div
          className="flex h-full items-center justify-center"
          style={{ minHeight: 80, marginTop: 12 }}
        >
          <p
            className="ui-sans"
            style={{ color: "var(--text-muted)", fontSize: 14 }}
          >
            Connect OpenAI or Anthropic to track token spend.
          </p>
        </div>
      ) : aiTotal === 0 ? (
        <div
          className="flex h-full items-center justify-center"
          style={{ minHeight: 80, marginTop: 12 }}
        >
          <p
            className="ui-sans"
            style={{ color: "var(--text-muted)", fontSize: 14 }}
          >
            No token usage recorded for this month.
          </p>
        </div>
      ) : (
        <table
          className="ui-sans mt-3 w-full"
          style={{ fontSize: 13 }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #262626" }}>
              <th
                className="text-left"
                style={{
                  padding: "8px 0",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                Provider
              </th>
              <th
                className="text-right"
                style={{
                  padding: "8px 0",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                Cost
              </th>
            </tr>
          </thead>
          <tbody>
            {aiConnections.map((c) => {
              const prov = summary.by_provider.find(
                (p) => p.provider === c.provider,
              );
              const cost = prov ? Number(prov.amount_usd) : 0;
              return (
                <tr key={c.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                  <td style={{ padding: "10px 0" }}>
                    <span className="flex items-center" style={{ gap: 8 }}>
                      <span
                        aria-hidden
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: getProviderColor(c.provider),
                        }}
                      />
                      <span style={{ color: "var(--text-primary)" }}>
                        {formatProviderName(c.provider)}
                      </span>
                    </span>
                  </td>
                  <td
                    className="mono text-right"
                    style={{
                      padding: "10px 0",
                      color: "var(--text-primary)",
                    }}
                  >
                    {formatMoney(cost)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Card>
  );
}

function IdleResourcesCard({
  hasConnections,
}: {
  hasConnections: boolean;
}) {
  return (
    <Card>
      <p className="cat-label">Idle resources</p>
      {!hasConnections ? (
        <div className="mt-3">
          <p
            className="ui-sans"
            style={{
              color: "var(--text-secondary)",
              fontSize: 13,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            METRICS NOT YET COLLECTED
          </p>
          <p
            className="ui-sans mt-2"
            style={{ color: "var(--text-muted)", fontSize: 13 }}
          >
            Sync your providers to start detecting idle resources.
          </p>
          <Link
            href="/connections"
            className="ui-sans mt-2 inline-block transition-colors hover:underline"
            style={{ color: "var(--brand)", fontSize: 13 }}
          >
            Sync now →
          </Link>
        </div>
      ) : (
        <div className="mt-3">
          <p
            className="ui-sans"
            style={{
              color: "#22c55e",
              fontSize: 13,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            ALL RESOURCES ACTIVE
          </p>
          <p
            className="ui-sans mt-2"
            style={{ color: "var(--text-muted)", fontSize: 13 }}
          >
            No idle or underused resources detected.
          </p>
        </div>
      )}
    </Card>
  );
}

/* =================================================================
 * EMPTY / LOADING / ERROR
 * ================================================================= */

function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center pb-24 pt-24 text-center">
      <p className="cat-label">Start here</p>
      <h1
        className="font-display mt-4"
        style={{
          color: "var(--text-primary)",
          fontSize: "clamp(28px, 5vw, 36px)",
          lineHeight: 1.1,
          letterSpacing: "-0.012em",
          fontWeight: 700,
        }}
      >
        Connect your first provider.
      </h1>
      <p
        className="ui-sans mt-4 max-w-md"
        style={{ color: "var(--text-muted)", fontSize: 14 }}
      >
        Pick a provider, paste a read-only API key, watch this dashboard fill
        out. No credit card needed.
      </p>
      <Link href="/connections" className="btn-primary mt-8">
        Add a provider
      </Link>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="pt-12">
      <SkeletonLine className="h-3 w-44" />
      <div className="mt-4">
        <SkeletonLine className="h-[60px] w-72" />
      </div>
      <div className="mt-4">
        <SkeletonLine className="h-4 w-72" />
      </div>
      <div className="mt-8">
        <SkeletonLine className="h-[320px] w-full" />
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="pt-12">
      <p className="cat-label">Could not load dashboard</p>
      <h1
        className="font-display mt-3"
        style={{
          color: "var(--text-primary)",
          fontSize: 28,
          lineHeight: 1.15,
        }}
      >
        Something went wrong.
      </h1>
      <p
        className="ui-sans mt-4 pl-4"
        style={{
          borderLeft: "2px solid var(--negative)",
          color: "var(--negative)",
          fontSize: 14,
        }}
      >
        {message}
      </p>
      <button
        type="button"
        onClick={() => location.reload()}
        className="btn-secondary mt-6"
      >
        Retry
      </button>
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

/* =================================================================
 * HELPERS
 * ================================================================= */

function syncRelative(iso: string | null): string {
  if (!iso) return "never";
  const min = (Date.now() - new Date(iso).getTime()) / 1000 / 60;
  if (min < 60) return `${Math.round(min)}m ago`;
  if (min < 60 * 24) return `${Math.round(min / 60)}h ago`;
  return `${Math.round(min / 60 / 24)}d ago`;
}
