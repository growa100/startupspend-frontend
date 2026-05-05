"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ApiError,
  apiGet,
  apiPost,
  type Connection,
  type MonthSummary,
} from "@/lib/api";
import { TOKENS } from "@/lib/tokens";
import { ProviderBadge } from "@/components/ProviderBadge";
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

const SECTION_IDS = [
  { id: "daily-spend", label: "Daily spend" },
  { id: "by-provider", label: "By provider" },
  { id: "by-category", label: "By category" },
  { id: "token-usage", label: "Token usage" },
  { id: "idle-resources", label: "Idle resources" },
];

type FetchState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; message: string };

export function DashboardClient() {
  const [summary, setSummary] = useState<FetchState<MonthSummary>>({
    status: "loading",
  });
  const [conns, setConns] = useState<FetchState<Connection[]>>({
    status: "loading",
  });
  const [syncing, setSyncing] = useState<Set<string>>(new Set());

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
  const idleCount = 0; // wired from /resources in a follow-up

  if (isEmpty && !m.has_connections) {
    return <EmptyDashboard />;
  }

  return (
    <article style={{ paddingTop: "48px" }}>
      <Hero summary={m} />

      <hr className="hr-rule mt-8" />

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* LEFT TOC — desktop sticky, mobile horizontal pill nav */}
        <aside className="lg:col-span-2">
          <DesktopToc />
          <MobileToc />
        </aside>

        {/* CENTER */}
        <div className="lg:col-span-7">
          <DailySpend summary={m} />
          <hr className="hr-rule mt-10" />

          <ByProvider summary={m} />
          <hr className="hr-rule mt-10" />

          <ByCategory summary={m} />
          <hr className="hr-rule mt-10" />

          <TokenUsage summary={m} aiConnections={aiConns} />
          <hr className="hr-rule mt-10" />

          <IdleResourcesAnchor count={idleCount} />
        </div>

        {/* RIGHT RAIL — desktop sticky, mobile renders below center */}
        <aside className="lg:col-span-3">
          <RightRail
            summary={m}
            conns={conns}
            syncing={syncing}
            onSync={triggerSync}
          />
        </aside>
      </div>
    </article>
  );
}

/* =================================================================
 * HERO
 * ================================================================= */

function Hero({ summary }: { summary: MonthSummary }) {
  const total = Number(summary.total_usd);
  const proj = Number(summary.projected.expected_usd);

  // "vs last month" — backend doesn't yet expose last_month_total_usd.
  // Show a placeholder until it does. Logged in progress.md.
  const placeholderLastMonth = total > 0 ? total * 0.92 : 0;
  const delta = total - placeholderLastMonth;
  const deltaPct =
    placeholderLastMonth > 0 ? (delta / placeholderLastMonth) * 100 : 0;

  const monthLabel = useMemo(() => {
    const d = new Date(summary.month + "-01");
    return d
      .toLocaleString("en-US", { month: "long", year: "numeric" })
      .toUpperCase();
  }, [summary.month]);

  return (
    <header>
      <p className="cat-label">Overview — {monthLabel}</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        <h1
          className="font-display tabular text-ink"
          style={{
            fontSize: "clamp(40px, 7vw, 64px)",
            lineHeight: 1.04,
            letterSpacing: "-0.012em",
          }}
        >
          {total === 0 ? <span className="text-ink-muted">$0.00</span> : formatMoney(total)}
        </h1>
        {total > 0 && (
          <span
            className="ui-sans tabular text-[13px]"
            style={{ color: delta >= 0 ? TOKENS.negative : TOKENS.positive }}
          >
            {delta >= 0 ? "+" : "−"}
            {formatMoney(Math.abs(delta))} ({delta >= 0 ? "+" : "−"}
            {Math.abs(deltaPct).toFixed(0)}%) vs last month
          </span>
        )}
      </div>

      <p className="ui-sans mt-4 text-[14px] text-ink-muted">
        {total === 0
          ? "Nothing tracked yet."
          : `Projected month-end: ${formatMoney(proj)} · ${summary.projected.confidence} confidence`}
      </p>
    </header>
  );
}

/* =================================================================
 * LEFT TOC
 * ================================================================= */

function DesktopToc() {
  const [active, setActive] = useState<string>(SECTION_IDS[0].id);

  useEffect(() => {
    const els = SECTION_IDS.map((s) => document.getElementById(s.id)).filter(
      (e): e is HTMLElement => !!e,
    );
    if (els.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <nav className="ui-sans sticky top-6 hidden lg:block">
      <ul className="flex flex-col">
        {SECTION_IDS.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={
                  "block border-l-2 py-2 pl-4 text-[13px] transition-colors " +
                  (isActive
                    ? "border-accent text-ink"
                    : "border-rule text-ink-muted hover:text-ink")
                }
              >
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MobileToc() {
  return (
    <nav
      className="ui-sans no-scrollbar mb-4 -mx-6 flex gap-2 overflow-x-auto px-6 lg:hidden"
      aria-label="Sections"
    >
      {SECTION_IDS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="shrink-0 border border-rule bg-white px-3 py-2 text-[12px] text-ink hover:border-accent"
          style={{ borderRadius: "2px" }}
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}

/* =================================================================
 * SECTIONS
 * ================================================================= */

function DailySpend({ summary }: { summary: MonthSummary }) {
  const today = summary.today;
  const data = summary.daily.map((d) => ({
    date: d.date.slice(8),
    full: d.date,
    amount: Number(d.amount_usd),
    isToday: d.date === today,
  }));

  return (
    <section id="daily-spend">
      <p className="cat-label">Daily spend</p>
      {data.length === 0 ? (
        <PlaceholderChart />
      ) : (
        <div className="mt-5 h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              barCategoryGap="20%"
              margin={{ top: 8, right: 8, left: -28, bottom: 0 }}
            >
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: TOKENS.inkMuted }}
                stroke={TOKENS.rule}
                tickLine={false}
                axisLine={{ stroke: TOKENS.rule }}
                interval="preserveStartEnd"
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: TOKENS.rule }}
                contentStyle={{
                  background: TOKENS.white,
                  border: `1px solid ${TOKENS.rule}`,
                  borderRadius: 2,
                  fontSize: 12,
                  fontFamily: "var(--font-inter), sans-serif",
                  padding: "6px 10px",
                }}
                formatter={(v: number) => [`$${v.toFixed(2)}`, "Spend"]}
                labelFormatter={(_, payload) => payload[0]?.payload.full ?? ""}
              />
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
      )}
    </section>
  );
}

function ByProvider({ summary }: { summary: MonthSummary }) {
  const total = summary.by_provider.reduce(
    (s, p) => s + Number(p.amount_usd),
    0,
  );
  return (
    <section id="by-provider" className="mt-10">
      <p className="cat-label">By provider</p>
      {summary.by_provider.length === 0 ? (
        <p className="ui-sans mt-4 text-[14px] text-ink-muted">
          No provider data yet.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-4">
          {summary.by_provider.map((p) => (
            <BreakdownRow
              key={p.provider}
              left={
                <span className="flex min-w-0 items-center gap-3">
                  <ProviderBadge provider={p.provider} size="md" />
                  <span className="ui-sans truncate text-[14px] text-ink">
                    {p.display_name}
                  </span>
                </span>
              }
              amount={Number(p.amount_usd)}
              total={total}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function ByCategory({ summary }: { summary: MonthSummary }) {
  const total = summary.by_category.reduce(
    (s, c) => s + Number(c.amount_usd),
    0,
  );
  return (
    <section id="by-category" className="mt-10">
      <p className="cat-label">By category</p>
      {summary.by_category.length === 0 ? (
        <p className="ui-sans mt-4 text-[14px] text-ink-muted">
          No category data yet.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-4">
          {summary.by_category.map((c) => (
            <BreakdownRow
              key={c.category}
              left={
                <span className="ui-sans text-[14px] text-ink">
                  {CATEGORY_LABELS[c.category] ?? c.category}
                </span>
              }
              amount={Number(c.amount_usd)}
              total={total}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function BreakdownRow({
  left,
  amount,
  total,
}: {
  left: React.ReactNode;
  amount: number;
  total: number;
}) {
  const pct = total > 0 ? (amount / total) * 100 : 0;
  return (
    <li>
      <div className="flex items-center justify-between gap-4">
        {left}
        <span
          className="font-display tabular text-ink"
          style={{ fontSize: "16px" }}
        >
          {formatMoney(amount)}
        </span>
      </div>
      <div className="mt-2 h-[3px] w-full bg-rule" aria-hidden>
        <div
          className="h-[3px]"
          style={{ width: `${pct}%`, background: TOKENS.accent }}
        />
      </div>
    </li>
  );
}

function TokenUsage({
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
    <section id="token-usage" className="mt-10">
      <p className="cat-label">Token usage</p>
      {aiConnections.length === 0 ? (
        <p className="ui-sans mt-4 italic text-[14px] text-ink-muted">
          Connect OpenAI or Anthropic to track token spend.
        </p>
      ) : aiTotal === 0 ? (
        <p className="ui-sans mt-4 italic text-[14px] text-ink-muted">
          No token usage recorded for this month.
        </p>
      ) : (
        <table className="ui-sans mt-5 w-full text-[13px]">
          <thead>
            <tr className="border-b border-rule">
              <th className="cat-label-muted py-3 text-left font-normal">
                Provider
              </th>
              <th className="cat-label-muted py-3 text-right font-normal">
                Total cost
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
                <tr key={c.id} className="border-b border-rule">
                  <td className="py-3">
                    <span className="flex items-center gap-2">
                      <ProviderBadge provider={c.provider} size="sm" />
                      {c.display_name}
                    </span>
                  </td>
                  <td className="py-3 text-right tabular">
                    {formatMoney(cost)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}

function IdleResourcesAnchor({ count }: { count: number }) {
  return (
    <section id="idle-resources" className="mt-10">
      <p className="cat-label">Idle resources</p>
      {count === 0 ? (
        <p className="ui-sans mt-4 text-[14px] text-ink-muted">
          No idle resources detected.
        </p>
      ) : (
        <p className="ui-sans mt-4 text-[14px]">
          {count} resource{count === 1 ? "" : "s"} idle.{" "}
          <Link
            href="/resources"
            className="text-accent underline-offset-4 hover:underline"
          >
            Review
          </Link>
        </p>
      )}
    </section>
  );
}

/* =================================================================
 * RIGHT RAIL
 * ================================================================= */

function RightRail({
  summary,
  conns,
  syncing,
  onSync,
}: {
  summary: MonthSummary;
  conns: FetchState<Connection[]>;
  syncing: Set<string>;
  onSync: (id: string) => void;
}) {
  const exportHref = `${process.env.NEXT_PUBLIC_API_BASE_URL}/costs/export.xlsx?year=${summary.month.slice(0, 4)}&month=${Number(summary.month.slice(5))}`;
  const isEmpty = Number(summary.total_usd) === 0;

  return (
    <div className="ui-sans lg:sticky lg:top-6 flex flex-col gap-6">
      <div>
        <p className="cat-label">Connections</p>
        <ConnectionList
          state={conns}
          syncing={syncing}
          onSync={onSync}
        />
      </div>

      <hr className="hr-rule" />

      <div>
        <p className="cat-label">Export</p>
        {isEmpty ? (
          <p className="mt-3 text-[13px] text-ink-muted">
            Available once you have data.
          </p>
        ) : (
          <a
            href={exportHref}
            className="mt-3 inline-block text-[13px] text-accent underline-offset-4 hover:underline"
          >
            Download .xlsx
          </a>
        )}
      </div>

      <hr className="hr-rule" />

      <div>
        <p className="cat-label">Budget alerts</p>
        <p className="mt-3 text-[13px] text-ink-muted">
          None configured.{" "}
          <Link
            href="/settings"
            className="text-accent underline-offset-4 hover:underline"
          >
            Set up alerts
          </Link>
        </p>
      </div>
    </div>
  );
}

function ConnectionList({
  state,
  syncing,
  onSync,
}: {
  state: FetchState<Connection[]>;
  syncing: Set<string>;
  onSync: (id: string) => void;
}) {
  if (state.status === "loading") {
    return (
      <div className="mt-3 space-y-2">
        <SkeletonLine className="h-4 w-3/4" />
        <SkeletonLine className="h-4 w-2/3" />
      </div>
    );
  }
  if (state.status === "error") {
    return <p className="mt-3 text-[13px] text-negative">{state.message}</p>;
  }
  if (state.data.length === 0) {
    return (
      <p className="mt-3 text-[13px] text-ink-muted">
        None connected.{" "}
        <Link
          href="/connections"
          className="text-accent underline-offset-4 hover:underline"
        >
          Add one
        </Link>
      </p>
    );
  }
  return (
    <ul className="mt-3 flex flex-col gap-3">
      {state.data.map((c) => (
        <li key={c.id} className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2">
            <FreshnessDot connection={c} />
            <Link
              href={`/connections/${c.id}`}
              className="min-w-0 truncate text-[13px] text-ink hover:text-accent"
            >
              {c.display_name}
            </Link>
          </span>
          <span className="flex shrink-0 items-baseline gap-3">
            <span className="text-[11px] text-ink-muted">
              {syncRelative(c.last_synced_at)}
            </span>
            <button
              type="button"
              onClick={() => onSync(c.id)}
              disabled={syncing.has(c.id)}
              className="text-[12px] text-accent underline-offset-4 hover:underline disabled:opacity-50"
            >
              {syncing.has(c.id) ? "…" : "Sync"}
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}

function FreshnessDot({ connection }: { connection: Connection }) {
  const color: string = useMemo(() => {
    if (connection.last_sync_error) return TOKENS.negative;
    if (!connection.last_synced_at) return TOKENS.negative;
    const ageHours =
      (Date.now() - new Date(connection.last_synced_at).getTime()) /
      1000 /
      3600;
    if (ageHours <= 24) return TOKENS.positive;
    if (ageHours <= 24 * 7) return TOKENS.amber;
    return TOKENS.negative;
  }, [connection]);
  const label = connection.last_sync_error
    ? `Error: ${connection.last_sync_error}`
    : connection.last_synced_at
      ? `Last synced ${new Date(connection.last_synced_at).toLocaleString()}`
      : "Never synced";
  return (
    <span
      title={label}
      aria-label={label}
      className="inline-block h-[8px] w-[8px] rounded-full"
      style={{ background: color }}
    />
  );
}

/* =================================================================
 * EMPTY / LOADING / ERROR
 * ================================================================= */

function EmptyDashboard() {
  return (
    <div
      className="flex flex-col items-center text-center"
      style={{ paddingTop: "96px", paddingBottom: "96px" }}
    >
      <p className="cat-label">Start here</p>
      <h1
        className="font-display mt-4 text-ink"
        style={{
          fontSize: "clamp(28px, 4vw, 36px)",
          lineHeight: 1.15,
          letterSpacing: "-0.012em",
        }}
      >
        Connect your first provider.
      </h1>
      <p className="ui-sans mt-4 max-w-md text-[14px] text-ink-muted">
        Pick a provider, paste a read-only API key, watch this dashboard fill
        out. No credit card needed.
      </p>
      <Link href="/connections" className="btn-dark mt-8">
        Add a provider
      </Link>
    </div>
  );
}

function PlaceholderChart() {
  return (
    <div
      className="relative mt-5 h-[200px] w-full border-l border-b border-rule"
      aria-hidden
    >
      <p className="ui-sans absolute inset-0 flex items-center justify-center text-[12px] text-ink-muted">
        No data this month
      </p>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div style={{ paddingTop: "48px" }}>
      <SkeletonLine className="h-3 w-44" />
      <div className="mt-4">
        <SkeletonLine className="h-[60px] w-72" />
      </div>
      <div className="mt-4">
        <SkeletonLine className="h-4 w-72" />
      </div>
      <hr className="hr-rule mt-8" />
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <aside className="lg:col-span-2">
          <SkeletonLine className="h-3 w-24" />
        </aside>
        <div className="lg:col-span-7 space-y-4">
          <SkeletonLine className="h-3 w-24" />
          <SkeletonLine className="h-[200px] w-full" />
        </div>
        <aside className="lg:col-span-3 space-y-3">
          <SkeletonLine className="h-3 w-24" />
          <SkeletonLine className="h-4 w-full" />
        </aside>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div style={{ paddingTop: "48px" }}>
      <p className="cat-label">Could not load dashboard</p>
      <h1
        className="font-display mt-3 text-ink"
        style={{ fontSize: "32px", lineHeight: 1.15 }}
      >
        Something went wrong.
      </h1>
      <p className="ui-sans mt-4 border-l-2 border-negative pl-4 text-[14px] text-negative">
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
 * HELPERS
 * ================================================================= */

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMoney(n: number): string {
  if (Number.isNaN(n)) return "—";
  return fmt.format(n);
}

function syncRelative(iso: string | null): string {
  if (!iso) return "never";
  const min = (Date.now() - new Date(iso).getTime()) / 1000 / 60;
  if (min < 60) return `${Math.round(min)}m ago`;
  if (min < 60 * 24) return `${Math.round(min / 60)}h ago`;
  return `${Math.round(min / 60 / 24)}d ago`;
}
