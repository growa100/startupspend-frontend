import Link from "next/link";

/**
 * Calm, purposeful empty state. One line of copy + one CTA. No illustration,
 * no spinner. Used everywhere a list/table/chart has no data.
 */
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
    <div className="border-t border-rule pt-8 pb-2 text-sm">
      <p className="text-ink-soft">{title}</p>
      {ctaLabel && (ctaHref || onCta) && (
        <div className="mt-4">
          {ctaHref ? (
            <Link
              href={ctaHref}
              className="inline-block bg-ink px-4 py-2 text-sm font-medium text-bone hover:bg-ink-soft"
            >
              {ctaLabel}
            </Link>
          ) : (
            <button
              onClick={onCta}
              className="inline-block bg-ink px-4 py-2 text-sm font-medium text-bone hover:bg-ink-soft"
            >
              {ctaLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
