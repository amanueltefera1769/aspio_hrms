import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!process.env.SITE_URL) return [];
  const origin = process.env.SITE_URL.replace(/\/$/, "");
  return ["/", "/services", "/about", "/demo", "/contact"].map((path) => ({ url: `${origin}${path}`, changeFrequency: "monthly", priority: path === "/" ? 1 : .7 }));
}
