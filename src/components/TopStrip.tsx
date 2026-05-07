"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Compact top strip — site name left, email + sign-out right.
 * Sits flush against the nav, uses bg + text-muted to stay quiet.
 */
export function TopStrip({ email }: { email?: string | null }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div
      className="ui-sans flex items-center justify-between"
      style={{
        background: "var(--bg)",
        color: "var(--text-muted)",
        height: "28px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span
        className="px-8 text-[11px]"
        style={{ letterSpacing: "0.02em" }}
      >
        startupspend.cloud
      </span>
      <span className="flex items-center gap-3 px-8 text-[11px]">
        {email && (
          <span className="hidden sm:inline" title={email}>
            {email}
          </span>
        )}
        <button
          type="button"
          onClick={signOut}
          className="transition-colors hover:text-text-primary"
          style={{ color: "var(--text-secondary)" }}
        >
          Sign out
        </button>
      </span>
    </div>
  );
}
