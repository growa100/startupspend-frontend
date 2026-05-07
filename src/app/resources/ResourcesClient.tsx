"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError, apiGet, type ResourcesResponse } from "@/lib/api";
import { SectionHeader } from "@/components/SectionHeader";
import { SkeletonLine } from "@/components/Skeleton";

type Tab = "idle" | "underused" | "active";

const TAB_LABELS: Record<Tab, string> = {
  idle: "Idle",
  underused: "Underused",
  active: "Active",
};

type State =
  | { status: "loading" }
  | { status: "ready"; data: ResourcesResponse }
  | { status: "error"; message: string };

export function ResourcesClient() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [tab, setTab] = useState<Tab>("idle");

  useEffect(() => {
    apiGet<ResourcesResponse>("/resources")
      .then((data) => setState({ status: "ready", data }))
      .catch((e: ApiError) =>
        setState({ status: "error", message: e.detail }),
      );
  }, []);

  const counts: Record<Tab, number> =
    state.status === "ready"
      ? state.data.items.reduce(
          (acc, r) => ({
            ...acc,
            [r.classification]: acc[r.classification] + 1,
          }),
          { idle: 0, underused: 0, active: 0 } as Record<Tab, number>,
        )
      : { idle: 0, underused: 0, active: 0 };

  const filtered =
    state.status === "ready"
      ? state.data.items.filter((r) => r.classification === tab)
      : [];

  return (
    <div className="ui-sans">
      <SectionHeader eyebrow="Optimization" title="Resources" />

      <p
        className="mb-6 max-w-2xl"
        style={{ fontSize: 14, color: "var(--text-muted)" }}
      >
        Idle = avg CPU below 5% and avg network below 10 MB/day, sustained
        7+ days. Underused = below 20% and 100 MB/day.
      </p>

      <nav
        className="mb-6 flex gap-6 pt-4 text-[13px]"
        style={{ borderTop: "1px solid var(--border)" }}
        role="tablist"
      >
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="pb-2 transition-colors"
            style={{
              borderBottom: `2px solid ${t === tab ? "var(--brand)" : "transparent"}`,
              color: t === tab ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            {TAB_LABELS[t]}{" "}
            <span style={{ color: "var(--text-muted)" }}>({counts[t]})</span>
          </button>
        ))}
      </nav>

      {state.status === "loading" && (
        <ul className="space-y-3">
          {[0, 1, 2].map((i) => (
            <li
              key={i}
              className="py-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <SkeletonLine className="h-4 w-64" />
            </li>
          ))}
        </ul>
      )}

      {state.status === "error" && (
        <p
          className="pl-4"
          style={{
            borderLeft: "2px solid var(--negative)",
            color: "var(--negative)",
            fontSize: 13,
          }}
        >
          {state.message}
        </p>
      )}

      {state.status === "ready" && filtered.length === 0 && (
        <ResourcesEmptyState
          tab={tab}
          hasMetrics={state.data.has_metrics}
          connectionCount={state.data.connection_count}
        />
      )}

      {state.status === "ready" && filtered.length > 0 && (
        <div className="card overflow-x-auto" style={{ padding: 0 }}>
          <table className="w-full min-w-[640px]" style={{ fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="cat-label-muted px-5 py-3 text-left font-normal">
                  Resource
                </th>
                <th className="cat-label-muted px-5 py-3 text-left font-normal">
                  Type
                </th>
                <th className="cat-label-muted px-5 py-3 text-right font-normal tabular">
                  Avg CPU
                </th>
                <th className="cat-label-muted px-5 py-3 text-right font-normal tabular">
                  Avg Net out
                </th>
                <th className="cat-label-muted px-5 py-3 text-right font-normal tabular">
                  Days
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr
                  key={`${r.connection_id}-${r.resource_id}`}
                  style={{
                    borderTop: i === 0 ? "none" : "1px solid var(--border)",
                  }}
                >
                  <td
                    className="px-5 py-3"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {r.resource_id}
                  </td>
                  <td
                    className="px-5 py-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {r.resource_type}
                  </td>
                  <td
                    className="mono px-5 py-3 text-right"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {r.avg_cpu_pct
                      ? `${Number(r.avg_cpu_pct).toFixed(1)}%`
                      : "—"}
                  </td>
                  <td
                    className="mono px-5 py-3 text-right"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {r.avg_net_out_bytes !== null
                      ? `${(r.avg_net_out_bytes / 1024 / 1024).toFixed(1)} MB`
                      : "—"}
                  </td>
                  <td
                    className="mono px-5 py-3 text-right"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {r.days_observed}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ResourcesEmptyState({
  tab,
  hasMetrics,
  connectionCount,
}: {
  tab: Tab;
  hasMetrics: boolean;
  connectionCount: number;
}) {
  // Distinguish "metrics not yet collected" (no rows in resource_metrics for
  // this user) from "we have data but nothing flagged in this tab".
  if (!hasMetrics) {
    return (
      <div className="card">
        <p
          className="ui-sans"
          style={{
            color: "var(--text-secondary)",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 600,
          }}
        >
          Metrics not yet collected
        </p>
        <p
          className="ui-sans mt-3 max-w-xl"
          style={{ fontSize: 14, color: "var(--text-muted)" }}
        >
          Resource monitoring starts after your first sync. Check back after
          syncing your cloud providers.
        </p>
        <Link
          href="/connections"
          className="ui-sans mt-4 inline-block hover:underline"
          style={{ fontSize: 13, color: "var(--brand)" }}
        >
          Sync now →
        </Link>
      </div>
    );
  }

  if (tab === "idle" || tab === "underused") {
    const providers =
      connectionCount === 1
        ? "1 connected provider"
        : `${connectionCount} connected providers`;
    return (
      <div className="card">
        <p
          className="ui-sans"
          style={{
            color: "var(--positive)",
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 600,
          }}
        >
          All resources active
        </p>
        <p
          className="ui-sans mt-3 max-w-xl"
          style={{ fontSize: 14, color: "var(--text-muted)" }}
        >
          No idle or underused resources detected across your {providers}.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <p className="cat-label">No active resources observed</p>
      <p
        className="ui-sans mt-3 max-w-xl"
        style={{ fontSize: 14, color: "var(--text-muted)" }}
      >
        We have metrics, but nothing currently classifies as active.
      </p>
    </div>
  );
}
