import test from "node:test";
import assert from "node:assert/strict";
import {
  discoveryFilters,
  discoveryUrl,
  filterDiscovery,
  licenseKey,
} from "../src/lib/discovery.ts";
const projects = [
  {
    id: 1,
    name: "alice/tiny",
    description: "Browser automation for useful tools",
    category: "Testing",
    language: "TypeScript",
    license: "MIT",
    stars: 1,
    updated: "2026-11-01",
    published: 300,
    source: "community",
    topics: ["api"],
  },
  {
    id: 2,
    name: "tools/giant",
    description: "Browser automation at scale",
    category: "Testing",
    language: "TypeScript",
    license: "MIT",
    stars: 90000,
    updated: "2026-11-02",
    published: 0,
    source: "catalog",
    topics: [],
  },
  {
    id: 3,
    name: "bob/data",
    description: "Python data analysis",
    category: "Data",
    language: "Python",
    license: "NOASSERTION",
    stars: 5,
    updated: "2026-11-03",
    published: 200,
    source: "community",
    topics: ["dataframe"],
  },
  {
    id: 4,
    name: "old/tool",
    description: "An older maintainer publication",
    category: "Tooling",
    language: null,
    license: null,
    stars: 0,
    updated: null,
    published: 100,
    source: "community",
    topics: [],
  },
];
test("discovery combines source, category, language, license and words across fields", () => {
  const f = discoveryFilters({
    source: "community",
    group: "Testing",
    lang: "TypeScript",
    license: "MIT",
    q: "alice api browser",
  });
  assert.deepEqual(
    filterDiscovery(projects, f).map((row) => row.id),
    [1],
  );
  assert.deepEqual(
    filterDiscovery(projects, discoveryFilters({ q: "python browser" })),
    [],
  );
});
test("new maintainer launches rank by first publication independently of GitHub stars", () => {
  assert.deepEqual(
    filterDiscovery(
      projects,
      discoveryFilters({ source: "community", sort: "newest" }),
    ).map((row) => row.id),
    [1, 3, 4],
  );
  assert.deepEqual(
    filterDiscovery(
      projects,
      discoveryFilters({ source: "catalog", sort: "newest" }),
    ).map((row) => row.id),
    [2],
  );
});
test("star and update rankings leave the source array unchanged", () => {
  assert.equal(
    filterDiscovery(projects, discoveryFilters({ sort: "stars" }))[0].id,
    2,
  );
  assert.equal(
    filterDiscovery(projects, discoveryFilters({ sort: "updated" }))[0].id,
    3,
  );
  assert.deepEqual(
    projects.map((row) => row.id),
    [1, 2, 3, 4],
  );
});
test("unspecified licenses share one filter value", () => {
  assert.equal(licenseKey(null), licenseKey("NOASSERTION"));
  assert.deepEqual(
    filterDiscovery(projects, discoveryFilters({ license: "unreported" })).map(
      (row) => row.id,
    ),
    [3, 4],
  );
});
test("shared filter URLs round-trip without empty defaults or unescaped search text", () => {
  const f = discoveryFilters({
    q: "browser & <script>",
    group: "Testing",
    lang: "TypeScript",
    license: "MIT",
    source: "community",
    sort: "newest",
  });
  const href = discoveryUrl(f);
  assert.ok(!href.includes("<script>"));
  assert.deepEqual(
    discoveryFilters(
      Object.fromEntries(new URL(href, "https://example.test").searchParams),
    ),
    f,
  );
  assert.equal(discoveryUrl(discoveryFilters()), "/");
  assert.deepEqual(
    discoveryFilters({
      group: "invalid",
      source: "unknown",
      sort: "bad",
      q: ["ignore"],
    }),
    discoveryFilters(),
  );
});
