import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pricing", "/login", "/signup", "/privacy", "/terms"],
      disallow: ["/dashboard", "/connections", "/subscriptions", "/resources", "/billing", "/settings", "/admin", "/auth"],
    },
    sitemap: "https://startupspend.cloud/sitemap.xml",
  };
}
