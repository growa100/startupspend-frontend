"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiGet, type Me } from "@/lib/api";
import { AdminNav } from "./AdminNav";
import { SkeletonLine } from "./Skeleton";

/**
 * Client-side admin gate.
 *
 * Server-side gating already happens in app/admin/layout.tsx (redirect
 * for unauthenticated users), but the is_admin flag lives in the backend
 * not in Supabase Auth itself. We fetch /me on mount; non-admins are
 * routed back to /dashboard with a flash.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "ok"; me: Me }
    | { kind: "error"; message: string }
    | { kind: "forbidden" }
  >({ kind: "loading" });

  useEffect(() => {
    apiGet<Me>("/me")
      .then((me) => {
        if (me.is_admin) setState({ kind: "ok", me });
        else setState({ kind: "forbidden" });
      })
      .catch((e: ApiError) =>
        setState({ kind: "error", message: e.detail }),
      );
  }, []);

  useEffect(() => {
    if (state.kind === "forbidden") {
      router.replace("/dashboard");
    }
  }, [state.kind, router]);

  if (state.kind === "loading") {
    return (
      <>
        <AdminNav />
        <section className="mx-auto max-w-ft px-6" style={{ paddingTop: "48px" }}>
          <SkeletonLine className="h-3 w-44" />
          <div className="mt-4">
            <SkeletonLine className="h-[60px] w-72" />
          </div>
        </section>
      </>
    );
  }
  if (state.kind === "error") {
    return (
      <>
        <AdminNav />
        <section className="mx-auto max-w-ft px-6" style={{ paddingTop: "48px" }}>
          <p className="cat-label-accent">Admin error</p>
          <p className="ui-sans mt-3 border-l-2 border-negative pl-4 text-[14px] text-negative">
            {state.message}
          </p>
        </section>
      </>
    );
  }
  if (state.kind === "forbidden") {
    return (
      <>
        <AdminNav />
        <section className="mx-auto max-w-ft px-6" style={{ paddingTop: "48px" }}>
          <p className="ui-sans text-[14px] text-ink-muted">
            Redirecting…
          </p>
        </section>
      </>
    );
  }

  return (
    <>
      <AdminNav />
      <section className="mx-auto max-w-ft px-6 pb-24">{children}</section>
    </>
  );
}
