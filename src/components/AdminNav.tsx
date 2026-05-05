"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/system", label: "System" },
  { href: "/admin/sales", label: "Sales" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/quality", label: "Quality" },
  { href: "/admin/finance", label: "Finance" },
  { href: "/admin/ops", label: "Ops" },
];

/**
 * Secondary nav bar shown on every /admin/* page, directly below the
 * primary FT NavBar. Each tab links to its admin sub-page; active tab
 * gets a 2px FT-red bottom border like the main nav.
 */
export function AdminNav() {
  const path = usePathname();
  return (
    <div className="border-b border-rule bg-white">
      <div className="ui-sans mx-auto max-w-ft px-6">
        <nav className="no-scrollbar -mx-6 overflow-x-auto px-6">
          <ul className="flex items-center" style={{ gap: "24px" }}>
            {TABS.map((t) => {
              const active = path?.startsWith(t.href) ?? false;
              return (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className={
                      "inline-block whitespace-nowrap py-3 text-[13px] text-ink transition-colors hover:text-accent " +
                      (active
                        ? "border-b-2 border-accent"
                        : "border-b-2 border-transparent")
                    }
                  >
                    {t.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
