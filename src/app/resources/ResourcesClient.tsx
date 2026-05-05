"use client";

import { useEffect, useState } from "react";
import { ApiError, apiGet, type Resource } from "@/lib/api";
import { SectionHeader } from "@/components/SectionHeader";
import { SkeletonLine } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";

type Tab = "idle" | "underused" | "active";

const TAB_LABELS: Record<Tab, string> = {
  idle: "Idle",
  underused: "Underused",
  active: "Active",
};

type State =
  | { status: "loading" }
  | { status: "ready"; data: Resource[] }
  | { status: "error"; message: string };

export function ResourcesClient() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [tab, setTab] = useState<Tab>("idle");

  useEffect(() => {
    apiGet<Resource[]>("/resources")
      .then((data) => setState({ status: "ready", data }))
      .catch((e: ApiError) =>
        setState({ status: "error", message: e.detail }),
      );
  }, []);

  const counts: Record<Tab, number> =
    state.status === "ready"
      ? state.data.reduce(
          (acc, r) => ({
            ...acc,
            [r.classification]: acc[r.classification] + 1,
          }),
          { idle: 0, underused: 0, active: 0 } as Record<Tab, number>,
        )
      : { idle: 0, underused: 0, active: 0 };

  const filtered =
    state.status === "ready"
      ? state.data.filter((r) => r.classification === tab)
      : [];

  return (
    <div className="ui-sans">
      <SectionHeader eyebrow="Optimization" title="Resources" />

      <p className="mb-6 max-w-2xl text-[14px] text-ink-muted">
        Idle = avg CPU below 5% and avg network below 10 MB/day, sustained
        7+ days. Underused = below 20% and 100 MB/day.
      </p>

      <nav
        className="mb-6 flex gap-6 border-t border-rule pt-4 text-[13px]"
        role="tablist"
      >
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={
              "border-b-2 pb-2 transition-colors " +
              (t === tab
                ? "border-accent text-ink"
                : "border-transparent text-ink-muted hover:text-ink")
            }
          >
            {TAB_LABELS[t]}{" "}
            <span className="text-ink-muted">({counts[t]})</span>
          </button>
        ))}
      </nav>

      {state.status === "loading" && (
        <ul className="space-y-3">
          {[0, 1, 2].map((i) => (
            <li key={i} className="border-b border-rule py-3">
              <SkeletonLine className="h-4 w-64" />
            </li>
          ))}
        </ul>
      )}

      {state.status === "error" && (
        <p className="border-l-2 border-negative pl-4 text-[13px] text-negative">
          {state.message}
        </p>
      )}

      {state.status === "ready" && filtered.length === 0 && (
        <EmptyState
          title={
            tab === "idle"
              ? "No idle resources detected. That's a good thing."
              : tab === "underused"
                ? "Nothing flagged as underused."
                : "No active resources observed yet. Connect a provider with metrics to see them here."
          }
          ctaLabel={tab === "active" ? "Add a connection" : undefined}
          ctaHref={tab === "active" ? "/connections" : undefined}
        />
      )}

      {state.status === "ready" && filtered.length > 0 && (
        <div className="-mx-6 overflow-x-auto px-6">
          <table className="w-full min-w-[640px] border-t border-rule text-[14px]">
            <thead>
              <tr className="border-b border-rule">
                <th className="cat-label-muted py-3 text-left font-normal">
                  Resource
                </th>
                <th className="cat-label-muted py-3 text-left font-normal">
                  Type
                </th>
                <th className="cat-label-muted py-3 text-right font-normal tabular">
                  Avg CPU
                </th>
                <th className="cat-label-muted py-3 text-right font-normal tabular">
                  Avg Net out
                </th>
                <th className="cat-label-muted py-3 text-right font-normal tabular">
                  Days
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={`${r.connection_id}-${r.resource_id}`}
                  className="border-b border-rule"
                >
                  <td className="py-3 text-ink">{r.resource_id}</td>
                  <td className="py-3 text-ink-muted">{r.resource_type}</td>
                  <td className="py-3 text-right tabular text-ink">
                    {r.avg_cpu_pct
                      ? `${Number(r.avg_cpu_pct).toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className="py-3 text-right tabular text-ink">
                    {r.avg_net_out_bytes !== null
                      ? `${(r.avg_net_out_bytes / 1024 / 1024).toFixed(1)} MB`
                      : "—"}
                  </td>
                  <td className="py-3 text-right tabular text-ink-muted">
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
