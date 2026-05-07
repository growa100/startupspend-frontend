/**
 * Standard section header for authed sub-pages.
 *
 * Eyebrow in 11px text-secondary uppercase, title in Inter 700 24px,
 * optional meta in 13px text-muted on the right baseline.
 */
export function SectionHeader({
  eyebrow,
  title,
  meta,
}: {
  eyebrow?: string;
  title: string;
  meta?: string;
}) {
  return (
    <header className="mb-6 pt-8">
      {eyebrow && <p className="cat-label">{eyebrow}</p>}
      <div className="mt-2 flex flex-col items-baseline gap-2 sm:flex-row sm:justify-between sm:gap-4">
        <h1 className="page-title">{title}</h1>
        {meta && (
          <span
            className="ui-sans"
            style={{ color: "var(--text-muted)", fontSize: 13 }}
          >
            {meta}
          </span>
        )}
      </div>
    </header>
  );
}
