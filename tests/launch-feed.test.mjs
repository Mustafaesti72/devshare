import test from "node:test";
import assert from "node:assert/strict";
import { launchFeed } from "../src/lib/launch-feed.ts";
const origin = "https://example.test",
  time = Date.UTC(2026, 10, 12);
const row = {
  id: 1,
  full_name: "alice/tool",
  summary: "A useful developer tool",
  submitted: time + 90000,
  published_at: time,
};
test("RSS uses first publication and stable repository identity across renames", () => {
  const xml = launchFeed([row], origin),
    renamed = launchFeed(
      [{ ...row, full_name: "alice/renamed", submitted: time + 180000 }],
      origin,
    );
  assert.ok(xml.includes(new Date(time).toUTCString()));
  assert.ok(xml.includes('<guid isPermaLink="false">devshare:github:1</guid>'));
  assert.ok(
    renamed.includes('<guid isPermaLink="false">devshare:github:1</guid>'),
  );
  assert.ok(renamed.includes("https://example.test/showcase/alice/renamed"));
});
test("RSS escapes descriptions and removes characters forbidden by XML", () => {
  const xml = launchFeed(
    [{ ...row, summary: '</description><script>bad & "quote"</script>\u0001' }],
    origin,
  );
  assert.ok(!xml.includes("<script>"));
  assert.ok(xml.includes("&lt;script&gt;"));
  assert.ok(xml.includes("&amp;"));
  assert.ok(!xml.includes("\u0001"));
});
test("RSS caps the latest launches at fifty and omits invalid repository paths and dates", () => {
  const rows = Array.from({ length: 60 }, (_, i) => ({
    ...row,
    id: i + 1,
    full_name: "alice/tool-" + i,
    published_at: time + i * 1000,
  }));
  const xml = launchFeed(
    [
      ...rows,
      { ...row, id: 99, full_name: "alice/.." },
      { ...row, id: 100, published_at: 1e30 },
    ],
    origin,
  );
  assert.equal((xml.match(/<item>/g) || []).length, 50);
  assert.ok(xml.indexOf("alice/tool-59") < xml.indexOf("alice/tool-58"));
  assert.ok(!xml.includes("alice/.."));
  assert.ok(!xml.includes("Invalid Date"));
  assert.ok(launchFeed([], origin).includes("<channel>"));
});
