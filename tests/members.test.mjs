import test from "node:test";
import assert from "node:assert/strict";
import { memberIds, isMemberId } from "../src/lib/member-data.ts";
const a = "d66425ae-28fb-4ac3-bfd9-b77d20a2aee3",
  b = "2fde3aaf-5b5f-47e2-bb17-27c56d81fc7f";
test("public profile lookup accepts bounded UUID batches and deduplicates IDs", () => {
  assert.equal(isMemberId(a), true);
  assert.deepEqual(memberIds(a + "," + b + "," + a), [a, b]);
  assert.deepEqual(memberIds(""), []);
});
test("public profile lookup rejects malformed, oversized and unbounded queries", () => {
  for (const value of [
    "../profile",
    a + ",",
    a + ",invalid",
    Array.from({ length: 51 }, () => a).join(","),
    "x".repeat(2001),
  ])
    assert.throws(() => memberIds(value));
  for (const value of [null, 1, {}, "--------------------", a + "?admin=true"])
    assert.equal(isMemberId(value), false);
});
