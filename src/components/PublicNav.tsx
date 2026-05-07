"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
];

export function PublicNav() {
  const path = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => setDrawerOpen(false), [path]);

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
          href="/"
          className="ui-sans inline-flex items-center gap-2 leading-none"
          style={{
            color: "var(--text-primary)",
            fontWeight: 600,
            fontSize: 16,
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
              const active = path === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-block transition-colors"
                    style={{
                      fontSize: 13,
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
            <li className="ml-2">
              <Link
                href="/login"
                className="inline-block transition-colors"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  paddingTop: 18,
                  paddingBottom: 18,
                }}
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
          style={{ color: "var(--text-secondary)" }}
        >
          <span
            className="relative inline-block"
            style={{ width: "20px", height: "16px" }}
          >
            <span
              className="absolute left-0 right-0"
              style={{
                background: "currentColor",
                height: "2px",
                top: drawerOpen ? "7px" : "0",
                transform: drawerOpen ? "rotate(45deg)" : "none",
                transition: "transform 120ms ease, top 120ms ease",
              }}
            />
            <span
              className="absolute left-0 right-0"
              style={{
                background: "currentColor",
                height: "2px",
                top: "7px",
                opacity: drawerOpen ? 0 : 1,
                transition: "opacity 80ms ease",
              }}
            />
            <span
              className="absolute left-0 right-0"
              style={{
                background: "currentColor",
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
        <div
          className="ui-sans fixed inset-0 z-50 md:hidden"
          style={{ background: "var(--nav-bg)" }}
        >
          <div
            className="flex items-center justify-between px-8"
            style={{
              height: "56px",
              borderBottom: "1px solid #1a1a1a",
            }}
          >
            <span
              className="inline-flex items-center gap-2"
              style={{
                color: "var(--text-primary)",
                fontWeight: 600,
                fontSize: 16,
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
              style={{ fontSize: 14, color: "var(--text-secondary)" }}
            >
              Close
            </button>
          </div>
          <nav className="px-8 py-6">
            <ul className="flex flex-col gap-1">
              {[
                ...LINKS,
                { href: "/login", label: "Sign in" },
                { href: "/signup", label: "Sign up" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setDrawerOpen(false)}
                    className="block py-3"
                    style={{
                      fontSize: 15,
                      color: "var(--text-secondary)",
                      borderBottom: "1px solid var(--border)",
                    }}
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
