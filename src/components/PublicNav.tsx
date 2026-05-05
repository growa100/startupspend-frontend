"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
];

/**
 * Public marketing nav. Same FT structure as authed NavBar — left
 * wordmark, right links — but with Sign in / Sign up CTAs on the right.
 */
export function PublicNav() {
  const path = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => setDrawerOpen(false), [path]);

  return (
    <header className="border-b border-rule bg-white">
      <div
        className="mx-auto flex max-w-ft items-center justify-between px-6"
        style={{ height: "64px" }}
      >
        <Link
          href="/"
          className="font-display text-[22px] font-medium leading-none tracking-tight text-ink"
        >
          StartupSpend
        </Link>
        <nav className="ui-sans hidden items-center md:flex">
          <ul className="flex items-center" style={{ gap: "24px" }}>
            {LINKS.map((l) => {
              const active = path === l.href;
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
            <li className="ml-2">
              <Link
                href="/login"
                className="inline-block py-[20px] text-[13px] text-ink hover:text-accent"
              >
                Sign in
              </Link>
            </li>
            <li>
              <Link href="/signup" className="btn-primary text-[13px]">
                Start tracking
              </Link>
            </li>
          </ul>
        </nav>

        <button
          type="button"
          aria-label={drawerOpen ? "Close menu" : "Open menu"}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((v) => !v)}
          className="md:hidden"
        >
          <span
            className="relative inline-block"
            style={{ width: "20px", height: "16px" }}
          >
            <span
              className="absolute left-0 right-0 bg-ink"
              style={{
                height: "2px",
                top: drawerOpen ? "7px" : "0",
                transform: drawerOpen ? "rotate(45deg)" : "none",
                transition: "transform 120ms ease, top 120ms ease",
              }}
            />
            <span
              className="absolute left-0 right-0 bg-ink"
              style={{
                height: "2px",
                top: "7px",
                opacity: drawerOpen ? 0 : 1,
                transition: "opacity 80ms ease",
              }}
            />
            <span
              className="absolute left-0 right-0 bg-ink"
              style={{
                height: "2px",
                top: drawerOpen ? "7px" : "14px",
                transform: drawerOpen ? "rotate(-45deg)" : "none",
                transition: "transform 120ms ease, top 120ms ease",
              }}
            />
          </span>
        </button>
      </div>

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
              className="text-[14px] text-ink"
            >
              Close
            </button>
          </div>
          <nav className="px-6 py-8">
            <ul className="flex flex-col gap-1">
              {[...LINKS, { href: "/login", label: "Sign in" }, { href: "/signup", label: "Sign up" }].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setDrawerOpen(false)}
                    className="block border-b border-rule py-4 text-base text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
