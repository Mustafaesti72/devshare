import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import pg from "pg";
import { readImage } from "../src/lib/media.mjs";

if (!process.env.DATABASE_URL) throw new Error("PostgreSQL is required");
const schema = "storage_check_" + randomBytes(8).toString("hex");
const admin = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  connectionTimeoutMillis: 5000,
});
let db;
try {
  await admin.query('CREATE SCHEMA "' + schema + '"');
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set("options", "-c search_path=" + schema);
  process.env.DATABASE_URL = url.href;
  db = await import("../src/lib/postgres.mjs");
  const { token, phrase } = await db.startProof("check/widget");
  assert.equal((await db.getProof(token)).phrase, phrase);
  const attempts = await Promise.all(
    Array.from({ length: 12 }, () => db.reserveAttempt(token)),
  );
  assert.equal(attempts.filter(Boolean).length, 5);
  await assert.rejects(() =>
    db.submit(
      token,
      { id: 1, full_name: "wrong/widget", owner: { id: 1 } },
      "Check",
    ),
  );
  assert.ok(await db.getProof(token));
  const results = await Promise.allSettled(
    Array.from({ length: 2 }, () =>
      db.submit(
        token,
        { id: 1, full_name: "check/widget", owner: { id: 1 } },
        "Diagnostic record",
      ),
    ),
  );
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(await db.getProof(token), undefined);
  assert.equal((await db.listings("pending")).length, 1);
  await db.review(1, "approved");
  assert.equal((await db.listings("approved")).length, 1);
  await db.review(1, "hidden");
  assert.equal((await db.listings("approved")).length, 0);
  const accounts = await import("../src/lib/accounts.mjs");
  const login = await accounts.startLogin();
  assert.ok(accounts.sameState(login.state, login.state));
  assert.ok(!accounts.sameState(login.state, "invalid"));
  const consumed = await Promise.all([
    accounts.consumeLogin(login.state),
    accounts.consumeLogin(login.state),
  ]);
  assert.equal(consumed.filter(Boolean).length, 1);
  const identity = {
    id: 1,
    login: "storage-check",
    name: "Storage Check",
    bio: "Temporary diagnostic",
    avatar_url: "https://avatars.githubusercontent.com/u/1",
  };
  const firstToken = await accounts.createSession(identity);
  const user = await accounts.sessionUser(firstToken);
  assert.equal(user.github_id, 1);
  assert.equal(
    (await db.pool.query("SELECT token_hash FROM sessions")).rows[0].token_hash,
    accounts.hash(firstToken),
  );
  await accounts.updateProfile(user.id, {
    display_name: "Updated Name",
    bio: "Test bio",
    website: "https://example.com",
  });
  assert.equal(
    (await accounts.publicProfile(user.id)).display_name,
    "Updated Name",
  );
  await assert.rejects(() =>
    accounts.updateProfile(user.id, {
      display_name: "Bad URL",
      bio: "",
      website: "javascript:alert(1)",
    }),
  );
  assert.equal(await accounts.publicProfile("invalid"), null);
  const secondToken = await accounts.createSession(identity);
  await accounts.endSession(firstToken, true);
  assert.equal(await accounts.sessionUser(firstToken), null);
  assert.equal(await accounts.sessionUser(secondToken), null);
  const thirdToken = await accounts.createSession(identity);
  assert.equal(
    (await accounts.sessionUser(thirdToken)).display_name,
    "Updated Name",
  );

  const workspace = await import("../src/lib/workspace.mjs");
  await workspace.writeWorkspace(user.id, "drp-saved", "[]", '["github:1"]');
  await Promise.all([
    workspace.writeWorkspace(
      user.id,
      "drp-saved",
      '["github:1"]',
      '["github:1","github:2"]',
    ),
    workspace.writeWorkspace(
      user.id,
      "drp-saved",
      '["github:1"]',
      '["github:1","github:3"]',
    ),
  ]);
  const saved = JSON.parse(
    (await workspace.readWorkspace(user.id))["drp-saved"],
  );
  assert.equal(saved.length, 3);
  const noteBase = '{"p":{"text":"base","status":"considering"}}';
  await workspace.writeWorkspace(user.id, "drp-notes", "{}", noteBase);
  const edit = await workspace.writeWorkspace(
    user.id,
    "drp-notes",
    noteBase,
    '{"p":{"text":"first","status":"considering"}}',
  );
  assert.equal(edit.conflict, false);
  const collision = await workspace.writeWorkspace(
    user.id,
    "drp-notes",
    noteBase,
    '{"p":{"text":"second","status":"considering"}}',
  );
  assert.equal(collision.conflict, true);
  assert.equal(JSON.parse(collision.value).p.text, "first");
  const otherToken = await accounts.createSession({
    ...identity,
    id: 2,
    login: "other-check",
  });
  const other = await accounts.sessionUser(otherToken);
  assert.deepEqual(await workspace.readWorkspace(other.id), {});
  const publishing = await import("../src/lib/publishing.mjs");
  const record = (await publishing.pendingReviews("hidden"))[0];
  assert.equal(await publishing.publishedProject("check/widget"), null);
  assert.equal(
    await publishing.moderate(
      1,
      record.submitted - 1,
      "approved",
      "Checked",
      1,
    ),
    false,
  );
  assert.equal(
    await publishing.moderate(1, record.submitted, "approved", "Checked", 1),
    true,
  );
  assert.equal(
    (await publishing.publishedProject("check/widget")).creator_id,
    user.id,
  );
  const images = await import("../src/lib/listing-images.mjs");
  await assert.rejects(() =>
    images.saveListingImage(1, 1, Buffer.from("<svg/>")),
  );
  await images.saveListingImage(
    1,
    1,
    await readFile("public/owners/duckdb.png"),
  );
  assert.equal((await images.listingForImage(1)).status, "pending");
  const object = await (
    await import("../src/lib/media.mjs")
  ).readObject((await images.listingForImage(1)).object_key);
  assert.equal(Buffer.from(object.bytes).subarray(0, 4).toString(), "RIFF");
  assert.equal(
    await publishing.moderate(1, record.submitted, "approved", "Stale", 1),
    false,
  );
  await images.removeListingImage(1, 1);
  assert.equal((await images.listingForImage(1)).object_key, null);
  await images.saveListingImage(
    1,
    1,
    await readFile("public/owners/duckdb.png"),
  );
  await accounts.deleteAccount(user.id);
  await images.cleanMedia();
  assert.deepEqual(await workspace.readWorkspace(user.id), {});
  assert.equal(
    (await db.pool.query("SELECT count(*) AS n FROM media_deletions")).rows[0]
      .n,
    "0",
  );

  assert.equal(await accounts.sessionUser(thirdToken), null);
  assert.equal(await accounts.publicProfile(user.id), null);
  assert.equal((await db.listings("pending")).length, 0);
  const stored = await readImage("duckdb.png");
  assert.ok(
    Buffer.from(stored.bytes).equals(
      await readFile("public/owners/duckdb.png"),
    ),
  );
  const counts = await admin.query(
    "SELECT (SELECT count(*) FROM listings) AS submissions,(SELECT count(*) FROM proofs) AS proofs",
  );
  console.log(
    JSON.stringify({
      postgres: "passed",
      concurrentSingleUse: "passed",
      attemptLimit: "passed",
      moderation: "passed",
      oauthReplay: "passed",
      sessions: "passed",
      profile: "passed",
      accountDeletion: "passed",
      workspaceConcurrency: "passed",
      workspaceIsolation: "passed",
      workspaceConflict: "passed",
      imageUpload: "passed",
      staleReview: "passed",
      mediaCleanup: "passed",
      s3: "passed",
      productionCounts: counts.rows[0],
    }),
  );
} finally {
  if (db) {
    try {
      const keys = (
        await db.pool.query(
          "SELECT object_key FROM listing_images UNION SELECT object_key FROM media_deletions",
        )
      ).rows;
      const { deleteObject } = await import("../src/lib/media.mjs");
      for (const row of keys) await deleteObject(row.object_key);
    } finally {
      await db.pool.end();
    }
  }
  await admin.query('DROP SCHEMA IF EXISTS "' + schema + '" CASCADE');
  await admin.end();
}
