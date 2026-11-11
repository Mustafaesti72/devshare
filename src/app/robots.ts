import type { MetadataRoute } from "next";
import { indexable, siteUrl } from "@/lib/site";
export default function robots(): MetadataRoute.Robots {
  return indexable
    ? {
        rules: {
          userAgent: "*",
          allow: "/",
          disallow: [
            "/api/",
            "/moderation",
            "/profile",
            "/dashboard",
            "/explore",
            "/saved",
            "/compare",
            "/inspect",
            "/projects/",
            "/developers/",
            "/collections/",
            "/report",
          ],
        },
        sitemap: new URL("/sitemap.xml", siteUrl).href,
      }
    : { rules: { userAgent: "*", disallow: "/" } };
}
