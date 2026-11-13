import { parseSourceSnapshots, type PublicRepository } from "./github-input.ts";
import type { PersonalCollection, ResearchNote } from "./research-data.ts";
import { parseCollections, parseNotes } from "./research-data.ts";
export type LibraryItem = {
  id: string;
  name: string;
  description: string;
  url: string;
  language?: string | null;
  license?: string | null;
  stars?: number;
  topics?: string[];
};
export type LibraryFilters = {
  query: string;
  decision: string;
  collection: string;
  sort: string;
};
export type ExportWorkspace = {
  references: PublicRepository[];
  saved: string[];
  notes: Record<string, ResearchNote>;
  collections: PersonalCollection[];
  following: string[];
};
export function filterLibrary<T extends LibraryItem>(
  items: T[],
  notes: Record<string, ResearchNote>,
  collections: PersonalCollection[],
  filters: LibraryFilters,
): T[] {
  const membership = new Map<string, PersonalCollection[]>();
  for (const collection of collections)
    for (const id of collection.projectIds)
      membership.set(id, [...(membership.get(id) || []), collection]);
  const words = filters.query
    .trim()
    .toLocaleLowerCase("en-US")
    .split(/\s+/)
    .filter(Boolean);
  const filtered = items.filter((item) => {
    const note = Object.hasOwn(notes, item.id) ? notes[item.id] : undefined;
    const groups = membership.get(item.id) || [];
    const text = [
      item.name,
      item.description,
      item.language,
      item.license,
      note?.text,
      ...(item.topics || []),
      ...groups.map((group) => group.name),
    ]
      .join(" ")
      .toLocaleLowerCase("en-US");
    return (
      (!filters.decision ||
        (note?.status || "considering") === filters.decision) &&
      (!filters.collection ||
        (filters.collection === "__unfiled"
          ? !groups.length
          : groups.some((group) => group.id === filters.collection))) &&
      words.every((word) => text.includes(word))
    );
  });
  if (filters.sort === "name")
    filtered.sort((a, b) => a.name.localeCompare(b.name, "en-US"));
  if (filters.sort === "stars")
    filtered.sort(
      (a, b) =>
        (b.stars || 0) - (a.stars || 0) ||
        a.name.localeCompare(b.name, "en-US"),
    );
  return filtered;
}
export function libraryStats(
  items: LibraryItem[],
  notes: Record<string, ResearchNote>,
) {
  const result = {
    total: items.length,
    considering: 0,
    shortlisted: 0,
    using: 0,
  };
  for (const item of items) {
    const status = notes[item.id]?.status;
    result[
      status === "shortlisted" || status === "using" ? status : "considering"
    ]++;
  }
  return result;
}
export function libraryJson(workspace: ExportWorkspace, now = new Date()) {
  return JSON.stringify(
    {
      format: "devshare-library",
      version: 1,
      exportedAt: now.toISOString(),
      data: {
        sources: parseSourceSnapshots(JSON.stringify(workspace.references)),
        saved: [
          ...new Set(
            workspace.saved.filter((value) => typeof value === "string"),
          ),
        ],
        notes: parseNotes(JSON.stringify(workspace.notes)),
        collections: parseCollections(JSON.stringify(workspace.collections)),
        following: [
          ...new Set(
            workspace.following.filter((value) => typeof value === "string"),
          ),
        ],
      },
    },
    null,
    2,
  );
}
function markdown(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/([\\`*_{}\[\]()#+.!|~-])/g, "\\$1");
}
function sourceUrl(value: string, origin: string) {
  try {
    const url = new URL(value, origin);
    if (url.username || url.password) return null;
    if (
      url.protocol !== "https:" &&
      !(
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname)
      )
    )
      return null;
    return url.href.replace(
      /[()]/g,
      (char) => "%" + char.charCodeAt(0).toString(16).toUpperCase(),
    );
  } catch {
    return null;
  }
}
export function libraryMarkdown(
  items: LibraryItem[],
  notes: Record<string, ResearchNote>,
  collections: PersonalCollection[],
  origin: string,
  now = new Date(),
) {
  const blocks = items.map((item) => {
    const note = Object.hasOwn(notes, item.id) ? notes[item.id] : undefined;
    const groups = collections
      .filter((group) => group.projectIds.includes(item.id))
      .map((group) => group.name + (group.archived ? " (archived)" : ""));
    const url = sourceUrl(item.url, origin);
    const details = [
      "## " + markdown(item.name),
      markdown(item.description),
      ...(url ? ["[Open source](" + url + ")"] : []),
      "- Decision: " +
        {
          considering: "Considering",
          shortlisted: "Shortlisted",
          using: "Using this",
        }[note?.status || "considering"],
      "- Language: " + markdown(item.language || "Not reported"),
      "- License: " +
        markdown(
          !item.license || item.license === "NOASSERTION"
            ? "Review source license"
            : item.license,
        ),
      "- Collections: " + markdown(groups.join(", ") || "None"),
    ];
    if (note?.text)
      details.push(
        "### Notes",
        " > " +
          markdown(note.text).replace(/\r\n?/g, "\n").replace(/\n/g, "\n > "),
      );
    return details.join("\n\n");
  });
  return (
    "# DevShare library\n\nExported " +
    now.toISOString() +
    "\n\n" +
    items.length +
    (items.length === 1 ? " project" : " projects") +
    " in this view.\n\n" +
    blocks.join("\n\n---\n\n") +
    "\n"
  );
}
