import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import pg from "pg";
import { readFile } from "node:fs/promises";
if (!process.env.DATABASE_URL)
  throw new Error("A PostgreSQL test connection is required");
const schema = "mvp_check_" + randomBytes(8).toString("hex");
const admin = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
});
let db,
  created = false;
try {
  await admin.query('CREATE SCHEMA "' + schema + '"');
  created = true;
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set("options", "-c search_path=" + schema);
  process.env.DATABASE_URL = url.href;
  process.env.GITHUB_CLIENT_SECRET ||= "temporary-test-key-" + randomUUID();
  db = await import("../src/lib/postgres.mjs");
  await db.initialize();
  assert.equal(
    (await db.pool.query("SELECT current_schema() AS name")).rows[0].name,
    schema,
  );
  const accounts = await import("../src/lib/accounts.mjs");
  const publishing = await import("../src/lib/publishing.mjs");
  const engagement = await import("../src/lib/engagement.mjs");
  const reports = await import("../src/lib/reports.mjs");
  const profiles = await import("../src/lib/profile-moderation.mjs");
  const { apiLimit } = await import("../src/lib/api-limit.mjs");
  const session = await accounts.createSession({
    id: 991,
    login: "mvp-check",
    name: "MVP Check",
    avatar_url: "https://avatars.githubusercontent.com/u/991",
  });
  const user = await accounts.sessionUser(session);
  const workspace = await import("../src/lib/workspace.mjs");
  const catalog = JSON.parse(
    await readFile(
      new URL("../src/lib/directory.json", import.meta.url),
      "utf8",
    ),
  );
  const savedSources = await workspace.writeWorkspace(
    user.id,
    "drp-source-references",
    "[]",
    JSON.stringify(catalog),
  );
  assert.equal(savedSources.conflict, false);
  assert.equal(
    JSON.parse(
      (await workspace.readWorkspace(user.id))["drp-source-references"],
    ).length,
    catalog.length,
  );

  const proof = await db.startProof("mvp-check/tool");
  await db.submit(
    proof.token,
    {
      id: 9911,
      full_name: "mvp-check/tool",
      owner: { id: 991 },
      language: "TypeScript",
      license: { spdx_id: "MIT" },
      stargazers_count: 7,
    },
    "A verified source repository for isolated checks.",
    "Web",
  );
  let row = (await publishing.pendingReviews("pending"))[0];
  assert.equal(
    await publishing.moderate(
      row.id,
      row.revision,
      "approved",
      "Public repository verified",
      991,
    ),
    true,
  );
  row = await publishing.publishedProject("mvp-check/tool");
  assert.equal(row.repository.language, "TypeScript");
  assert.equal(row.category, "Web");
  const token = engagement.engagementToken(row.id),
    actor = randomUUID();
  assert.equal(engagement.verifyEngagementToken(token).id, row.id);
  assert.equal(engagement.verifyEngagementToken(token + "x"), null);
  assert.equal(
    engagement.verifyEngagementToken(
      engagement.engagementToken(row.id, Date.now() - 3600001),
    ),
    null,
  );
  assert.equal(
    await engagement.recordEngagement({
      token,
      actor,
      kind: "view",
      source: "Direct",
    }),
    true,
  );
  assert.equal(
    await engagement.recordEngagement({
      token,
      actor: randomUUID(),
      kind: "view",
      source: "Direct",
    }),
    false,
  );
  assert.equal(
    await engagement.recordEngagement({
      token: engagement.engagementToken(row.id),
      actor,
      kind: "view",
      source: "Direct",
    }),
    false,
  );
  assert.equal(
    await engagement.recordEngagement({
      token,
      actor,
      kind: "outbound",
      source: "GitHub",
    }),
    true,
  );
  assert.equal(
    await engagement.recordEngagement({
      token: engagement.engagementToken(row.id),
      actor: randomUUID(),
      kind: "outbound",
      source: "Google",
    }),
    true,
  );
  const stats = await engagement.creatorAnalytics(991, user.id, 7);
  assert.equal(stats.period.views, 2);
  assert.equal(stats.period.outbound, 2);
  assert.equal(stats.projects[0].visitors, 2);
  assert.equal(stats.daily.length, 7);
  assert.equal(stats.allTime.views, 2);
  assert.equal(
    (await engagement.creatorAnalytics(992, user.id, 7)).period.views,
    0,
  );
  const report = await reports.submitReport(
    user.id,
    "profile",
    user.id,
    "spam",
    "This is an isolated diagnostic report.",
  );
  assert.equal(
    await reports.submitReport(
      user.id,
      "profile",
      user.id,
      "other",
      "Updated isolated diagnostic report.",
    ),
    report,
  );
  assert.equal((await reports.openReports()).length, 1);
  assert.equal(
    await reports.resolveReport(report, 991, "Reviewed this isolated report."),
    true,
  );
  assert.equal((await reports.openReports()).length, 0);
  let profile = await accounts.publicProfile(user.id);
  assert.equal(
    await profiles.reviewProfile(
      user.id,
      profile.profile_revision,
      "hide",
      "Isolated profile moderation check",
      991,
    ),
    true,
  );
  assert.equal(await accounts.publicProfile(user.id), null);
  assert.equal(await publishing.publishedProject("mvp-check/tool"), null);
  assert.equal(
    await profiles.reviewProfile(
      user.id,
      profile.profile_revision,
      "restore",
      "Stale review must not restore",
      991,
    ),
    false,
  );
  await accounts.updateProfile(user.id, {
    display_name: "Updated Check",
    bio: "Changes for review",
    website: "",
  });
  profile = (await profiles.profileQueue())[0];
  assert.equal(profile.review_requested, true);
  assert.equal(
    await profiles.reviewProfile(
      user.id,
      profile.profile_revision,
      "restore",
      "Reviewed the corrected profile.",
      991,
    ),
    true,
  );
  assert.ok(await accounts.publicProfile(user.id));
  assert.equal(await publishing.publishedProject("mvp-check/tool"), null);
  row = (await publishing.pendingReviews("hidden"))[0];
  assert.equal(
    await publishing.moderate(
      row.id,
      row.revision,
      "approved",
      "Reapproved after profile review",
      991,
    ),
    true,
  );
  const req = new Request("http://localhost", {
    headers: { "x-real-ip": "192.0.2.1" },
  });
  assert.equal(await apiLimit(req, "mvp-check", { limit: 2 }), null);
  assert.equal(await apiLimit(req, "mvp-check", { limit: 2 }), null);
  assert.equal((await apiLimit(req, "mvp-check", { limit: 2 })).status, 429);
  await engagement.cleanEngagement();
  await accounts.deleteAccount(user.id);
  assert.equal(
    (await db.pool.query("SELECT count(*)::int AS n FROM engagement_daily"))
      .rows[0].n,
    0,
  );
  console.log(
    JSON.stringify({
      schemaIsolation: "passed",
      largeSourceLibrary: "passed",
      publicationMetadata: "passed",
      analyticsDeduplication: "passed",
      tokenReplay: "passed",
      analyticsOwnerIsolation: "passed",
      reports: "passed",
      profileModeration: "passed",
      staleReview: "passed",
      rateLimit: "passed",
      deletionCascade: "passed",
    }),
  );
} finally {
  if (db) await db.pool.end();
  if (created) await admin.query('DROP SCHEMA "' + schema + '" CASCADE');
  await admin.end();
}
