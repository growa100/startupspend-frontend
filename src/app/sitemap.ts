import type { MetadataRoute } from "next";

const BASE = "https://startupspend.cloud";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, priority: 1 },
    { url: `${BASE}/pricing`, lastModified: now, priority: 0.8 },
    { url: `${BASE}/login`, lastModified: now, priority: 0.4 },
    { url: `${BASE}/signup`, lastModified: now, priority: 0.6 },
    { url: `${BASE}/privacy`, lastModified: now, priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, priority: 0.3 },
  ];
}
