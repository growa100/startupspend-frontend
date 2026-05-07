import Link from "next/link";

export function EmptyState({
  title,
  ctaLabel,
  ctaHref,
  onCta,
}: {
  title: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
}) {
  return (
    <div
      className="pt-8 pb-2 text-sm"
      style={{ borderTop: "1px solid var(--border)" }}
    >
      <p style={{ color: "var(--text-secondary)" }}>{title}</p>
      {ctaLabel && (ctaHref || onCta) && (
        <div className="mt-4">
          {ctaHref ? (
            <Link href={ctaHref} className="btn-primary">
              {ctaLabel}
            </Link>
          ) : (
            <button onClick={onCta} className="btn-primary">
              {ctaLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
