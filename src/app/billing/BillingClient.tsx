"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ApiError, apiGet, apiPost } from "@/lib/api";
import { SectionHeader } from "@/components/SectionHeader";
import { SkeletonLine } from "@/components/Skeleton";

type Status = {
  plan: "free" | "pro";
  status: string;
  trial_ends_at: string | null;
  current_period_end: string | null;
};

export function BillingClient() {
  return (
    <Suspense fallback={null}>
      <BillingInner />
    </Suspense>
  );
}

function BillingInner() {
  const search = useSearchParams();
  const [status, setStatus] = useState<Status | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Status>("/billing/status")
      .then(setStatus)
      .catch((e: ApiError) => setErr(e.detail));
  }, []);

  const flash =
    search.get("status") === "success"
      ? "Subscription active. Welcome to Pro."
      : search.get("status") === "cancel"
      ? "Checkout canceled."
      : null;

  async function checkout() {
    setBusy("checkout");
    try {
      const { url } = await apiPost<{ url: string }>("/billing/checkout");
      window.location.href = url;
    } catch (e) {
      setErr((e as ApiError).detail);
    } finally {
      setBusy(null);
    }
  }

  async function portal() {
    setBusy("portal");
    try {
      const { url } = await apiPost<{ url: string }>("/billing/portal");
      window.location.href = url;
    } catch (e) {
      setErr((e as ApiError).detail);
    } finally {
      setBusy(null);
    }
  }

  if (!status && !err) {
    return (
      <div>
        <SectionHeader eyebrow="Account" title="Billing" />
        <SkeletonLine className="h-4 w-48" />
      </div>
    );
  }

  return (
    <div>
      <SectionHeader eyebrow="Account" title="Billing" />

      {flash && (
        <p className="mb-6 border-l-2 border-positive pl-4 text-sm text-positive">{flash}</p>
      )}

      {err && (
        <p className="mb-6 border-l-2 border-negative pl-4 text-sm text-negative">{err}</p>
      )}

      {status && (
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="border-t border-rule pt-6">
            <p className="text-xs uppercase tracking-wider text-ink-muted">Plan</p>
            <p className="font-display mt-2 text-display capitalize">{status.plan}</p>
            <p className="mt-1 text-sm text-ink-muted">Status: {status.status}</p>
            {status.trial_ends_at && status.plan === "pro" && status.status === "trialing" && (
              <p className="mt-2 text-sm text-ink-soft">
                Trial ends{" "}
                {new Date(status.trial_ends_at).toLocaleDateString()}.
              </p>
            )}
            {status.current_period_end && (
              <p className="mt-2 text-sm text-ink-soft">
                Renews{" "}
                {new Date(status.current_period_end).toLocaleDateString()}.
              </p>
            )}
          </div>

          <div className="border-t border-rule pt-6">
            <p className="text-xs uppercase tracking-wider text-ink-muted">Manage</p>
            {status.plan === "free" ? (
              <button
                onClick={checkout}
                disabled={busy !== null}
                className="mt-3 bg-ink px-6 py-3 text-sm text-bone hover:bg-ink-soft disabled:opacity-60"
              >
                {busy === "checkout" ? "..." : "Upgrade to Pro — $19/mo"}
              </button>
            ) : (
              <button
                onClick={portal}
                disabled={busy !== null}
                className="mt-3 border border-ink px-6 py-3 text-sm hover:bg-bone-dim disabled:opacity-60"
              >
                {busy === "portal" ? "..." : "Manage subscription"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
