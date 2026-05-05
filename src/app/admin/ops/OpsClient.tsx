"use client";

import { useEffect, useState } from "react";
import {
  ApiError,
  apiGet,
  apiPatch,
  apiPost,
  type AdminOpsRun,
  type AdminOpsState,
} from "@/lib/api";
import { SectionHeader } from "@/components/SectionHeader";
import { AdminSectionHeader } from "@/components/AdminSectionHeader";
import { SkeletonLine } from "@/components/Skeleton";
import { Toggle } from "@/components/Toggle";
import { TOKENS } from "@/lib/tokens";

export function OpsClient() {
  return (
    <div>
      <SectionHeader eyebrow="Admin · Autonomy" title="Ops agent" />
      <div className="space-y-12">
        <ControlBlock />
        <PendingReviewBlock />
        <SuggestionsBlock />
      </div>
    </div>
  );
}

/* =============================================================
 * CONTROL BLOCK
 * ============================================================= */

function ControlBlock() {
  const [state, setState] = useState<AdminOpsState | null>(null);
  const [runs, setRuns] = useState<AdminOpsRun[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const [s, r] = await Promise.all([
        apiGet<AdminOpsState>("/admin/ops/state"),
        apiGet<AdminOpsRun[]>("/admin/ops/runs"),
      ]);
      setState(s);
      setRuns(r);
    } catch (e) {
      setError((e as ApiError).detail);
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  async function toggle(next: boolean) {
    setState((prev) => (prev ? { ...prev, enabled: next } : prev));
    try {
      await apiPatch("/admin/ops/state", { enabled: next });
    } catch (e) {
      setError((e as ApiError).detail);
      refresh();
    }
  }

  async function emergencyPause() {
    if (
      !confirm("Emergency pause the ops agent? It will stop all autonomous actions.")
    )
      return;
    setError(null);
    try {
      await apiPost("/admin/ops/pause");
      refresh();
    } catch (e) {
      setError((e as ApiError).detail);
    }
  }

  return (
    <section>
      <AdminSectionHeader label="Ops agent" />
      {error && (
        <p className="ui-sans mb-4 border-l-2 border-negative pl-3 text-[13px] text-negative">
          {error}
        </p>
      )}
      {!state ? (
        <SkeletonRows />
      ) : (
        <div className="ui-sans flex flex-col gap-6 border-t border-rule pt-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="cat-label-muted">Status</p>
            <div className="mt-2 flex items-center gap-3">
              <Toggle
                checked={state.enabled}
                onChange={toggle}
                ariaLabel="Toggle Ops Agent"
              />
              <span
                className="text-[14px]"
                style={{
                  color: state.enabled ? TOKENS.positive : TOKENS.inkMuted,
                }}
              >
                {state.enabled ? "Enabled" : "Paused"}
              </span>
            </div>
            {state.paused_reason && (
              <p className="mt-3 max-w-md text-[13px] text-ink-muted">
                Paused reason: {state.paused_reason}
                {state.paused_at && (
                  <>
                    {" · "}
                    {new Date(state.paused_at).toLocaleString()}
                  </>
                )}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={emergencyPause}
            className="btn-secondary border-negative text-negative"
          >
            Emergency pause
          </button>
        </div>
      )}

      <div className="mt-8">
        <p className="cat-label-muted">Recent ops runs</p>
        {runs === null ? (
          <SkeletonRows />
        ) : runs.length === 0 ? (
          <p className="ui-sans mt-3 text-[14px] text-ink-muted">
            No ops runs yet.
          </p>
        ) : (
          <div className="-mx-6 mt-3 overflow-x-auto px-6">
            <table className="ui-sans w-full min-w-[760px] text-[13px]">
              <thead>
                <tr className="border-b border-rule">
                  <Th>Job</Th>
                  <Th>Class.</Th>
                  <Th>PR</Th>
                  <Th>Status</Th>
                  <Th>Summary</Th>
                  <Th>Started</Th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id} className="border-b border-rule">
                    <td className="py-3 text-ink">{r.job_name}</td>
                    <td className="py-3">
                      <ClassificationPill value={r.classification} />
                    </td>
                    <td className="py-3">
                      {r.pr_url ? (
                        <a
                          href={r.pr_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent underline-offset-4 hover:underline"
                        >
                          PR
                        </a>
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
                    </td>
                    <td className="py-3 text-ink-muted">{r.status ?? "—"}</td>
                    <td className="py-3 text-ink-muted">
                      {r.summary
                        ? r.summary.length > 60
                          ? `${r.summary.slice(0, 60)}…`
                          : r.summary
                        : "—"}
                    </td>
                    <td className="py-3 tabular text-ink-muted">
                      {new Date(r.started_at).toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function ClassificationPill({ value }: { value: string | null }) {
  if (!value) {
    return <span className="text-ink-muted">—</span>;
  }
  const v = value.toUpperCase();
  let color: string = TOKENS.inkMuted;
  if (v.includes("SAFE")) color = TOKENS.positive;
  else if (v.includes("UNSAFE")) color = TOKENS.negative;
  else if (v.includes("REVIEW")) color = TOKENS.amber;
  return (
    <span
      className="ui-sans inline-block border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em]"
      style={{ borderColor: color, color }}
    >
      {v.replace(/_/g, " ")}
    </span>
  );
}

/* =============================================================
 * PENDING REVIEW
 * ============================================================= */

function PendingReviewBlock() {
  const [rows, setRows] = useState<AdminOpsRun[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setRows(await apiGet<AdminOpsRun[]>("/admin/ops/pending-review"));
    } catch (e) {
      setError((e as ApiError).detail);
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  async function approve(id: string) {
    setRows((prev) => prev?.filter((r) => r.id !== id) ?? null);
    try {
      await apiPost(`/admin/ops/prs/${id}/approve`);
    } catch (e) {
      setError((e as ApiError).detail);
      refresh();
    }
  }
  async function reject(id: string) {
    setRows((prev) => prev?.filter((r) => r.id !== id) ?? null);
    try {
      await apiPost(`/admin/ops/prs/${id}/reject`);
    } catch (e) {
      setError((e as ApiError).detail);
      refresh();
    }
  }

  return (
    <section>
      <AdminSectionHeader
        label="Pending review"
        subtitle="PRs the ops agent created that need a human look."
      />
      {error && (
        <p className="ui-sans border-l-2 border-negative pl-3 text-[13px] text-negative">
          {error}
        </p>
      )}
      {rows === null ? (
        <SkeletonRows />
      ) : rows.length === 0 ? (
        <p className="ui-sans text-[14px] text-ink-muted">
          No PRs awaiting review.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex flex-col items-start justify-between gap-3 border-b border-rule pb-4 sm:flex-row sm:items-center"
            >
              <div className="ui-sans min-w-0">
                <p className="text-[14px] text-ink">{r.summary ?? r.job_name}</p>
                <p className="mt-1 text-[12px] text-ink-muted">
                  Reason: {r.classification ?? "needs review"}
                </p>
                {r.pr_url && (
                  <a
                    href={r.pr_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-[12px] text-accent underline-offset-4 hover:underline"
                  >
                    Open PR
                  </a>
                )}
              </div>
              <div className="ui-sans flex shrink-0 gap-3">
                <button
                  type="button"
                  onClick={() => approve(r.id)}
                  className="btn-primary"
                >
                  Approve merge
                </button>
                <button
                  type="button"
                  onClick={() => reject(r.id)}
                  className="btn-secondary border-negative text-negative"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* =============================================================
 * SUGGESTIONS
 * ============================================================= */

function SuggestionsBlock() {
  const [rows, setRows] = useState<AdminOpsRun[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<AdminOpsRun[]>("/admin/ops/suggestions")
      .then(setRows)
      .catch((e: ApiError) => setError(e.detail));
  }, []);

  return (
    <section>
      <AdminSectionHeader
        label="Improvement suggestions"
        subtitle="GitHub issues filed by the weekly improvement sweep."
      />
      {error && (
        <p className="ui-sans border-l-2 border-negative pl-3 text-[13px] text-negative">
          {error}
        </p>
      )}
      {rows === null ? (
        <SkeletonRows />
      ) : rows.length === 0 ? (
        <p className="ui-sans text-[14px] text-ink-muted">
          No suggestions yet.
        </p>
      ) : (
        <ul className="ui-sans flex flex-col gap-3">
          {rows.map((r) => (
            <li
              key={r.id}
              className="flex items-baseline justify-between gap-4 border-b border-rule pb-3 text-[14px]"
            >
              <span className="min-w-0">
                <p className="text-ink">{r.summary ?? r.job_name}</p>
                <p className="mt-1 text-[12px] text-ink-muted tabular">
                  Filed{" "}
                  {new Date(r.started_at).toLocaleString(undefined, {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              </span>
              {r.pr_url && (
                <a
                  href={r.pr_url}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-[13px] text-accent underline-offset-4 hover:underline"
                >
                  View on GitHub
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* =============================================================
 * UTIL
 * ============================================================= */

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="cat-label-muted py-3 text-left font-normal">{children}</th>
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
