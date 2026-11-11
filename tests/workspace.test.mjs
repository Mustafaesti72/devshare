import test from "node:test";
import assert from "node:assert/strict";
import {
  mergeWorkspace,
  normalizeWorkspace,
} from "../src/lib/workspace-data.mjs";
const raw = JSON.stringify;
test("independent additions and removals merge across devices", () => {
  assert.deepEqual(
    JSON.parse(
      mergeWorkspace("drp-saved", raw(["a"]), raw(["a", "b"]), raw(["a", "c"])),
    ),
    ["a", "c", "b"],
  );
  assert.deepEqual(
    JSON.parse(
      mergeWorkspace(
        "drp-saved",
        raw(["a", "b"]),
        raw(["b"]),
        raw(["a", "b", "c"]),
      ),
    ),
    ["b", "c"],
  );
  assert.equal(mergeWorkspace("drp-saved", "[]", '["a"]', '["a"]'), '["a"]');
});
test("notes merge by field and protect conflicting text", () => {
  const base = { a: { text: "original", status: "considering" } };
  const local = { a: { text: "my edit", status: "considering" } };
  const remote = { a: { text: "original", status: "using" } };
  assert.deepEqual(
    JSON.parse(mergeWorkspace("drp-notes", raw(base), raw(local), raw(remote))),
    { a: { text: "my edit", status: "using" } },
  );
  assert.throws(() =>
    mergeWorkspace(
      "drp-notes",
      raw(base),
      raw(local),
      raw({ a: { text: "other edit", status: "considering" } }),
    ),
  );
});
test("collection project edits merge and concurrent deletion stays a conflict", () => {
  const item = {
    id: "one",
    name: "Tools",
    description: "",
    color: "teal",
    projectIds: ["a"],
    archived: false,
  };
  const result = JSON.parse(
    mergeWorkspace(
      "drp-collections",
      raw([item]),
      raw([{ ...item, projectIds: ["a", "b"] }]),
      raw([{ ...item, name: "Work" }]),
    ),
  );
  assert.equal(result[0].name, "Work");
  assert.deepEqual(result[0].projectIds, ["a", "b"]);
  assert.throws(() =>
    mergeWorkspace(
      "drp-collections",
      raw([item]),
      "[]",
      raw([{ ...item, name: "Work" }]),
    ),
  );
});

test("concurrent additions cannot silently truncate an account library", () => {
  const base = Array.from({ length: 999 }, (_, i) => String(i));
  assert.throws(() =>
    mergeWorkspace(
      "drp-saved",
      raw(base),
      raw([...base, "local"]),
      raw([...base, "remote"]),
    ),
  );
});

test("cloud source writes preserve more than thirty entries and reject oversized or duplicate lists", () => {
  const sources = Array.from({ length: 501 }, (_, i) => ({
    id: i + 1,
    fullName: "check/source-" + i,
    fetchedAt: "2026-11-11T00:00:00Z",
  }));
  assert.equal(
    JSON.parse(
      normalizeWorkspace("drp-source-references", raw(sources.slice(0, 52))),
    ).length,
    52,
  );
  assert.throws(() =>
    normalizeWorkspace("drp-source-references", raw(sources)),
  );
  assert.throws(() =>
    normalizeWorkspace("drp-source-references", raw([sources[0], sources[0]])),
  );
  assert.throws(() =>
    mergeWorkspace(
      "drp-source-references",
      raw(sources.slice(0, 499)),
      raw(sources.slice(0, 500)),
      raw([...sources.slice(0, 499), sources[500]]),
    ),
  );
});
