import test from "node:test";
import assert from "node:assert/strict";
import {
  projects,
  topics,
  collections,
  searchProjects,
  topicSlug,
  projectPath,
} from "../src/lib/catalog.ts";
test("search combines keyword and category without changing fixtures", () => {
  assert.deepEqual(
    searchProjects(" FORMWORK ", "UI libraries").map((p) => p.id),
    ["formwork"],
  );
  assert.equal(searchProjects("Formwork", "Infrastructure").length, 0);
  assert.equal(searchProjects("no-such-project").length, 0);
  assert.equal(projects.length, 6);
});
test("category slugs and project paths are unique and crawlable", () => {
  assert.equal(new Set(topics.map(topicSlug)).size, topics.length);
  assert.equal(topicSlug("AI & ML"), "ai-ml");
  assert.equal(new Set(projects.map(projectPath)).size, projects.length);
  for (const p of projects)
    assert.match(projectPath(p), /^\/projects\/[a-z-]+\/[a-z-]+$/);
});
test("curated collections reference existing distinct projects", () => {
  for (const c of collections) {
    assert.equal(new Set(c.ids).size, c.ids.length);
    for (const id of c.ids) assert.ok(projects.some((p) => p.id === id));
  }
});
