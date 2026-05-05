/**
 * FT-style section heading used inside admin pages — slightly tighter
 * than the page-level <SectionHeader /> (no big Playfair display,
 * just an 11px caps eyebrow in --accent and an optional 16px serif
 * subtitle).
 */
export function AdminSectionHeader({
  label,
  subtitle,
  trailing,
}: {
  label: string;
  subtitle?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <header className="mb-4 flex items-baseline justify-between gap-4">
      <div>
        <p className="cat-label">{label}</p>
        {subtitle && (
          <p className="ui-sans mt-1 text-[14px] text-ink-muted">{subtitle}</p>
        )}
      </div>
      {trailing}
    </header>
  );
}
