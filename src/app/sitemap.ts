import type { MetadataRoute } from "next";
import { categories } from "@/lib/categories";
import { indexable, siteUrl } from "@/lib/site";
import records from "@/lib/directory.json";
import bundles from "@/lib/bundles.json";
import articles from "@/lib/articles.json";
import { publishedPaths, publishedMembers } from "@/lib/publishing.mjs";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!indexable) return [];
  const base = [
    "/",
    "/blog",
    "/trending",
    ...categories.map((c) => "/topics/" + c.slug),
    "/for-developers",
    "/earnings",
    ...bundles.map((b) => "/bundles/" + b.slug),
    ...records.map((r) => "/directory/" + r.fullName),
    ...articles.map((a) => "/blog/" + a.slug),
  ].map((path) => ({ url: new URL(path, siteUrl).href }));
  const projects = await publishedPaths();
  return [
    ...base,
    ...(await publishedMembers()).map((user) => ({
      url: new URL("/members/" + user.id, siteUrl).href,
    })),
    ...projects.map((p) => ({
      url: new URL("/showcase/" + p.full_name, siteUrl).href,
      lastModified: new Date(p.submitted),
    })),
  ];
}
