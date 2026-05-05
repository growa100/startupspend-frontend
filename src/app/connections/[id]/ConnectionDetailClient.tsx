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
        <p className="border-l-2 border-negative pl-4 text-[13px] text-negative">
          {error}
        </p>
        <Link
          href="/connections"
          className="mt-4 inline-block text-[13px] text-accent underline"
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
        className="cat-label-muted mt-12 inline-block hover:text-ink"
      >
        ← Connections
      </Link>
      <SectionHeader
        eyebrow={conn.provider}
        title={conn.display_name}
        meta={conn.is_active ? "Active" : "Paused"}
      />

      {error && (
        <p className="mb-4 border-l-2 border-negative pl-3 text-[13px] text-negative">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div className="border-t border-rule pt-6">
          <p className="cat-label-muted">Sync</p>
          <p className="mt-3 text-[14px] text-ink">
            Last:{" "}
            {conn.last_synced_at ? (
              new Date(conn.last_synced_at).toLocaleString()
            ) : (
              <span className="text-ink-muted">never</span>
            )}
          </p>
          {conn.last_sync_error && (
            <p className="mt-2 border-l-2 border-negative pl-3 text-[13px] text-negative">
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

        <div className="border-t border-rule pt-6">
          <p className="cat-label-muted">Created</p>
          <p className="mt-3 text-[14px] text-ink">
            {new Date(conn.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-12 border-t border-rule pt-6">
        <p className="cat-label-muted">Danger zone</p>
        <button
          type="button"
          onClick={remove}
          disabled={busy === "delete"}
          className="btn-secondary mt-3 border-negative text-negative hover:bg-rule disabled:opacity-60"
        >
          Delete connection
        </button>
      </div>
    </div>
  );
}
