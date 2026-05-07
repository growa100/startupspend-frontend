import Link from "next/link";

export function PublicTopStrip() {
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
        <Link
          href="/login"
          className="transition-colors hover:text-text-primary"
          style={{ color: "var(--text-secondary)" }}
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="transition-colors hover:text-text-primary"
          style={{ color: "var(--text-secondary)" }}
        >
          Sign up
        </Link>
      </span>
    </div>
  );
}
