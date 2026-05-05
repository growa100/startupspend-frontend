"use client";

import { useEffect, useState } from "react";
import {
  ApiError,
  apiGet,
  apiPatch,
  type AdminAgentLog,
  type AdminAgentStatus,
  type AdminDeployLogRow,
  type AdminSyncHealthRow,
} from "@/lib/api";
import { SectionHeader } from "@/components/SectionHeader";
import { AdminSectionHeader } from "@/components/AdminSectionHeader";
import { SkeletonLine } from "@/components/Skeleton";
import { StatusDot } from "@/components/StatusDot";
import { Toggle } from "@/components/Toggle";

export function SystemClient() {
  return (
    <div>
      <SectionHeader eyebrow="Admin" title="System" />
      <div className="space-y-12">
        <AgentStatusBlock />
        <AgentLogsBlock />
        <SyncHealthBlock />
        <DeployLogBlock />
      </div>
    </div>
  );
}

/* =============================================================
 * AGENT STATUS
 * ============================================================= */

function AgentStatusBlock() {
  const [rows, setRows] = useState<AdminAgentStatus[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setRows(await apiGet<AdminAgentStatus[]>("/admin/agents/status"));
    } catch (e) {
      setError((e as ApiError).detail);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function toggle(name: string, next: boolean) {
    // Optimistic
    setRows((prev) =>
      prev?.map((r) => (r.agent === name ? { ...r, enabled: next } : r)) ??
      null,
    );
    try {
      await apiPatch(`/admin/agents/${name}/toggle`, { enabled: next });
    } catch (e) {
      setError((e as ApiError).detail);
      refresh();
    }
  }

  return (
    <section>
      <AdminSectionHeader label="Agent status" />
      {error && (
        <p className="ui-sans border-l-2 border-negative pl-3 text-[13px] text-negative">
          {error}
        </p>
      )}
      {rows === null ? (
        <SkeletonRows />
      ) : rows.length === 0 ? (
        <p className="ui-sans text-[14px] text-ink-muted">No agents configured.</p>
      ) : (
        <div className="-mx-6 overflow-x-auto px-6">
          <table className="ui-sans w-full min-w-[820px] text-[13px]">
            <thead>
              <tr className="border-b border-rule">
                <Th>Agent</Th>
                <Th>Enabled</Th>
                <Th>Last run</Th>
                <Th>Status</Th>
                <Th>Next run</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.agent} className="border-b border-rule">
                  <td className="py-3 capitalize text-ink">{r.agent}</td>
                  <td className="py-3">
                    <Toggle
                      checked={r.enabled}
                      onChange={(next) => toggle(r.agent, next)}
                      ariaLabel={`Toggle ${r.agent}`}
                    />
                  </td>
                  <td className="py-3 tabular text-ink-muted">
                    {r.last_run_at
                      ? new Date(r.last_run_at).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "—"}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-2">
                      <StatusDot
                        status={r.last_run_status}
                        label={r.last_run_summary ?? r.last_run_status}
                      />
                      <span className="text-ink-muted">{r.last_run_status}</span>
                    </span>
                  </td>
                  <td className="py-3 tabular text-ink-muted">
                    {r.next_scheduled_at
                      ? new Date(r.next_scheduled_at).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "—"}
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
 * AGENT LOGS
 * ============================================================= */

function AgentLogsBlock() {
  const [rows, setRows] = useState<AdminAgentLog[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    apiGet<AdminAgentLog[]>("/admin/agents/logs")
      .then(setRows)
      .catch((e: ApiError) => setError(e.detail));
  }, []);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section>
      <AdminSectionHeader label="Recent agent logs" subtitle="Last 50 runs." />
      {error && (
        <p className="ui-sans border-l-2 border-negative pl-3 text-[13px] text-negative">
          {error}
        </p>
      )}
      {rows === null ? (
        <SkeletonRows />
      ) : rows.length === 0 ? (
        <p className="ui-sans text-[14px] text-ink-muted">No agent runs recorded.</p>
      ) : (
        <div className="-mx-6 overflow-x-auto px-6">
          <table className="ui-sans w-full min-w-[820px] text-[13px]">
            <thead>
              <tr className="border-b border-rule">
                <Th>Agent</Th>
                <Th>Job</Th>
                <Th>Started</Th>
                <Th>Duration</Th>
                <Th>Status</Th>
                <Th>Summary</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const open = expanded.has(r.id);
                const summary = r.summary ?? "";
                const truncated = summary.length > 80 && !open;
                return (
                  <tr key={r.id} className="border-b border-rule align-top">
                    <td className="py-3 capitalize text-ink">{r.agent}</td>
                    <td className="py-3 text-ink-muted">{r.job_name}</td>
                    <td className="py-3 tabular text-ink-muted">
                      {new Date(r.started_at).toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-3 tabular text-ink-muted">
                      {r.duration_ms !== null
                        ? `${(r.duration_ms / 1000).toFixed(1)}s`
                        : "—"}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-2">
                        <StatusDot status={r.status} />
                        <span className="text-ink-muted">{r.status}</span>
                      </span>
                    </td>
                    <td className="py-3 text-ink-muted">
                      <button
                        type="button"
                        onClick={() => toggle(r.id)}
                        className="text-left hover:text-ink"
                      >
                        {truncated ? `${summary.slice(0, 80)}…` : summary || "—"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* =============================================================
 * SYNC HEALTH
 * ============================================================= */

function SyncHealthBlock() {
  const [rows, setRows] = useState<AdminSyncHealthRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<AdminSyncHealthRow[]>("/admin/sync/health")
      .then(setRows)
      .catch((e: ApiError) => setError(e.detail));
  }, []);

  return (
    <section>
      <AdminSectionHeader
        label="Sync health"
        subtitle="Provider success rates over the last 7 days."
      />
      {error && (
        <p className="ui-sans border-l-2 border-negative pl-3 text-[13px] text-negative">
          {error}
        </p>
      )}
      {rows === null ? (
        <SkeletonRows />
      ) : rows.length === 0 ? (
        <p className="ui-sans text-[14px] text-ink-muted">No sync runs in the last 7 days.</p>
      ) : (
        <div className="-mx-6 overflow-x-auto px-6">
          <table className="ui-sans w-full min-w-[760px] text-[13px]">
            <thead>
              <tr className="border-b border-rule">
                <Th>Provider</Th>
                <Th right>Total</Th>
                <Th right>Success</Th>
                <Th right>Errors</Th>
                <Th right>Success rate</Th>
                <Th>Last error</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.provider} className="border-b border-rule">
                  <td className="py-3 capitalize text-ink">{r.provider}</td>
                  <td className="py-3 text-right tabular text-ink-muted">{r.total}</td>
                  <td className="py-3 text-right tabular text-positive">{r.success}</td>
                  <td className="py-3 text-right tabular text-negative">{r.error}</td>
                  <td className="py-3 text-right tabular text-ink">
                    {(r.success_rate * 100).toFixed(0)}%
                  </td>
                  <td
                    className="py-3 text-ink-muted"
                    title={r.last_error ?? ""}
                  >
                    {r.last_error
                      ? r.last_error.length > 60
                        ? `${r.last_error.slice(0, 60)}…`
                        : r.last_error
                      : "—"}
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
 * DEPLOY LOG
 * ============================================================= */

function DeployLogBlock() {
  const [rows, setRows] = useState<AdminDeployLogRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<AdminDeployLogRow[]>("/admin/deploy/log")
      .then(setRows)
      .catch((e: ApiError) => setError(e.detail));
  }, []);

  return (
    <section>
      <AdminSectionHeader label="Deploy log" subtitle="Last 10 deploys." />
      {error && (
        <p className="ui-sans border-l-2 border-negative pl-3 text-[13px] text-negative">
          {error}
        </p>
      )}
      {rows === null ? (
        <SkeletonRows />
      ) : rows.length === 0 ? (
        <p className="ui-sans text-[14px] text-ink-muted">No deploys recorded yet.</p>
      ) : (
        <div className="-mx-6 overflow-x-auto px-6">
          <table className="ui-sans w-full min-w-[640px] text-[13px]">
            <thead>
              <tr className="border-b border-rule">
                <Th>SHA</Th>
                <Th>Deployed at</Th>
                <Th>Triggered by</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-rule">
                  <td className="py-3">
                    {r.pr_url ? (
                      <a
                        href={r.pr_url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-accent underline-offset-4 hover:underline"
                      >
                        {r.commit_sha.slice(0, 7)}
                      </a>
                    ) : (
                      <span className="font-mono text-ink">
                        {r.commit_sha.slice(0, 7)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 tabular text-ink-muted">
                    {new Date(r.deployed_at).toLocaleString(undefined, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="py-3 capitalize text-ink-muted">
                    {r.triggered_by}
                  </td>
                  <td className="py-3">
                    <StatusDot
                      status={r.success ? "ok" : "error"}
                      label={r.success ? "Success" : "Failed"}
                    />
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
