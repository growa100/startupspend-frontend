"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ApiError,
  apiGet,
  apiPost,
  type AdminFinanceReport,
  type AdminMrr,
} from "@/lib/api";
import { SectionHeader } from "@/components/SectionHeader";
import { AdminSectionHeader } from "@/components/AdminSectionHeader";
import { SkeletonLine } from "@/components/Skeleton";
import { TOKENS } from "@/lib/tokens";

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function FinanceClient() {
  return (
    <div>
      <SectionHeader eyebrow="Admin · Money" title="Finance agent" />
      <div className="space-y-12">
        <MrrBlock />
        <MonthlyReportBlock />
      </div>
    </div>
  );
}

/* =============================================================
 * MRR
 * ============================================================= */

function MrrBlock() {
  const [data, setData] = useState<AdminMrr | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<AdminMrr>("/admin/finance/mrr")
      .then(setData)
      .catch((e: ApiError) => setError(e.detail));
  }, []);

  return (
    <section>
      <AdminSectionHeader label="MRR overview" />
      {error && (
        <p className="ui-sans border-l-2 border-negative pl-3 text-[13px] text-negative">
          {error}
        </p>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Stat label="Current MRR" value={data?.current_mrr} money />
        <Stat label="Last month MRR" value={data?.last_month_mrr} money />
        <Stat
          label="Trial conversions this month"
          value={data?.trial_conversions_this_month}
        />
      </div>

      <div className="mt-10">
        <p className="cat-label-muted">MRR · last 6 months</p>
        <div className="mt-4 h-[220px] w-full">
          {data ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.history}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
              >
                <CartesianGrid
                  stroke={TOKENS.rule}
                  strokeDasharray="2 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: TOKENS.inkMuted }}
                  stroke={TOKENS.rule}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: TOKENS.inkMuted }}
                  stroke={TOKENS.rule}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${Math.round(v)}`}
                />
                <Tooltip
                  cursor={{ stroke: TOKENS.rule, strokeWidth: 1 }}
                  contentStyle={{
                    background: TOKENS.white,
                    border: `1px solid ${TOKENS.rule}`,
                    borderRadius: 2,
                    fontSize: 12,
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                  formatter={(v: number) => [fmt.format(v), "MRR"]}
                />
                <Line
                  type="monotone"
                  dataKey="mrr"
                  stroke={TOKENS.accent}
                  strokeWidth={1.5}
                  dot={{ r: 3, fill: TOKENS.accent }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <SkeletonLine className="h-[220px] w-full" />
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  money,
}: {
  label: string;
  value: number | undefined;
  money?: boolean;
}) {
  return (
    <div className="border-t border-rule pt-4">
      <p className="cat-label-muted">{label}</p>
      <p
        className="font-display tabular mt-2 text-ink"
        style={{ fontSize: "32px", lineHeight: 1.1, letterSpacing: "-0.012em" }}
      >
        {value === undefined ? (
          <SkeletonLine className="h-8 w-28" />
        ) : money ? (
          fmt.format(value)
        ) : (
          value
        )}
      </p>
    </div>
  );
}

/* =============================================================
 * MONTHLY REPORT
 * ============================================================= */

function MonthlyReportBlock() {
  const [report, setReport] = useState<AdminFinanceReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function fetchReport() {
    try {
      setReport(await apiGet<AdminFinanceReport>("/admin/finance/report"));
    } catch (e) {
      setError((e as ApiError).detail);
    }
  }

  useEffect(() => {
    fetchReport();
  }, []);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      await apiPost("/admin/finance/generate");
      // Poll every 2s for up to 30s
      for (let i = 0; i < 15; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const next = await apiGet<AdminFinanceReport>("/admin/finance/report");
        if (
          next.generated_at &&
          (!report?.generated_at || next.generated_at !== report.generated_at)
        ) {
          setReport(next);
          break;
        }
      }
    } catch (e) {
      setError((e as ApiError).detail);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <AdminSectionHeader
        label="Monthly report"
        subtitle="Generated by the Finance agent on the 1st of each month."
        trailing={
          <button
            type="button"
            onClick={generate}
            disabled={busy}
            className="btn-primary"
          >
            {busy ? "Generating…" : "Generate now"}
          </button>
        }
      />
      {error && (
        <p className="ui-sans border-l-2 border-negative pl-3 text-[13px] text-negative">
          {error}
        </p>
      )}
      {!report ? (
        <SkeletonRows />
      ) : !report.body ? (
        <p className="ui-sans text-[14px] text-ink-muted">
          No report yet. Click <em>Generate now</em> to produce one.
        </p>
      ) : (
        <article className="border-t border-rule pt-6">
          <p className="cat-label-muted">
            Generated{" "}
            {report.generated_at
              ? new Date(report.generated_at).toLocaleString()
              : "—"}
          </p>
          <pre className="ui-sans mt-4 whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-ink">
            {report.body}
          </pre>
        </article>
      )}
    </section>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-baseline justify-between border-b border-rule pb-3"
        >
          <SkeletonLine className="h-4 w-48" />
          <SkeletonLine className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
