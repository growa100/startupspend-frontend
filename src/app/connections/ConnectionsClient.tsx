"use client";

import { useEffect, useMemo, useState } from "react";
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
import { TOKENS } from "@/lib/tokens";

type FetchState<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; message: string };

export function ConnectionsClient() {
  const [conns, setConns] = useState<FetchState<Connection[]>>({
    status: "loading",
  });
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selected, setSelected] = useState<Provider | null>(null);

  async function refresh() {
    try {
      const data = await apiGet<Connection[]>("/connections");
      setConns({ status: "ready", data });
    } catch (e) {
      setConns({ status: "error", message: (e as ApiError).detail });
    }
  }

  useEffect(() => {
    refresh();
    apiGet<Provider[]>("/providers")
      .then(setProviders)
      .catch(() => {});
  }, []);

  return (
    <div className="ui-sans">
      <SectionHeader
        eyebrow="Setup"
        title="Connections"
        meta={
          conns.status === "ready" ? `${conns.data.length} active` : undefined
        }
      />

      <ConnectionsList state={conns} onChange={refresh} />

      <div className="mt-12 border-t border-rule pt-6">
        <p className="cat-label">Add a provider</p>
        <p className="mt-3 max-w-2xl text-[14px] text-ink-muted">
          Pick a provider to connect. Read-only API keys only.
        </p>
        <ProviderGrid
          providers={providers}
          selected={selected}
          onSelect={setSelected}
        />
        {selected && (
          <CredentialForm
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
  onChange,
}: {
  state: FetchState<Connection[]>;
  onChange: () => Promise<void>;
}) {
  if (state.status === "loading") {
    return (
      <ul className="space-y-3 border-t border-rule pt-4">
        {[0, 1, 2].map((i) => (
          <li
            key={i}
            className="flex items-baseline justify-between border-b border-rule pb-3"
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
    <ul className="border-t border-rule">
      {state.data.map((c) => (
        <li
          key={c.id}
          className="flex items-center justify-between gap-4 border-b border-rule py-4"
        >
          <Link
            href={`/connections/${c.id}`}
            className="flex min-w-0 items-center gap-3 text-[14px]"
          >
            <ProviderBadge provider={c.provider} size="md" />
            <span className="min-w-0">
              <span className="block truncate font-medium text-ink">
                {c.display_name}
              </span>
              <span className="block text-[12px] text-ink-muted">
                {c.provider}
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-4 text-[13px]">
            <Status connection={c} />
            <button
              onClick={async () => {
                if (!confirm(`Delete connection "${c.display_name}"?`)) return;
                await apiDelete(`/connections/${c.id}`);
                onChange();
              }}
              className="text-[12px] text-ink-muted underline-offset-4 hover:text-negative hover:underline"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function Status({ connection }: { connection: Connection }) {
  if (connection.last_sync_error) {
    return (
      <span
        className="text-[12px] text-negative"
        title={connection.last_sync_error}
      >
        error
      </span>
    );
  }
  if (!connection.is_active) {
    return <span className="text-[12px] text-ink-muted">paused</span>;
  }
  if (connection.last_synced_at) {
    const ago = Math.floor(
      (Date.now() - new Date(connection.last_synced_at).getTime()) /
        1000 /
        60,
    );
    return (
      <span className="text-[12px] text-positive">synced {ago}m ago</span>
    );
  }
  return <span className="text-[12px] text-ink-muted">pending</span>;
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
          <div key={i} className="border border-rule bg-white p-4">
            <SkeletonLine className="h-8 w-8" />
            <div className="mt-3">
              <SkeletonLine className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {providers.map((p) => {
        const active = selected?.name === p.name;
        return (
          <button
            key={p.name}
            type="button"
            onClick={() => onSelect(p)}
            className={
              "flex items-center gap-3 border bg-white p-4 text-left transition-colors " +
              (active
                ? "border-rule"
                : "border-rule hover:border-ink")
            }
            style={
              active
                ? {
                    borderBottomColor: TOKENS.accent,
                    borderBottomWidth: "2px",
                    paddingBottom: "calc(1rem - 1px)",
                  }
                : undefined
            }
          >
            <ProviderBadge provider={p.name} size="md" />
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-medium text-ink">
                {p.display_name}
              </span>
              <span className="block text-[12px] text-ink-muted">
                {p.credential_fields.length} field
                {p.credential_fields.length === 1 ? "" : "s"}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CredentialForm({
  provider,
  onClose,
  onAdded,
}: {
  provider: Provider;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [creds, setCreds] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialCreds = useMemo(
    () =>
      Object.fromEntries(provider.credential_fields.map((f) => [f.name, ""])),
    [provider],
  );

  useEffect(() => {
    setCreds(initialCreds);
    setDisplayName("");
    setError(null);
  }, [initialCreds]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiPost("/connections", {
        provider: provider.name,
        display_name: displayName,
        credentials: creds,
      });
      onAdded();
    } catch (e) {
      setError((e as ApiError).detail);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-8 flex flex-col gap-4 border-t border-rule pt-6"
    >
      <div className="flex items-center gap-3">
        <ProviderBadge provider={provider.name} size="md" />
        <p className="text-[14px] font-medium text-ink">
          {provider.display_name}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto text-[12px] text-ink-muted underline-offset-4 hover:text-ink hover:underline"
        >
          Pick different
        </button>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="cat-label-muted">Display name</span>
        <input
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={`Personal ${provider.display_name}`}
          className="field-input"
        />
      </label>

      {provider.credential_fields.map((f) => (
        <label key={f.name} className="flex flex-col gap-1.5">
          <span className="cat-label-muted">{f.label}</span>
          <input
            required
            type={f.secret ? "password" : "text"}
            placeholder={f.placeholder}
            value={creds[f.name] ?? ""}
            onChange={(e) =>
              setCreds((prev) => ({ ...prev, [f.name]: e.target.value }))
            }
            className="field-input font-mono"
          />
          {f.help_url && (
            <a
              href={f.help_url}
              target="_blank"
              rel="noreferrer"
              className="text-[12px] text-accent underline-offset-4 hover:underline"
            >
              Where do I find this?
            </a>
          )}
        </label>
      ))}

      {error && (
        <p className="border-l-2 border-negative pl-3 text-[13px] text-negative">
          {error}
        </p>
      )}

      <div className="mt-2 flex items-center gap-3">
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? "…" : "Connect"}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
