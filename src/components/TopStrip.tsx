"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * 32px dark strip at the very top of every authed page.
 * Left: site brand (small, white-muted). Right: user email + Sign out.
 *
 * No ticker — FT doesn't have one and the previous attempt was a mistake.
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
      className="ui-sans flex items-center justify-between bg-dark-strip text-white"
      style={{ height: "32px" }}
    >
      <span className="px-4 text-[11px] tracking-[0.04em] text-white/60">
        startupspend.cloud
      </span>
      <span className="flex items-center gap-4 px-4 text-[11px] tracking-[0.04em]">
        {email && (
          <span className="hidden text-white/60 sm:inline" title={email}>
            {email}
          </span>
        )}
        <button
          type="button"
          onClick={signOut}
          className="text-white hover:text-white/70"
        >
          Sign out
        </button>
      </span>
    </div>
  );
}
