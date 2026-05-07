"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/history", label: "History", icon: "history" },
  { href: "/connections", label: "Connections", icon: "plug" },
  { href: "/settings", label: "Settings", icon: "settings" },
] as const;

/**
 * Bottom-tab nav for mobile. Hidden ≥md. The icons are inline SVG so we
 * stay zero-dep and they tint with currentColor (active = brand).
 *
 * Designed to mirror the structure of the upcoming Expo app — same four
 * primary destinations, same order, same labels.
 */
export function MobileBottomNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{
        background: "var(--bg-elevated)",
        borderTop: "1px solid var(--border)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <ul className="grid grid-cols-4">
        {TABS.map((t) => {
          const active = path?.startsWith(t.href) ?? false;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className="flex flex-col items-center justify-center gap-1 transition-colors duration-150"
                style={{
                  minHeight: 56,
                  color: active ? "var(--text-primary)" : "var(--text-muted)",
                }}
              >
                <Icon name={t.icon} />
                <span className="ui-sans text-[10px] font-medium">
                  {t.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Icon({ name }: { name: (typeof TABS)[number]["icon"] }) {
  const props = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "home":
      return (
        <svg {...props}>
          <path d="M3 12 12 3l9 9" />
          <path d="M5 10v10h14V10" />
        </svg>
      );
    case "history":
      return (
        <svg {...props}>
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "plug":
      return (
        <svg {...props}>
          <path d="M9 2v6" />
          <path d="M15 2v6" />
          <path d="M6 8h12v3a6 6 0 1 1-12 0V8z" />
          <path d="M12 17v5" />
        </svg>
      );
    case "settings":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
      );
  }
}
