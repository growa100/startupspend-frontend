"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/connections", label: "Connections" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/resources", label: "Resources" },
  { href: "/billing", label: "Billing" },
  { href: "/settings", label: "Settings" },
];

/**
 * FT-style main nav. White background, 64px tall, 1px warm-gray bottom
 * rule. Left-aligned wordmark in Playfair Display. Right-aligned nav
 * links in Inter 13px. Active link gets a 2px FT-red bottom border.
 *
 * Mobile (<768px): nav links are hidden behind a hamburger that opens a
 * full-screen drawer.
 */
export function NavBar() {
  const path = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer when route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [path]);

  return (
    <header className="border-b border-rule bg-white">
      <div
        className="mx-auto flex max-w-ft items-center justify-between px-6"
        style={{ height: "64px" }}
      >
        <Link
          href="/dashboard"
          className="font-display text-[22px] font-medium leading-none tracking-tight text-ink"
        >
          StartupSpend
        </Link>

        {/* Desktop nav */}
        <nav className="ui-sans hidden items-center md:flex">
          <ul className="flex items-center" style={{ gap: "24px" }}>
            {LINKS.map((l) => {
              const active = path?.startsWith(l.href) ?? false;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={
                      "inline-block py-[20px] text-[13px] text-ink transition-colors hover:text-accent " +
                      (active
                        ? "border-b-2 border-accent"
                        : "border-b-2 border-transparent")
                    }
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Hamburger — mobile only */}
        <button
          type="button"
          aria-label={drawerOpen ? "Close menu" : "Open menu"}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((v) => !v)}
          className="md:hidden"
        >
          <Hamburger open={drawerOpen} />
        </button>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="ui-sans fixed inset-0 z-50 bg-bone md:hidden">
          <div
            className="flex items-center justify-between border-b border-rule bg-white px-6"
            style={{ height: "64px" }}
          >
            <span className="font-display text-[22px] font-medium text-ink">
              StartupSpend
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
            >
              <Hamburger open />
            </button>
          </div>
          <nav className="px-6 py-8">
            <ul className="flex flex-col gap-1">
              {LINKS.map((l) => {
                const active = path?.startsWith(l.href) ?? false;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={() => setDrawerOpen(false)}
                      className={
                        "block border-b border-rule py-4 text-base " +
                        (active ? "text-accent" : "text-ink")
                      }
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

function Hamburger({ open }: { open: boolean }) {
  return (
    <span
      className="relative inline-block"
      style={{ width: "20px", height: "16px" }}
    >
      <span
        className="absolute left-0 right-0 bg-ink"
        style={{
          height: "2px",
          top: open ? "7px" : "0",
          transform: open ? "rotate(45deg)" : "none",
          transition: "transform 120ms ease, top 120ms ease",
        }}
      />
      <span
        className="absolute left-0 right-0 bg-ink"
        style={{
          height: "2px",
          top: "7px",
          opacity: open ? 0 : 1,
          transition: "opacity 80ms ease",
        }}
      />
      <span
        className="absolute left-0 right-0 bg-ink"
        style={{
          height: "2px",
          top: open ? "7px" : "14px",
          transform: open ? "rotate(-45deg)" : "none",
          transition: "transform 120ms ease, top 120ms ease",
        }}
      />
    </span>
  );
}
