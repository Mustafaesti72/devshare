import { categoryNames } from "./categories.ts";
export type DiscoveryFilters = {
  q: string;
  group: string;
  language: string;
  license: string;
  source: "all" | "community" | "catalog";
  sort: "editor" | "stars" | "updated" | "newest";
};
export type DiscoveryProject = {
  id: number;
  name: string;
  description: string;
  category: string;
  language: string | null;
  license: string | null;
  stars: number;
  updated: string | null;
  published: number;
  source: "community" | "catalog";
  topics?: string[];
};
export const licenseKey = (value: string | null) =>
  !value || value === "NOASSERTION" || value === "unreported"
    ? "unreported"
    : value;
export function discoveryFilters(
  input: Record<string, unknown> = {},
): DiscoveryFilters {
  const text = (key: string, max = 200) =>
    typeof input[key] === "string"
      ? (input[key] as string).trim().slice(0, max)
      : "";
  const source = text("source"),
    sort = text("sort"),
    group = text("group");
  return {
    q: text("q"),
    group: categoryNames.includes(group) ? group : "All",
    language: text("lang", 80),
    license: text("license", 100) ? licenseKey(text("license", 100)) : "",
    source: source === "community" || source === "catalog" ? source : "all",
    sort:
      sort === "stars" || sort === "updated" || sort === "newest"
        ? sort
        : "editor",
  };
}
export function discoveryUrl(filters: DiscoveryFilters) {
  const p = new URLSearchParams();
  if (filters.q.trim()) p.set("q", filters.q.trim());
  if (filters.group !== "All") p.set("group", filters.group);
  if (filters.language) p.set("lang", filters.language);
  if (filters.license) p.set("license", licenseKey(filters.license));
  if (filters.source !== "all") p.set("source", filters.source);
  if (filters.sort !== "editor") p.set("sort", filters.sort);
  return p.size ? "/explore?" + p.toString() : "/";
}
export function filterDiscovery<T extends DiscoveryProject>(
  projects: T[],
  filters: DiscoveryFilters,
): T[] {
  const words = filters.q
    .toLocaleLowerCase("en-US")
    .split(/\s+/)
    .filter(Boolean);
  const result = projects.filter((project) => {
    const haystack = [
      project.name,
      project.description,
      project.category,
      project.language,
      ...(project.topics || []),
    ]
      .join(" ")
      .toLocaleLowerCase("en-US");
    return (
      (filters.group === "All" || project.category === filters.group) &&
      (!filters.language || project.language === filters.language) &&
      (!filters.license ||
        licenseKey(project.license) === licenseKey(filters.license)) &&
      (filters.source === "all" || project.source === filters.source) &&
      words.every((word) => haystack.includes(word))
    );
  });
  if (filters.sort === "stars")
    result.sort(
      (a, b) => b.stars - a.stars || a.name.localeCompare(b.name, "en-US"),
    );
  if (filters.sort === "updated")
    result.sort(
      (a, b) =>
        (b.updated || "").localeCompare(a.updated || "") ||
        a.name.localeCompare(b.name, "en-US"),
    );
  if (filters.sort === "newest")
    result.sort(
      (a, b) =>
        b.published - a.published || a.name.localeCompare(b.name, "en-US"),
    );
  return result;
}
