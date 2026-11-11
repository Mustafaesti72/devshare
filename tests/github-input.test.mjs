import test from "node:test";
import assert from "node:assert/strict";
import {
  parseRepository,
  parseSourceSnapshots,
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
