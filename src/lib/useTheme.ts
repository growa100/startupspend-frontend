"use client";

import { useEffect, useState } from "react";

/**
 * Reads the current theme attribute off `<html>`. Updates when the user
 * toggles via ThemeToggle (which sets/removes data-theme="light" on
 * documentElement). Used by chart components that need to pass literal
 * hex strings to recharts — recharts axes/strokes don't pick up CSS
 * vars at render time, so we have to compute them in JS.
 */
export type Theme = "light" | "dark";

export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const read = (): Theme =>
      document.documentElement.dataset.theme === "light" ? "light" : "dark";
    setTheme(read());
    const observer = new MutationObserver(() => setTheme(read()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}

/**
 * Convenience: returns the colour pair recharts needs for a given
 * (light/dark) theme. Centralised so it stays consistent across the
 * dashboard and history charts.
 */
export type ChartTokens = {
  grid: string;
  axis: string;
  cursorBar: string;
  cursorLine: string;
};

export function getChartTokens(theme: Theme): ChartTokens {
  if (theme === "light") {
    return {
      grid: "#e2e8f0",
      axis: "#94a3b8",
      cursorBar: "rgba(15,23,42,0.04)",
      cursorLine: "#cbd5e1",
    };
  }
  return {
    grid: "#1a1a1a",
    axis: "#52525b",
    cursorBar: "rgba(255,255,255,0.04)",
    cursorLine: "#404040",
  };
}
