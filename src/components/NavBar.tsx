"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/history", label: "History" },
  { href: "/connections", label: "Connections" },
  { href: "/subscriptions", label: "Subscriptions" },
  { href: "/resources", label: "Resources" },
  { href: "/billing", label: "Billing" },
  { href: "/settings", label: "Settings" },
];

/**
 * Top nav. Black bar (raw bg), wordmark left, links right, theme toggle
 * far right. Active link gets text-primary with brand-blue underline.
 * 1px border-bottom in border var separates nav from content.
 */
export function NavBar() {
  const path = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [path]);

  return (
    <header
      style={{
        background: "var(--nav-bg)",
        borderBottom: "1px solid var(--nav-border)",
      }}
    >
      <div
        className="mx-auto flex max-w-ft items-center justify-between px-8"
        style={{ height: "56px" }}
      >
        <Link
          href="/dashboard"
          className="ui-sans inline-flex items-center gap-2 leading-none"
          style={{
            color: "var(--text-primary)",
            fontWeight: 600,
            fontSize: "16px",
            letterSpacing: "-0.01em",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              background: "#2563eb",
              borderRadius: 2,
            }}
          />
          StartupSpend
        </Link>

        <nav className="ui-sans hidden items-center md:flex">
          <ul className="flex items-center" style={{ gap: "20px" }}>
            {LINKS.map((l) => {
              const active = path?.startsWith(l.href) ?? false;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-block transition-colors"
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: active
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                      paddingTop: 18,
                      paddingBottom: 18,
                      borderBottom: active
                        ? "2px solid var(--brand)"
                        : "2px solid transparent",
                    }}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen((v) => !v)}
            className="md:hidden"
            style={{ color: "var(--text-secondary)" }}
          >
            <Hamburger open={drawerOpen} />
          </button>
        </div>
      </div>

      {drawerOpen && (
        <div
          className="ui-sans fixed inset-0 z-50 md:hidden"
          style={{ background: "#000000" }}
        >
          <div
            className="flex items-center justify-between px-8"
            style={{
              height: "56px",
              borderBottom: "1px solid #1a1a1a",
            }}
          >
            <span
              className="ui-sans inline-flex items-center gap-2"
              style={{
                color: "var(--text-primary)",
                fontWeight: 600,
                fontSize: "16px",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  background: "#2563eb",
                  borderRadius: 2,
                }}
              />
              StartupSpend
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
              style={{ color: "var(--text-secondary)" }}
            >
              <Hamburger open />
            </button>
          </div>
          <nav className="px-8 py-6">
            <ul className="flex flex-col gap-1">
              {LINKS.map((l) => {
                const active = path?.startsWith(l.href) ?? false;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={() => setDrawerOpen(false)}
                      className="block py-3 text-[15px]"
                      style={{
                        color: active
                          ? "var(--text-primary)"
                          : "var(--text-secondary)",
                        borderBottom: "1px solid var(--border)",
                      }}
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
        className="absolute left-0 right-0"
        style={{
          background: "currentColor",
          height: "2px",
          top: open ? "7px" : "0",
          transform: open ? "rotate(45deg)" : "none",
          transition: "transform 120ms ease, top 120ms ease",
        }}
      />
      <span
        className="absolute left-0 right-0"
        style={{
          background: "currentColor",
          height: "2px",
          top: "7px",
          opacity: open ? 0 : 1,
          transition: "opacity 80ms ease",
        }}
      />
      <span
        className="absolute left-0 right-0"
        style={{
          background: "currentColor",
          height: "2px",
          top: open ? "7px" : "14px",
          transform: open ? "rotate(-45deg)" : "none",
          transition: "transform 120ms ease, top 120ms ease",
        }}
      />
    </span>
  );
}
