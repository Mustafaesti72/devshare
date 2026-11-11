import { parseCollections, parseNotes } from "./research-data.ts";
import { parseSourceSnapshots, sourceSnapshotLimit } from "./github-input.ts";

export const workspaceKeys = [
  "drp-saved",
  "drp-source-references",
  "drp-collections",
  "drp-notes",
  "drp-following",
];
export function emptyValue(key) {
  return key === "drp-notes" ? "{}" : "[]";
}
export function normalizeWorkspace(key, raw) {
  if (
    !workspaceKeys.includes(key) ||
    typeof raw !== "string" ||
    raw.length > 1800000
  )
    throw new Error("Invalid workspace data");
  const parsed = JSON.parse(raw);
  if (key === "drp-notes") {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      throw new Error("Invalid notes");
    return JSON.stringify(parseNotes(raw));
  }
  if (!Array.isArray(parsed)) throw new Error("Invalid workspace list");
  if (key === "drp-collections") {
    const rows = parseCollections(raw).map((c) => ({
      ...c,
      projectIds: c.projectIds.slice(0, 500).map((id) => id.slice(0, 160)),
    }));
    if (new Set(rows.map((r) => r.id)).size !== rows.length)
      throw new Error("Duplicate collection");
    return JSON.stringify(rows);
  }
  if (key === "drp-source-references") {
    if (parsed.length > sourceSnapshotLimit)
      throw new Error("Source library limit reached");
    const sources = parseSourceSnapshots(raw);
    if (new Set(sources.map((source) => source.id)).size !== sources.length)
      throw new Error("Duplicate source");
    return JSON.stringify(sources);
  }
  return JSON.stringify(
    [
      ...new Set(
        parsed.filter((x) => typeof x === "string").map((x) => x.slice(0, 160)),
      ),
    ].slice(0, 1000),
  );
}
function canonical(value) {
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  if (value && typeof value === "object")
    return (
      "{" +
      Object.keys(value)
        .sort()
        .map((k) => JSON.stringify(k) + ":" + canonical(value[k]))
        .join(",") +
      "}"
    );
  return JSON.stringify(value);
}
const equal = (a, b) => canonical(a) === canonical(b);
function merge(base, next, current) {
  if (equal(base, next)) return current;
  if (equal(base, current) || equal(next, current)) return next;
  if (
    Array.isArray(base) &&
    Array.isArray(next) &&
    Array.isArray(current) &&
    [...base, ...next, ...current].every((x) => typeof x === "string")
  ) {
    const removed = new Set(base.filter((x) => !next.includes(x)));
    return [
      ...new Set([
        ...current.filter((x) => !removed.has(x)),
        ...next.filter((x) => !base.includes(x)),
      ]),
    ];
  }
  if (
    base &&
    next &&
    current &&
    typeof base === "object" &&
    typeof next === "object" &&
    typeof current === "object" &&
    ![base, next, current].some(Array.isArray)
  ) {
    const result = { ...current };
    for (const key of new Set([...Object.keys(base), ...Object.keys(next)])) {
      const value = merge(base[key], next[key], current[key]);
      if (value === undefined) delete result[key];
      else
        Object.defineProperty(result, key, {
          value,
          writable: true,
          enumerable: true,
          configurable: true,
        });
    }
    return result;
  }
  throw new Error("Workspace conflict");
}
export function mergeWorkspace(key, baseRaw, nextRaw, currentRaw) {
  const [base, next, current] = [baseRaw, nextRaw, currentRaw].map((raw) =>
    JSON.parse(normalizeWorkspace(key, raw)),
  );
  if (["drp-collections", "drp-source-references"].includes(key)) {
    const asMap = (rows) =>
      Object.fromEntries(rows.map((row) => [row.id, row]));
    const result = merge(asMap(base), asMap(next), asMap(current));
    const order = [
      ...new Set([...next, ...current].map((row) => String(row.id))),
    ];
    const rows = order
      .filter((id) => Object.hasOwn(result, id))
      .map((id) => result[id]);
    if (rows.length > (key === "drp-collections" ? 100 : sourceSnapshotLimit))
      throw new Error("Workspace limit reached");
    return normalizeWorkspace(key, JSON.stringify(rows));
  }
  const merged = merge(base, next, current);
  if (
    (Array.isArray(merged) ? merged.length : Object.keys(merged).length) >
    (key === "drp-notes" ? 500 : 1000)
  )
    throw new Error("Workspace limit reached");
  return normalizeWorkspace(key, JSON.stringify(merged));
}
