/**
 * Standard FT-style section header used by every authed sub-page.
 *
 * Eyebrow in 11px caps FT-red, title in Playfair Display 36px (clamped),
 * optional meta in 13px ink-muted on the right baseline.
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
    <header style={{ paddingTop: "48px" }} className="mb-8">
      {eyebrow && <p className="cat-label">{eyebrow}</p>}
      <div className="mt-3 flex flex-col items-baseline gap-2 sm:flex-row sm:justify-between sm:gap-4">
        <h1
          className="font-display text-ink"
          style={{
            fontSize: "clamp(28px, 4vw, 36px)",
            lineHeight: 1.1,
            letterSpacing: "-0.012em",
          }}
        >
          {title}
        </h1>
        {meta && (
          <span className="ui-sans text-[13px] text-ink-muted">{meta}</span>
        )}
      </div>
    </header>
  );
}
