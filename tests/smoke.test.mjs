import test from "node:test";
import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL || "http://localhost:3000";
for (const [route, text] of [
  ["/", "Open source index"],
  ["/directory/duckdb/duckdb", "Repository facts"],
  ["/projects/studio-example/formwork", "Forms that fit your product."],
  ["/developers/studio-example", "Ownership not verified"],
  ["/collections/shipping-a-saas", "Shipping a SaaS"],
  ["/dashboard", "DEMO WORKSPACE"],
  ["/for-developers", "Start ownership verification"],
  ["/pricing", "Plans"],
  ["/earnings", "Estimate a creator share"],
  ["/directory/TanStack/query", "https://github.com/sponsors/tannerlinsley"],
  ["/inspect", "Inspect a repository"],
  ["/saved", "My library"],
  ["/collections", "<h1>Collections</h1>"],
  ["/topics/ai-ml", "Indexroom"],
]) {
  test(`${route} supplies server HTML and preview noindex`, async () => {
    const response = await fetch(base + route);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes(text));
    assert.match(html, /<meta name="robots" content="noindex/);
    assert.match(html, /<h1[^>]*>/);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  });
}
test("query input renders as text and cannot create a script element", async () => {
  const response = await fetch(
    base +
      "/explore?q=" +
      encodeURIComponent('<script id="injected">alert(1)</script>'),
  );
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.ok(!html.includes('<script id="injected">'));
  assert.ok(html.includes("No projects match those filters."));
});
test("preview stays outside crawling and sitemaps", async () => {
  const robots = await (await fetch(base + "/robots.txt")).text();
  assert.ok(robots.includes("Disallow: /"));
  const sitemap = await (await fetch(base + "/sitemap.xml")).text();
  assert.ok(!sitemap.includes("<url>"));
});

test("public lookup rejects non-GitHub destinations before any upstream request", async () => {
  const response = await fetch(
    base +
      "/api/github?repo=" +
      encodeURIComponent("https://127.0.0.1/private"),
  );
  assert.equal(response.status, 400);
  assert.match(response.headers.get("content-type"), /application\/json/);
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.ok((await response.json()).error);
});
test("shared search restores its server-rendered language and license filters", async () => {
  const response = await fetch(
    base + "/explore?lang=Python&license=MIT&view=list",
  );
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.ok(html.includes('aria-label="Save Indexroom"'));
  assert.ok(!html.includes('aria-label="Save Formwork"'));
  assert.ok(html.includes("list-layout"));
});
