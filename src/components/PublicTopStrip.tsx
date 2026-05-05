import Link from "next/link";

/**
 * Public version of <TopStrip /> — no auth-aware sign-out, just a brand
 * line and Sign in / Sign up. 32px dark.
 */
export function PublicTopStrip() {
  return (
    <div
      className="ui-sans flex items-center justify-between bg-dark-strip text-white"
      style={{ height: "32px" }}
    >
      <span className="px-4 text-[11px] tracking-[0.04em] text-white/60">
        startupspend.cloud
      </span>
      <span className="flex items-center gap-4 px-4 text-[11px] tracking-[0.04em]">
        <Link href="/login" className="text-white hover:text-white/70">
          Sign in
        </Link>
        <Link href="/signup" className="text-white hover:text-white/70">
          Sign up
        </Link>
      </span>
    </div>
  );
}
