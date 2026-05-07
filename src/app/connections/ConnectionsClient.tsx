"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ApiError,
  apiDelete,
  apiGet,
  apiPost,
  type Connection,
  type Provider,
} from "@/lib/api";
import { SectionHeader } from "@/components/SectionHeader";
import { SkeletonLine } from "@/components/Skeleton";
import { ProviderBadge } from "@/components/ProviderBadge";
import { EmptyState } from "@/components/EmptyState";
import { ProviderConnectionModal } from "@/components/ProviderConnectionModal";
import { formatProviderName } from "@/lib/providerColors";

type FetchState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; message: string };

/** Per-connection sync state held in the parent so polling survives renders. */
type SyncState = {
  /** Snapshot of last_synced_at when we kicked off the sync. */
  startedAt: number;
  /** Snapshot of last_synced_at on the connection at the moment we kicked off. */
  baselineSyncedAt: string | null;
};

export function ConnectionsClient() {
  const [conns, setConns] = useState<FetchState<Connection[]>>({
    status: "loading",
  });
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selected, setSelected] = useState<Provider | null>(null);
  const [syncing, setSyncing] = useState<Record<string, SyncState>>({});
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function refresh() {
    try {
      const data = await apiGet<Connection[]>("/connections");
      setConns({ status: "ready", data });
      // Stop polling for any connection whose sync has now landed
      // (last_synced_at moved past the baseline OR last_sync_error is set).
      setSyncing((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const c of data) {
          const s = next[c.id];
          if (!s) continue;
          const moved =
            (c.last_synced_at ?? null) !== (s.baselineSyncedAt ?? null);
          const errored = !!c.last_sync_error;
          // Safety net: stop polling after 2 minutes regardless.
          const timedOut = Date.now() - s.startedAt > 120_000;
          if (moved || errored || timedOut) {
            delete next[c.id];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    } catch (e) {
      setConns({ status: "error", message: (e as ApiError).detail });
    }
  }

  useEffect(() => {
    refresh();
    apiGet<Provider[]>("/providers")
      .then(setProviders)
      .catch(() => {});
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start/stop polling whenever the syncing set transitions empty <-> not.
  useEffect(() => {
    const anyActive = Object.keys(syncing).length > 0;
    if (anyActive && !pollRef.current) {
      pollRef.current = setInterval(refresh, 5000);
    } else if (!anyActive && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncing]);

  async function triggerSync(c: Connection) {
    setSyncing((prev) => ({
      ...prev,
      [c.id]: {
        startedAt: Date.now(),
        baselineSyncedAt: c.last_synced_at,
      },
    }));
    try {
      await apiPost(`/connections/${c.id}/sync`);
      // Kick a refresh now in addition to the 5s poll so the UI feels snappy.
      setTimeout(refresh, 1000);
    } catch (e) {
      // Revert syncing flag and surface the error inline. last_sync_error
      // will pick up real provider errors; this branch handles 4xx/5xx
      // from /sync itself (e.g. 404 if the connection vanished).
      setSyncing((prev) => {
        const next = { ...prev };
        delete next[c.id];
        return next;
      });
      const detail = (e as ApiError).detail || "sync failed";
      // Stash the error on the connection row by patching local state so
      // the user sees something. The next refresh will override.
      setConns((s) =>
        s.status === "ready"
          ? {
              status: "ready",
              data: s.data.map((row) =>
                row.id === c.id ? { ...row, last_sync_error: detail } : row,
              ),
            }
          : s,
      );
    }
  }

  return (
    <div className="ui-sans">
      <SectionHeader
        eyebrow="Setup"
        title="Connections"
        meta={
          conns.status === "ready" ? `${conns.data.length} active` : undefined
        }
      />

      <ConnectionsList
        state={conns}
        syncing={syncing}
        onChange={refresh}
        onSync={triggerSync}
      />

      <div
        className="mt-12 pt-6"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <p className="cat-label">Add a provider</p>
        <p
          className="mt-3 max-w-2xl"
          style={{ fontSize: 14, color: "var(--text-muted)" }}
        >
          Pick a provider to connect. Read-only API keys only.
        </p>
        <ProviderGrid
          providers={providers}
          selected={selected}
          onSelect={setSelected}
        />
        {selected && (
          <ProviderConnectionModal
            provider={selected}
            onClose={() => setSelected(null)}
            onAdded={() => {
              setSelected(null);
              refresh();
            }}
          />
        )}
      </div>
    </div>
  );
}

function ConnectionsList({
  state,
  syncing,
  onChange,
  onSync,
}: {
  state: FetchState<Connection[]>;
  syncing: Record<string, SyncState>;
  onChange: () => Promise<void>;
  onSync: (c: Connection) => Promise<void>;
}) {
  if (state.status === "loading") {
    return (
      <ul className="mt-6 grid grid-cols-1 gap-3">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="card flex items-center justify-between"
            style={{ padding: "16px 18px" }}
          >
            <SkeletonLine className="h-4 w-48" />
            <SkeletonLine className="h-4 w-16" />
          </li>
        ))}
      </ul>
    );
  }
  if (state.status === "error") {
    return (
      <p className="border-l-2 border-negative pl-4 text-[13px] text-negative">
        {state.message}
      </p>
    );
  }
  if (state.data.length === 0) {
    return (
      <EmptyState title="No connections yet. Pick a provider below to start tracking." />
    );
  }
  return (
    <div
      className="mt-6"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "0 20px",
      }}
    >
      {state.data.map((c) => (
        <ConnectionRow
          key={c.id}
          connection={c}
          isSyncing={!!syncing[c.id]}
          onSync={() => onSync(c)}
          onDelete={async () => {
            if (!confirm(`Delete ${formatProviderName(c.provider)} connection?`)) return;
            await apiDelete(`/connections/${c.id}`);
            onChange();
          }}
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
  const dotColor = (() => {
    if (connection.last_sync_error || isSyncing) {
      if (isSyncing) return "#f59e0b";
      return "#ef4444";
    }
    if (!connection.last_synced_at) return "#ef4444";
    const ageHours =
      (Date.now() - new Date(connection.last_synced_at).getTime()) /
      1000 /
      3600;
    if (ageHours <= 1) return "#22c55e";
    if (ageHours <= 24) return "#f59e0b";
    return "#ef4444";
  })();
  const ago = connection.last_synced_at
    ? syncRelative(connection.last_synced_at)
    : "never";
  return (
    <div style={{ borderBottom: "1px solid #1a1a1a" }}>
      <div
        className="flex items-center justify-between"
        style={{ height: 56, gap: 12 }}
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
            {ago}
          </span>
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            className="ui-sans transition-colors"
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              fontSize: 13,
              color: isSyncing ? "var(--text-muted)" : "var(--text-secondary)",
              cursor: isSyncing ? "default" : "pointer",
            }}
          >
            {isSyncing ? "Syncing…" : "Sync"}
          </button>
          <button
            type="button"
            onClick={onDelete}
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
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--negative)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--text-muted)";
            }}
          >
            Delete
          </button>
        </div>
      </div>
      {connection.last_sync_error && (
        <p
          className="ui-sans"
          style={{
            color: "var(--negative)",
            fontSize: 12,
            paddingLeft: 18,
            paddingBottom: 8,
          }}
        >
          {plainEnglishError(connection.last_sync_error, connection.provider)}
        </p>
      )}
    </div>
  );
}

function syncRelative(iso: string): string {
  const min = (Date.now() - new Date(iso).getTime()) / 1000 / 60;
  if (min < 60) return `${Math.round(min)}m ago`;
  if (min < 60 * 24) return `${Math.round(min / 60)}h ago`;
  return `${Math.round(min / 60 / 24)}d ago`;
}

/** Translate a raw provider error tag into a one-line plain English hint
 * for non-technical founders. Provider-aware where useful; falls back to
 * the raw string when we don't have a known mapping. */
function plainEnglishError(raw: string, provider?: string): string {
  const s = raw.toLowerCase();
  const p = (provider || "").toLowerCase();

  // Azure surfaces "Azure rate limited — try again in N minutes"
  // verbatim from the provider; keep it as-is rather than rewriting.
  if (
    p === "azure" &&
    (s.includes("rate limited") || s.includes("retry") || s.includes(" 429"))
  ) {
    return raw;
  }
  if (s.includes("rate limited") || s.includes("ratelimited") || s.includes(" 429")) {
    return "Rate limited — the provider asked us to slow down. We'll retry on the next sync.";
  }
  if (s.includes("invalid_credentials")) {
    return "Credentials rejected — your API key may have been rotated or revoked. Re-add the connection with a fresh key.";
  }
  if (s.includes("unauthorized") || s.includes(" 401")) {
    return "Unauthorized — the key was rejected. Generate a new key and re-add this connection.";
  }
  if (s.includes("scope_limited") || s.includes("forbidden") || s.includes(" 403")) {
    if (p === "exoscale") {
      return "Authenticated but the IAM role can't read billing. Re-issue the key with the Owner or Billing role.";
    }
    if (p === "aws") {
      return "Authenticated but the IAM user lacks ce:GetCostAndUsage. Attach AWSBillingReadOnlyAccess and retry.";
    }
    return "Authenticated but the key lacks billing-read permission. Re-issue with the billing scope.";
  }
  if (s.includes("not_implemented") || s.includes("notimplemented")) {
    return "This provider's billing endpoint isn't wired up yet. Validation worked; spend will start showing once it's live.";
  }
  if (s.includes("billing_api_not_confirmed")) {
    return "We don't have a stable billing endpoint for this provider yet. Spend will appear when one ships.";
  }
  if (s.includes("decrypt_failed")) {
    return "Stored credentials can't be decrypted on the server. Delete and re-add this connection.";
  }
  if (s.includes("connection not found")) {
    return "This connection no longer exists on the server. Refresh the page.";
  }
  return raw;
}

function ProviderGrid({
  providers,
  selected,
  onSelect,
}: {
  providers: Provider[];
  selected: Provider | null;
  onSelect: (p: Provider) => void;
}) {
  if (providers.length === 0) {
    return (
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 16,
            }}
          >
            <SkeletonLine className="h-8 w-8" />
            <div className="mt-3">
              <SkeletonLine className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  // Sort: live providers first, "Soon" providers grouped at the end.
  const sorted = [...providers].sort((a, b) => {
    if (a.coming_soon !== b.coming_soon) return a.coming_soon ? 1 : -1;
    return formatProviderName(a.name).localeCompare(formatProviderName(b.name));
  });
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {sorted.map((p) => {
        const active = selected?.name === p.name;
        const soon = p.coming_soon;
        return (
          <button
            key={p.name}
            type="button"
            onClick={() => {
              if (!soon) onSelect(p);
            }}
            disabled={soon}
            aria-disabled={soon}
            className={
              "relative flex items-center gap-3 text-left transition-colors " +
              (soon ? "cursor-not-allowed" : "")
            }
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid",
              borderColor: active ? "var(--brand)" : "var(--border)",
              borderRadius: 8,
              padding: 16,
              opacity: soon ? 0.4 : 1,
            }}
            onMouseEnter={(e) => {
              if (!soon && !active) {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "var(--border-focus)";
              }
            }}
            onMouseLeave={(e) => {
              if (!soon && !active) {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "var(--border)";
              }
            }}
          >
            <ProviderBadge provider={p.name} size="lg" />
            <span className="min-w-0">
              <span
                className="block truncate"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--text-primary)",
                }}
              >
                {formatProviderName(p.name)}
              </span>
              <span
                className="block"
                style={{ fontSize: 12, color: "var(--text-muted)" }}
              >
                {soon
                  ? "Coming soon"
                  : `${p.credential_fields.length} field${p.credential_fields.length === 1 ? "" : "s"}`}
              </span>
            </span>
            {soon && (
              <span
                className="ui-sans absolute right-3 top-3"
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--text-muted)",
                }}
              >
                Soon
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

