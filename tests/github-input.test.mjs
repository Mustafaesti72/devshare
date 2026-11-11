import test from "node:test";
import assert from "node:assert/strict";
import {
  parseRepository,
  parseSourceSnapshots,
  storeSourceSnapshot,
  sourceSnapshotLimit,
} from "../src/lib/github-input.ts";
test("accepts repository coordinates and canonical GitHub URLs", () => {
  assert.deepEqual(parseRepository(" octocat/Hello-World "), {
    owner: "octocat",
    repo: "Hello-World",
  });
  assert.deepEqual(parseRepository("https://github.com/vercel/next.js.git"), {
    owner: "vercel",
    repo: "next.js",
  });
  assert.deepEqual(parseRepository("withastro/astro/"), {
    owner: "withastro",
    repo: "astro",
  });
});
test("rejects SSRF destinations, credentials, custom ports and unsafe schemes", () => {
  for (const value of [
    "https://evil.example/a/b",
    "http://github.com/a/b",
    "https://github.com.evil.example/a/b",
    "https://me:secret@github.com/a/b",
    "https://github.com:8080/a/b",
    "file:///etc/passwd",
    "https://127.0.0.1/a/b",
  ])
    assert.equal(parseRepository(value), null, value);
});
test("rejects ambiguous subpaths, dot segments, query strings and oversized input", () => {
  for (const value of [
    "a/b/issues",
    "a/..",
    "a/.",
    "a/%2e%2e",
    "https://github.com/a/b?token=secret",
    "https://github.com/a/b#readme",
    "a/b\n/c",
    "a/" + "b".repeat(101),
    "a".repeat(251),
  ])
    assert.equal(parseRepository(value), null, value);
});

test("saved source snapshots validate URLs and safely normalize corrupt fields", () => {
  assert.deepEqual(parseSourceSnapshots("not-json"), []);
  const [p] = parseSourceSnapshots(
    JSON.stringify([
      {
        id: 1,
        fullName: "octocat/Hello-World",
        fetchedAt: "2026-11-11T00:00:00Z",
        sourceUrl: "javascript:alert(1)",
        description: { bad: true },
        stars: -3,
        topics: ["example", null],
      },
    ]),
  );
  assert.equal(p.sourceUrl, "https://github.com/octocat/Hello-World");
  assert.equal(p.description, "");
  assert.equal(p.license, null);
  assert.equal(p.stars, 0);
  assert.deepEqual(p.topics, ["example"]);
  assert.deepEqual(
    parseSourceSnapshots(
      JSON.stringify([
        { id: 2, fullName: "evil.invalid/x/y", fetchedAt: "bad" },
      ]),
    ),
    [],
  );
});

test("a full catalog survives saving beyond thirty sources and updates retain every other source", async () => {
  const { readFile } = await import("node:fs/promises");
  const catalog = JSON.parse(
    await readFile(
      new URL("../src/lib/directory.json", import.meta.url),
      "utf8",
    ),
  );
  let raw = "[]";
  for (const source of catalog) raw = storeSourceSnapshot(raw, source);
  const saved = parseSourceSnapshots(raw);
  assert.equal(saved.length, catalog.length);
  assert.deepEqual(
    new Set(saved.map((source) => source.id)),
    new Set(catalog.map((source) => source.id)),
  );
  raw = storeSourceSnapshot(raw, {
    ...catalog[0],
    description: "Updated source description",
  });
  assert.equal(parseSourceSnapshots(raw).length, catalog.length);
  assert.equal(
    parseSourceSnapshots(raw)[0].description,
    "Updated source description",
  );
});
test("source capacity rejects a new entry without evicting existing records and permits refreshes", () => {
  const sources = Array.from({ length: sourceSnapshotLimit }, (_, i) => ({
    id: i + 1,
    fullName: "check/source-" + i,
    fetchedAt: "2026-11-11T00:00:00Z",
  }));
  const raw = JSON.stringify(sources);
  assert.throws(() =>
    storeSourceSnapshot(raw, { ...sources[0], id: sourceSnapshotLimit + 1 }),
  );
  assert.equal(parseSourceSnapshots(raw).length, sourceSnapshotLimit);
  assert.equal(
    parseSourceSnapshots(storeSourceSnapshot(raw, sources[0])).length,
    sourceSnapshotLimit,
  );
});
