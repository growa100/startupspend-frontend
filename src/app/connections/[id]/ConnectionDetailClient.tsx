"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ApiError,
  apiDelete,
  apiGet,
  apiPost,
  type Connection,
} from "@/lib/api";
import { SectionHeader } from "@/components/SectionHeader";
import { SkeletonLine } from "@/components/Skeleton";
import { formatProviderName } from "@/lib/providerColors";

export function ConnectionDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const [conn, setConn] = useState<Connection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setConn(await apiGet<Connection>(`/connections/${id}`));
      setError(null);
    } catch (e) {
      setError((e as ApiError).detail);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function triggerSync() {
    setBusy("sync");
    try {
      await apiPost(`/connections/${id}/sync`);
      setTimeout(refresh, 1500);
    } catch (e) {
      setError((e as ApiError).detail);
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!confirm("Delete this connection?")) return;
    setBusy("delete");
    try {
      await apiDelete(`/connections/${id}`);
      router.push("/connections");
    } catch (e) {
      setError((e as ApiError).detail);
    } finally {
      setBusy(null);
    }
  }

  if (!conn && !error) {
    return (
      <div className="ui-sans">
        <SectionHeader title="Connection" />
        <SkeletonLine className="h-4 w-48" />
      </div>
    );
  }
  if (error && !conn) {
    return (
      <div className="ui-sans">
        <SectionHeader title="Connection" />
        <p
          className="pl-4"
          style={{
            borderLeft: "2px solid var(--negative)",
            color: "var(--negative)",
            fontSize: 13,
          }}
        >
          {error}
        </p>
        <Link
          href="/connections"
          className="mt-4 inline-block hover:underline"
          style={{ fontSize: 13, color: "var(--brand)" }}
        >
          Back
        </Link>
      </div>
    );
  }
  if (!conn) return null;

  return (
    <div className="ui-sans">
      <Link
        href="/connections"
        className="cat-label-muted mt-8 inline-block transition-colors hover:text-text-primary"
      >
        ← Connections
      </Link>
      <SectionHeader
        eyebrow={conn.provider}
        title={formatProviderName(conn.provider)}
        meta={conn.is_active ? "Active" : "Paused"}
      />

      {error && (
        <p
          className="mb-4 pl-3"
          style={{
            borderLeft: "2px solid var(--negative)",
            color: "var(--negative)",
            fontSize: 13,
          }}
        >
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="card">
          <p className="cat-label">Sync</p>
          <p
            className="mt-3"
            style={{ fontSize: 14, color: "var(--text-primary)" }}
          >
            Last:{" "}
            {conn.last_synced_at ? (
              new Date(conn.last_synced_at).toLocaleString()
            ) : (
              <span style={{ color: "var(--text-muted)" }}>never</span>
            )}
          </p>
          {conn.last_sync_error && (
            <p
              className="mt-2 pl-3"
              style={{
                borderLeft: "2px solid var(--negative)",
                color: "var(--negative)",
                fontSize: 13,
              }}
            >
              {conn.last_sync_error}
            </p>
          )}
          <button
            type="button"
            onClick={triggerSync}
            disabled={busy === "sync"}
            className="btn-primary mt-4"
          >
            {busy === "sync" ? "Queued…" : "Sync now"}
          </button>
        </div>

        <div className="card">
          <p className="cat-label">Created</p>
          <p
            className="mt-3"
            style={{ fontSize: 14, color: "var(--text-primary)" }}
          >
            {new Date(conn.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="card mt-4">
        <p className="cat-label">Danger zone</p>
        <button
          type="button"
          onClick={remove}
          disabled={busy === "delete"}
          className="btn-secondary mt-3 disabled:opacity-60"
          style={{ borderColor: "var(--negative)", color: "var(--negative)" }}
        >
          Delete connection
        </button>
      </div>
    </div>
  );
}
