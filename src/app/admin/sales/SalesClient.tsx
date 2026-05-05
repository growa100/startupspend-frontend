"use client";

import { useEffect, useState } from "react";
import {
  ApiError,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  type AdminDoNotContact,
  type AdminOutreachEmail,
  type AdminSalesStats,
} from "@/lib/api";
import { SectionHeader } from "@/components/SectionHeader";
import { AdminSectionHeader } from "@/components/AdminSectionHeader";
import { SkeletonLine } from "@/components/Skeleton";
import { Toggle } from "@/components/Toggle";

export function SalesClient() {
  return (
    <div>
      <SectionHeader eyebrow="Admin · Outreach" title="Sales agent" />
      <div className="space-y-12">
        <PipelineBlock />
        <OutreachQueueBlock />
        <SentBlock />
        <DoNotContactBlock />
        <SettingsBlock />
      </div>
    </div>
  );
}

/* =============================================================
 * PIPELINE
 * ============================================================= */

function PipelineBlock() {
  const [stats, setStats] = useState<AdminSalesStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<AdminSalesStats>("/admin/sales/stats")
      .then(setStats)
      .catch((e: ApiError) => setError(e.detail));
  }, []);

  return (
    <section>
      <AdminSectionHeader label="Pipeline" />
      {error && (
        <p className="ui-sans border-l-2 border-negative pl-3 text-[13px] text-negative">
          {error}
        </p>
      )}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        <Stat label="Leads found" value={stats?.leads_total} />
        <Stat label="Qualified" value={stats?.qualified} />
        <Stat label="Drafted" value={stats?.drafted} />
        <Stat label="Sent this month" value={stats?.sent_this_month} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="border-t border-rule pt-4">
      <p className="cat-label-muted">{label}</p>
      <p
        className="font-display tabular mt-2 text-ink"
        style={{ fontSize: "32px", lineHeight: 1.1, letterSpacing: "-0.012em" }}
      >
        {value === undefined ? <SkeletonLine className="h-8 w-16" /> : value}
      </p>
    </div>
  );
}

/* =============================================================
 * OUTREACH QUEUE
 * ============================================================= */

function OutreachQueueBlock() {
  const [rows, setRows] = useState<AdminOutreachEmail[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoSend, setAutoSend] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function refresh() {
    try {
      setRows(
        await apiGet<AdminOutreachEmail[]>("/admin/sales/emails/queue"),
      );
    } catch (e) {
      setError((e as ApiError).detail);
    }
  }

  useEffect(() => {
    refresh();
    apiGet<{ auto_send: boolean }>("/admin/sales/settings")
      .then((s) => setAutoSend(s.auto_send))
      .catch(() => {});
  }, []);

  async function approve(id: string) {
    setRows((prev) => prev?.filter((r) => r.id !== id) ?? null);
    try {
      await apiPost(`/admin/sales/emails/${id}/approve`);
    } catch (e) {
      setError((e as ApiError).detail);
      refresh();
    }
  }

  async function kill(id: string) {
    setRows((prev) => prev?.filter((r) => r.id !== id) ?? null);
    try {
      await apiPost(`/admin/sales/emails/${id}/kill`);
    } catch (e) {
      setError((e as ApiError).detail);
      refresh();
    }
  }

  async function toggleAuto(next: boolean) {
    setAutoSend(next);
    try {
      await apiPatch("/admin/sales/settings", { auto_send: next });
    } catch (e) {
      setError((e as ApiError).detail);
      setAutoSend(!next);
    }
  }

  return (
    <section>
      <AdminSectionHeader
        label="Outreach queue"
        subtitle="Pending review — drafts shown here are not yet sent."
        trailing={
          <span className="ui-sans flex items-center gap-3 text-[13px] text-ink-muted">
            Auto-send mode
            <Toggle
              checked={autoSend}
              onChange={toggleAuto}
              ariaLabel="Toggle auto-send mode"
            />
          </span>
        }
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
          No drafts in the queue.
        </p>
      ) : (
        <div className="-mx-6 overflow-x-auto px-6">
          <table className="ui-sans w-full min-w-[960px] text-[13px]">
            <thead>
              <tr className="border-b border-rule">
                <Th>Lead</Th>
                <Th>Trigger</Th>
                <Th right>Score</Th>
                <Th right>Seq.</Th>
                <Th>Subject</Th>
                <Th>Preview</Th>
                <Th right>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isEditing = editingId === r.id;
                return (
                  <RowGroup key={r.id}>
                    <tr className="border-b border-rule align-top">
                      <td className="py-3 text-ink">
                        <span className="block">
                          {r.lead_name ?? "Unknown"}
                        </span>
                        <span className="block text-[12px] text-ink-muted">
                          {r.lead_email ?? "—"}
                        </span>
                      </td>
                      <td className="py-3 text-ink-muted">
                        {r.trigger_excerpt
                          ? r.trigger_excerpt.length > 60
                            ? `${r.trigger_excerpt.slice(0, 60)}…`
                            : r.trigger_excerpt
                          : "—"}
                      </td>
                      <td className="py-3 text-right tabular text-ink-muted">
                        {r.total_score ?? "—"}
                      </td>
                      <td className="py-3 text-right tabular text-ink-muted">
                        {r.sequence_number}/3
                      </td>
                      <td className="py-3 text-ink">{r.subject}</td>
                      <td className="py-3 text-ink-muted">
                        {(r.body ?? "").slice(0, 40)}…
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => approve(r.id)}
                          className="mr-3 text-[12px] text-positive underline-offset-4 hover:underline"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingId(isEditing ? null : r.id)
                          }
                          className="mr-3 text-[12px] text-accent underline-offset-4 hover:underline"
                        >
                          {isEditing ? "Close" : "Edit"}
                        </button>
                        <button
                          type="button"
                          onClick={() => kill(r.id)}
                          className="text-[12px] text-negative underline-offset-4 hover:underline"
                        >
                          Kill
                        </button>
                      </td>
                    </tr>
                    {isEditing && (
                      <EditorRow
                        row={r}
                        onClose={() => setEditingId(null)}
                        onSaved={() => {
                          setEditingId(null);
                          refresh();
                        }}
                      />
                    )}
                  </RowGroup>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function RowGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function EditorRow({
  row,
  onClose,
  onSaved,
}: {
  row: AdminOutreachEmail;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [subject, setSubject] = useState(row.subject);
  const [body, setBody] = useState(row.body);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setErr(null);
    try {
      await apiPatch(`/admin/sales/emails/${row.id}`, { subject, body });
      onSaved();
    } catch (e) {
      setErr((e as ApiError).detail);
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className="border-b border-rule bg-bone">
      <td colSpan={7} className="py-4">
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="cat-label-muted">Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="field-input"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="cat-label-muted">Body</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className="field-input font-mono"
            />
          </label>
          {err && (
            <p className="border-l-2 border-negative pl-3 text-[13px] text-negative">
              {err}
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={save}
              disabled={busy}
              className="btn-primary"
            >
              {busy ? "…" : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

/* =============================================================
 * SENT
 * ============================================================= */

function SentBlock() {
  const [rows, setRows] = useState<AdminOutreachEmail[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<AdminOutreachEmail[]>("/admin/sales/sent")
      .then(setRows)
      .catch((e: ApiError) => setError(e.detail));
  }, []);

  return (
    <section>
      <AdminSectionHeader label="Sent" subtitle="Open and reply tracking." />
      {error && (
        <p className="ui-sans border-l-2 border-negative pl-3 text-[13px] text-negative">
          {error}
        </p>
      )}
      {rows === null ? (
        <SkeletonRows />
      ) : rows.length === 0 ? (
        <p className="ui-sans text-[14px] text-ink-muted">
          Nothing sent yet.
        </p>
      ) : (
        <div className="-mx-6 overflow-x-auto px-6">
          <table className="ui-sans w-full min-w-[820px] text-[13px]">
            <thead>
              <tr className="border-b border-rule">
                <Th>Recipient</Th>
                <Th>Sent</Th>
                <Th right>Seq.</Th>
                <Th>Subject</Th>
                <Th>Opened</Th>
                <Th>Replied</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-rule">
                  <td className="py-3 text-ink-muted">
                    {r.lead_email ?? "—"}
                  </td>
                  <td className="py-3 tabular text-ink-muted">
                    {r.sent_at
                      ? new Date(r.sent_at).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })
                      : "—"}
                  </td>
                  <td className="py-3 text-right tabular text-ink-muted">
                    {r.sequence_number}/3
                  </td>
                  <td className="py-3 text-ink">{r.subject}</td>
                  <td className="py-3 text-ink-muted">
                    {r.opened_at ? "Yes" : "No"}
                  </td>
                  <td className="py-3 text-ink-muted">
                    {r.replied_at ? "Yes" : "No"}
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
 * DO NOT CONTACT
 * ============================================================= */

function DoNotContactBlock() {
  const [rows, setRows] = useState<AdminDoNotContact[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      setRows(await apiGet<AdminDoNotContact[]>("/admin/sales/do-not-contact"));
    } catch (e) {
      setError((e as ApiError).detail);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiPost("/admin/sales/do-not-contact", { email, reason });
      setEmail("");
      setReason("");
      refresh();
    } catch (e) {
      setError((e as ApiError).detail);
    } finally {
      setBusy(false);
    }
  }

  async function remove(em: string) {
    if (!confirm(`Remove ${em} from do-not-contact?`)) return;
    await apiDelete(
      `/admin/sales/do-not-contact?email=${encodeURIComponent(em)}`,
    );
    refresh();
  }

  return (
    <section>
      <AdminSectionHeader label="Do not contact" />
      {error && (
        <p className="ui-sans mb-3 border-l-2 border-negative pl-3 text-[13px] text-negative">
          {error}
        </p>
      )}
      <form
        onSubmit={add}
        className="ui-sans grid grid-cols-1 gap-3 sm:grid-cols-12"
      >
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          className="field-input sm:col-span-5"
        />
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          className="field-input sm:col-span-5"
        />
        <button
          type="submit"
          disabled={busy}
          className="btn-primary sm:col-span-2"
        >
          {busy ? "…" : "Add"}
        </button>
      </form>
      <div className="mt-6">
        {rows === null ? (
          <SkeletonRows />
        ) : rows.length === 0 ? (
          <p className="ui-sans text-[14px] text-ink-muted">List is empty.</p>
        ) : (
          <table className="ui-sans w-full text-[13px]">
            <thead>
              <tr className="border-b border-rule">
                <Th>Email</Th>
                <Th>Reason</Th>
                <Th>Added</Th>
                <Th right>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.email} className="border-b border-rule">
                  <td className="py-3 text-ink">{r.email}</td>
                  <td className="py-3 text-ink-muted">{r.reason ?? "—"}</td>
                  <td className="py-3 tabular text-ink-muted">
                    {new Date(r.added_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove(r.email)}
                      className="text-[12px] text-negative underline-offset-4 hover:underline"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

/* =============================================================
 * SETTINGS
 * ============================================================= */

type SalesSettings = {
  daily_cap: number;
  physical_address: string;
  warmup_start_date: string | null;
  auto_send: boolean;
};

function SettingsBlock() {
  const [s, setS] = useState<SalesSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    apiGet<SalesSettings>("/admin/sales/settings")
      .then(setS)
      .catch((e: ApiError) => setError(e.detail));
  }, []);

  async function save() {
    if (!s) return;
    setBusy(true);
    setError(null);
    try {
      await apiPatch("/admin/sales/settings", s);
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
      <AdminSectionHeader
        label="Settings"
        subtitle="Compliance fields are required before any send."
      />
      <div className="ui-sans grid grid-cols-1 gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="cat-label-muted">Daily send cap</span>
          <input
            type="number"
            min={0}
            max={100}
            value={s.daily_cap}
            onChange={(e) => setS({ ...s, daily_cap: Number(e.target.value) })}
            className="field-input tabular"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="cat-label-muted">Warmup start date</span>
          <input
            type="date"
            value={s.warmup_start_date ?? ""}
            onChange={(e) =>
              setS({ ...s, warmup_start_date: e.target.value || null })
            }
            className="field-input tabular"
          />
        </label>
        <label className="flex flex-col gap-1.5 md:col-span-2">
          <span className="cat-label-muted">
            Physical address (CAN-SPAM compliance)
          </span>
          <input
            required
            value={s.physical_address}
            onChange={(e) => setS({ ...s, physical_address: e.target.value })}
            placeholder="Street · City · Country"
            className="field-input"
          />
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
      <div className="mt-6 flex gap-3">
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
