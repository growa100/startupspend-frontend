"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ApiError,
  apiGet,
  apiPatch,
  apiPost,
  type AdminContentDraft,
} from "@/lib/api";
import { SectionHeader } from "@/components/SectionHeader";
import { AdminSectionHeader } from "@/components/AdminSectionHeader";
import { SkeletonLine } from "@/components/Skeleton";
import { Toggle } from "@/components/Toggle";

const PLATFORM_COLOR: Record<string, { bg: string; fg: string; label: string }> = {
  x: { bg: "#000000", fg: "#FFFFFF", label: "X" },
  linkedin: { bg: "#0A66C2", fg: "#FFFFFF", label: "LinkedIn" },
  reddit: { bg: "#FF4500", fg: "#FFFFFF", label: "Reddit" },
};

export function ContentClient() {
  return (
    <div>
      <SectionHeader eyebrow="Admin · Content" title="Content agent" />
      <div className="space-y-12">
        <DraftCalendarBlock />
        <PostedBlock />
        <SettingsBlock />
      </div>
    </div>
  );
}

/* =============================================================
 * DRAFT CALENDAR
 * ============================================================= */

function DraftCalendarBlock() {
  const [drafts, setDrafts] = useState<AdminContentDraft[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<AdminContentDraft | null>(null);

  async function refresh() {
    try {
      setDrafts(await apiGet<AdminContentDraft[]>("/admin/content/drafts"));
    } catch (e) {
      setError((e as ApiError).detail);
    }
  }
  useEffect(() => {
    refresh();
  }, []);

  // Group by ISO date (YYYY-MM-DD) within the next 7 days
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const out: { iso: string; label: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      out.push({
        iso: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      });
    }
    return out;
  }, []);

  const byDay = useMemo(() => {
    const m: Record<string, AdminContentDraft[]> = {};
    if (!drafts) return m;
    for (const d of drafts) {
      const key = d.scheduled_for.slice(0, 10);
      m[key] = m[key] ? [...m[key], d] : [d];
    }
    return m;
  }, [drafts]);

  return (
    <section>
      <AdminSectionHeader
        label="Draft calendar"
        subtitle="Next 7 days. Click a draft to review."
      />
      {error && (
        <p className="ui-sans border-l-2 border-negative pl-3 text-[13px] text-negative">
          {error}
        </p>
      )}
      {drafts === null ? (
        <SkeletonRows />
      ) : (
        <div className="-mx-6 overflow-x-auto px-6">
          <div className="ui-sans grid min-w-[840px] grid-cols-7 gap-3">
            {days.map((day) => (
              <DayColumn
                key={day.iso}
                label={day.label}
                drafts={byDay[day.iso] ?? []}
                onOpen={setOpen}
              />
            ))}
          </div>
        </div>
      )}

      {open && (
        <DraftModal
          draft={open}
          onClose={() => setOpen(null)}
          onChanged={() => {
            setOpen(null);
            refresh();
          }}
        />
      )}
    </section>
  );
}

function DayColumn({
  label,
  drafts,
  onOpen,
}: {
  label: string;
  drafts: AdminContentDraft[];
  onOpen: (d: AdminContentDraft) => void;
}) {
  return (
    <div className="border-t border-rule pt-3">
      <p className="cat-label-muted">{label}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {drafts.length === 0 ? (
          <li className="text-[12px] text-ink-muted">—</li>
        ) : (
          drafts.map((d) => <DraftCard key={d.id} draft={d} onOpen={onOpen} />)
        )}
      </ul>
    </div>
  );
}

function DraftCard({
  draft,
  onOpen,
}: {
  draft: AdminContentDraft;
  onOpen: (d: AdminContentDraft) => void;
}) {
  const platform = PLATFORM_COLOR[draft.platform] ?? {
    bg: "#3A3A3A",
    fg: "#FFFFFF",
    label: draft.platform,
  };
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(draft)}
        className="flex w-full flex-col items-stretch gap-2 border border-rule bg-white p-3 text-left transition-colors hover:border-ink"
      >
        <span className="flex items-center justify-between">
          <span
            className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em]"
            style={{ background: platform.bg, color: platform.fg }}
          >
            {platform.label}
          </span>
          <StatusChip status={draft.status} />
        </span>
        <span className="text-[12px] leading-relaxed text-ink">
          {draft.content.slice(0, 60)}
          {draft.content.length > 60 ? "…" : ""}
        </span>
      </button>
    </li>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending_review: "border-rule text-ink-muted",
    approved: "border-positive text-positive",
    queued: "border-positive text-positive",
    posted: "border-rule text-ink-muted",
    killed: "border-rule text-ink-muted",
  };
  const cls = map[status] ?? "border-rule text-ink-muted";
  return (
    <span
      className={"border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.08em] " + cls}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function DraftModal({
  draft,
  onClose,
  onChanged,
}: {
  draft: AdminContentDraft;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [content, setContent] = useState(draft.content);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function save(action: "approve" | "save_only" | "kill") {
    setBusy(action);
    setErr(null);
    try {
      if (action === "kill") {
        await apiPost(`/admin/content/drafts/${draft.id}/kill`);
      } else {
        await apiPatch(`/admin/content/drafts/${draft.id}`, {
          content,
          approve: action === "approve",
        });
      }
      onChanged();
    } catch (e) {
      setErr((e as ApiError).detail);
    } finally {
      setBusy(null);
    }
  }

  const platform = PLATFORM_COLOR[draft.platform] ?? {
    bg: "#3A3A3A",
    fg: "#FFFFFF",
    label: draft.platform,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30"
      onClick={onClose}
    >
      <div
        className="ui-sans w-full max-w-2xl border border-rule bg-bone p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <span
            className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em]"
            style={{ background: platform.bg, color: platform.fg }}
          >
            {platform.label}
          </span>
          <span className="text-[12px] text-ink-muted">
            Scheduled{" "}
            {new Date(draft.scheduled_for).toLocaleString(undefined, {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="field-input mt-4 font-mono"
        />
        {err && (
          <p className="mt-3 border-l-2 border-negative pl-3 text-[13px] text-negative">
            {err}
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => save("approve")}
            disabled={busy !== null}
            className="btn-primary"
          >
            {busy === "approve" ? "…" : "Approve & schedule"}
          </button>
          <button
            type="button"
            onClick={() => save("save_only")}
            disabled={busy !== null}
            className="btn-secondary"
          >
            {busy === "save_only" ? "…" : "Save edits"}
          </button>
          <button
            type="button"
            onClick={() => save("kill")}
            disabled={busy !== null}
            className="btn-secondary border-negative text-negative"
          >
            {busy === "kill" ? "…" : "Kill"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto text-[13px] text-ink-muted underline-offset-4 hover:text-ink hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* =============================================================
 * POSTED
 * ============================================================= */

function PostedBlock() {
  const [rows, setRows] = useState<AdminContentDraft[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    apiGet<AdminContentDraft[]>("/admin/content/posted")
      .then(setRows)
      .catch((e: ApiError) => setError(e.detail));
  }, []);
  return (
    <section>
      <AdminSectionHeader label="Posted" subtitle="Recent published posts." />
      {error && (
        <p className="ui-sans border-l-2 border-negative pl-3 text-[13px] text-negative">
          {error}
        </p>
      )}
      {rows === null ? (
        <SkeletonRows />
      ) : rows.length === 0 ? (
        <p className="ui-sans text-[14px] text-ink-muted">Nothing posted yet.</p>
      ) : (
        <div className="-mx-6 overflow-x-auto px-6">
          <table className="ui-sans w-full min-w-[720px] text-[13px]">
            <thead>
              <tr className="border-b border-rule">
                <Th>Platform</Th>
                <Th>Posted at</Th>
                <Th>Content</Th>
                <Th>Link</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const p = PLATFORM_COLOR[r.platform] ?? {
                  bg: "#3A3A3A",
                  fg: "#FFFFFF",
                  label: r.platform,
                };
                return (
                  <tr key={r.id} className="border-b border-rule">
                    <td className="py-3">
                      <span
                        className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em]"
                        style={{ background: p.bg, color: p.fg }}
                      >
                        {p.label}
                      </span>
                    </td>
                    <td className="py-3 tabular text-ink-muted">
                      {r.posted_at
                        ? new Date(r.posted_at).toLocaleString(undefined, {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "—"}
                    </td>
                    <td className="py-3 text-ink-muted">
                      {r.content.slice(0, 80)}
                      {r.content.length > 80 ? "…" : ""}
                    </td>
                    <td className="py-3">
                      {r.posted_url ? (
                        <a
                          href={r.posted_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent underline-offset-4 hover:underline"
                        >
                          Open
                        </a>
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
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
 * SETTINGS
 * ============================================================= */

type ContentSettings = {
  platforms: { x: boolean; linkedin: boolean; reddit: boolean };
  post_time: "morning" | "afternoon" | "evening";
};

function SettingsBlock() {
  const [s, setS] = useState<ContentSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    apiGet<ContentSettings>("/admin/content/settings")
      .then(setS)
      .catch((e: ApiError) => setError(e.detail));
  }, []);

  async function save() {
    if (!s) return;
    setBusy(true);
    setError(null);
    try {
      await apiPatch("/admin/content/settings", s);
      setSavedAt(Date.now());
    } catch (e) {
      setError((e as ApiError).detail);
    } finally {
      setBusy(false);
    }
  }

  if (!s) {
    return (
      <section>
        <AdminSectionHeader label="Settings" />
        {error ? (
          <p className="ui-sans border-l-2 border-negative pl-3 text-[13px] text-negative">
            {error}
          </p>
        ) : (
          <SkeletonRows />
        )}
      </section>
    );
  }

  return (
    <section>
      <AdminSectionHeader label="Settings" />
      <div className="ui-sans grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="border-t border-rule pt-4">
          <p className="cat-label-muted">Platforms</p>
          <div className="mt-3 flex flex-col gap-3">
            {(["x", "linkedin", "reddit"] as const).map((p) => (
              <label
                key={p}
                className="flex items-center justify-between gap-4 text-[14px]"
              >
                <span className="capitalize text-ink">{p}</span>
                <Toggle
                  checked={s.platforms[p]}
                  onChange={(next) =>
                    setS({ ...s, platforms: { ...s.platforms, [p]: next } })
                  }
                  ariaLabel={`Toggle ${p}`}
                />
              </label>
            ))}
          </div>
        </div>
        <label className="flex flex-col gap-1.5 border-t border-rule pt-4">
          <span className="cat-label-muted">Post time</span>
          <select
            value={s.post_time}
            onChange={(e) =>
              setS({ ...s, post_time: e.target.value as ContentSettings["post_time"] })
            }
            className="field-input"
          >
            <option value="morning">Morning (08:00 UTC)</option>
            <option value="afternoon">Afternoon (14:00 UTC)</option>
            <option value="evening">Evening (20:00 UTC)</option>
          </select>
        </label>
      </div>
      {error && (
        <p className="ui-sans mt-4 border-l-2 border-negative pl-3 text-[13px] text-negative">
          {error}
        </p>
      )}
      {savedAt && (
        <p className="ui-sans mt-4 border-l-2 border-positive pl-3 text-[13px] text-positive">
          Saved.
        </p>
      )}
      <div className="mt-6">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="btn-primary"
        >
          {busy ? "…" : "Save"}
        </button>
      </div>
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
