"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Plain text "Sign out" link sitting in the nav. Uses text-muted so it
 * stays visually quiet next to the active nav links.
 */
export function SignOutLink() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={signOut}
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
          "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color =
          "var(--text-muted)";
      }}
    >
      Sign out
    </button>
  );
}
