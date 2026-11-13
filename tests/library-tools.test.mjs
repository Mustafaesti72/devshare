import test from "node:test";
import assert from "node:assert/strict";
import {
  filterLibrary,
  libraryStats,
  libraryJson,
  libraryMarkdown,
} from "../src/lib/library-tools.ts";
const items = [
  {
    id: "github:1",
    name: "alice/tool",
    description: "Browser testing",
    url: "https://github.com/alice/tool",
    language: "TypeScript",
    license: "MIT",
    stars: 4,
    topics: ["automation"],
  },
  {
    id: "github:2",
    name: "bob/data",
    description: "Dataframes",
    url: "https://github.com/bob/data",
    language: "Python",
    license: null,
    stars: 20,
  },
  {
    id: "github:3",
    name: "carol/cli",
    description: "Terminal tools",
    url: "https://github.com/carol/cli",
    language: "Rust",
    license: "MIT",
    stars: 10,
  },
];
const notes = {
  "github:1": { text: "İstanbul release checklist", status: "shortlisted" },
  "github:2": { text: "For quarterly analysis", status: "using" },
};
const collections = [
  {
    id: "work",
    name: "Release tools",
    description: "",
    color: "teal",
    projectIds: ["github:1"],
    archived: false,
  },
  {
    id: "old",
    name: "Old research",
    description: "",
    color: "sand",
    projectIds: ["github:2"],
    archived: true,
  },
];
const filters = { query: "", decision: "", collection: "", sort: "saved" };
test("library search combines private notes, collection names, metadata and decisions", () => {
  assert.deepEqual(
    filterLibrary(items, notes, collections, {
      ...filters,
      query: "checklist TypeScript release",
      decision: "shortlisted",
      collection: "work",
    }).map((row) => row.id),
    ["github:1"],
  );
  assert.deepEqual(
    filterLibrary(items, notes, collections, {
      ...filters,
      query: "automation checklist",
    }).map((row) => row.id),
    ["github:1"],
  );
  assert.deepEqual(
    filterLibrary(items, notes, collections, {
      ...filters,
      query: "Python checklist",
    }),
    [],
  );
});
test("unfiled filtering treats archived collections as real membership", () => {
  assert.deepEqual(
    filterLibrary(items, notes, collections, {
      ...filters,
      collection: "__unfiled",
    }).map((row) => row.id),
    ["github:3"],
  );
  assert.deepEqual(
    filterLibrary(items, notes, collections, {
      ...filters,
      collection: "old",
    }).map((row) => row.id),
    ["github:2"],
  );
});
test("library sorting and decision summaries preserve the original library order", () => {
  assert.deepEqual(
    filterLibrary(items, notes, collections, { ...filters, sort: "stars" }).map(
      (row) => row.id,
    ),
    ["github:2", "github:3", "github:1"],
  );
  assert.deepEqual(
    filterLibrary(items, notes, collections, { ...filters, sort: "name" }).map(
      (row) => row.id,
    ),
    ["github:1", "github:2", "github:3"],
  );
  assert.equal(items[0].id, "github:1");
  assert.deepEqual(libraryStats(items, notes), {
    total: 3,
    considering: 1,
    shortlisted: 1,
    using: 1,
  });
});
const workspace = {
  references: [
    {
      id: 1,
      fullName: "alice/tool",
      description: "Tool",
      fetchedAt: "2026-11-12T00:00:00Z",
      sourceUrl: "javascript:bad",
      privateKey: "excluded",
    },
  ],
  saved: ["legacy"],
  notes,
  collections,
  following: ["member:example"],
};
test("JSON export retains all library data and excludes unrelated account credentials", () => {
  const json = libraryJson(
    {
      ...workspace,
      sessionToken: "do-not-export",
      account: { email: "private@example.test" },
    },
    new Date("2026-11-12T00:00:00Z"),
  );
  const archive = JSON.parse(json);
  assert.equal(archive.format, "devshare-library");
  assert.equal(archive.version, 1);
  assert.equal(
    archive.data.sources[0].sourceUrl,
    "https://github.com/alice/tool",
  );
  assert.deepEqual(archive.data.notes, notes);
  assert.deepEqual(archive.data.collections, collections);
  assert.deepEqual(archive.data.saved, ["legacy"]);
  assert.deepEqual(archive.data.following, ["member:example"]);
  assert.ok(!json.includes("do-not-export"));
  assert.ok(!json.includes("private@example.test"));
  assert.ok(!json.includes("privateKey"));
});
test("JSON archives do not truncate the device follow list to the cloud write limit", () => {
  const following = Array.from({ length: 1001 }, (_, i) => "member:" + i);
  assert.equal(
    JSON.parse(libraryJson({ ...workspace, following })).data.following.length,
    1001,
  );
});
test("Markdown exports only the supplied view and preserves its notes and collections", () => {
  const markdown = libraryMarkdown(
    [items[0]],
    notes,
    collections,
    "https://example.test",
    new Date("2026-11-12T00:00:00Z"),
  );
  assert.ok(markdown.includes("1 project in this view"));
  assert.ok(markdown.includes("İstanbul release checklist"));
  assert.ok(markdown.includes("Release tools"));
  assert.ok(markdown.includes("Shortlisted"));
  assert.ok(!markdown.includes("bob/data"));
  assert.ok(markdown.includes("https://github.com/alice/tool"));
});
test("Markdown escapes active markup and rejects unsafe or credential-bearing links", () => {
  const bad = [
    { ...items[0], name: "<script>bad</script>", url: "javascript:alert(1)" },
    { ...items[1], url: "https://user:password@example.test/private" },
  ];
  const text = libraryMarkdown(
    bad,
    {
      "github:1": {
        text: "<img src=x onerror=bad>\n[unsafe](javascript:bad)",
        status: "considering",
      },
    },
    [],
    "https://example.test",
  );
  assert.ok(!text.includes("<script>"));
  assert.ok(!text.includes("<img"));
  assert.ok(!text.includes("[Open source](javascript:"));
  assert.ok(!text.includes("user:password"));
  assert.ok(text.includes("&lt;script&gt;"));
});
