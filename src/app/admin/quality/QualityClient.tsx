"use client";

import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import {
  ApiError,
  apiGet,
  type AdminQualityAlert,
  type AdminQualityMetric,
} from "@/lib/api";
import { SectionHeader } from "@/components/SectionHeader";
import { AdminSectionHeader } from "@/components/AdminSectionHeader";
import { SkeletonLine } from "@/components/Skeleton";
import { TOKENS } from "@/lib/tokens";

const STATUS_LABEL = {
  ok: "OK",
  warning: "Warning",
  critical: "Critical",
} as const;

export function QualityClient() {
  return (
    <div>
      <SectionHeader eyebrow="Admin · Health" title="Quality agent" />
      <div className="space-y-12">
        <CurrentHealthBlock />
        <AlertHistoryBlock />
      </div>
    </div>
  );
}

/* =============================================================
 * CURRENT HEALTH
 * ============================================================= */

function CurrentHealthBlock() {
  const [rows, setRows] = useState<AdminQualityMetric[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<AdminQualityMetric[]>("/admin/quality/metrics")
      .then(setRows)
      .catch((e: ApiError) => setError(e.detail));
  }, []);

  return (
    <section>
      <AdminSectionHeader
        label="Current health"
        subtitle="Last 24 readings per metric."
      />
      {error && (
        <p className="ui-sans border-l-2 border-negative pl-3 text-[13px] text-negative">
          {error}
        </p>
      )}
      {rows === null ? (
        <SkeletonGrid />
      ) : rows.length === 0 ? (
        <p className="ui-sans text-[14px] text-ink-muted">
          No quality metrics recorded yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((m) => (
            <MetricCard key={m.metric_name} metric={m} />
          ))}
        </div>
      )}
    </section>
  );
}

function MetricCard({ metric }: { metric: AdminQualityMetric }) {
  const data = metric.history.map((p, i) => ({
    x: i,
    y: p.value,
  }));
  const status = metric.status;
  const statusColor =
    status === "critical"
      ? TOKENS.negative
      : status === "warning"
        ? TOKENS.amber
        : TOKENS.positive;

  return (
    <div className="border border-rule bg-white p-5">
      <p className="cat-label">{metric.metric_name}</p>
      <p
        className="font-display tabular mt-3 text-ink"
        style={{ fontSize: "32px", lineHeight: 1.1, letterSpacing: "-0.012em" }}
      >
        {formatValue(metric.current_value, metric.unit)}
      </p>
      <div className="mt-4 h-[40px] w-full">
        {data.length > 1 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
            >
              <YAxis hide domain={["auto", "auto"]} />
              <Line
                type="monotone"
                dataKey="y"
                stroke={statusColor}
                strokeWidth={1.25}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <span
        className="ui-sans mt-3 inline-block border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em]"
        style={{ borderColor: statusColor, color: statusColor }}
      >
        {STATUS_LABEL[status] ?? status}
      </span>
    </div>
  );
}

function formatValue(v: number, unit: string | null) {
  if (unit === "ms") return `${v.toFixed(0)}ms`;
  if (unit === "%") return `${v.toFixed(1)}%`;
  if (unit === "MB") return `${v.toFixed(0)} MB`;
  if (Number.isInteger(v)) return v.toString();
  return v.toFixed(2);
}

/* =============================================================
 * ALERT HISTORY
 * ============================================================= */

function AlertHistoryBlock() {
  const [rows, setRows] = useState<AdminQualityAlert[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<AdminQualityAlert[]>("/admin/quality/alerts")
      .then(setRows)
      .catch((e: ApiError) => setError(e.detail));
  }, []);

  return (
    <section>
      <AdminSectionHeader label="Alert history" subtitle="Last 20 alerts sent." />
      {error && (
        <p className="ui-sans border-l-2 border-negative pl-3 text-[13px] text-negative">
          {error}
        </p>
      )}
      {rows === null ? (
        <SkeletonRows />
      ) : rows.length === 0 ? (
        <p className="ui-sans text-[14px] text-ink-muted">
          No alerts sent yet.
        </p>
      ) : (
        <div className="-mx-6 overflow-x-auto px-6">
          <table className="ui-sans w-full min-w-[640px] text-[13px]">
            <thead>
              <tr className="border-b border-rule">
                <Th>Sent</Th>
                <Th>Metric</Th>
                <Th right>Value</Th>
                <Th>Channel</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-rule">
                  <td className="py-3 tabular text-ink-muted">
                    {new Date(a.sent_at).toLocaleString(undefined, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="py-3 text-ink">{a.metric}</td>
                  <td className="py-3 text-right tabular text-ink">
                    {a.value}
                  </td>
                  <td className="py-3 capitalize text-ink-muted">
                    {a.channel}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* =============================================================
 * UTIL
 * ============================================================= */

function Th({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: boolean;
}) {
  return (
    <th
      className={
        "cat-label-muted py-3 font-normal " +
        (right ? "text-right" : "text-left")
      }
    >
      {children}
    </th>
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

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="border border-rule bg-white p-5">
          <SkeletonLine className="h-3 w-32" />
          <div className="mt-3">
            <SkeletonLine className="h-8 w-24" />
          </div>
          <div className="mt-3">
            <SkeletonLine className="h-[40px] w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
