import test from "node:test";
import assert from "node:assert/strict";
import { parseCollections, parseNotes } from "../src/lib/research-data.ts";
test("broken browser data falls back safely", () => {
  assert.deepEqual(parseCollections("not-json"), []);
  assert.deepEqual(parseCollections("{}"), []);
  assert.deepEqual(parseNotes("null"), {});
  assert.deepEqual(parseNotes("[]"), {});
});
test("collections validate and bound user content without losing saved project ids", () => {
  const [c] = parseCollections(
    JSON.stringify([
      {
        id: "local",
        name: "x".repeat(100),
        description: "d".repeat(500),
        color: "invalid",
        projectIds: ["formwork", "formwork", 123],
        archived: true,
      },
    ]),
  );
  assert.equal(c.name.length, 80);
  assert.equal(c.description.length, 400);
  assert.equal(c.color, "teal");
  assert.deepEqual(c.projectIds, ["formwork"]);
  assert.equal(c.archived, true);
});
test("notes validate decision status and keep text as plain data", () => {
  const n = parseNotes(
    JSON.stringify({
      formwork: { text: "<script>alert(1)</script>", status: "unknown" },
      bad: { text: 123 },
      long: { text: "x".repeat(4000), status: "shortlisted" },
    }),
  );
  assert.equal(n.formwork.status, "considering");
  assert.equal(n.formwork.text, "<script>alert(1)</script>");
  assert.equal(n.bad, undefined);
  assert.equal(n.long.text.length, 3000);
  assert.equal(n.long.status, "shortlisted");
});
