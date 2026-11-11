import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import pg from "pg";
import { readImage } from "../src/lib/media.mjs";

if (!process.env.DATABASE_URL) throw new Error("PostgreSQL is required");
const schema = "storage_check_" + randomBytes(8).toString("hex");
const admin = new pg.Pool({connectionString:process.env.DATABASE_URL,max:1,connectionTimeoutMillis:5000});
let db;
try {
  await admin.query('CREATE SCHEMA "'+schema+'"');
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set("options","-c search_path="+schema);
  process.env.DATABASE_URL = url.href;
  db = await import("../src/lib/postgres.mjs");
  const {token,phrase} = await db.startProof("check/widget");
  assert.equal((await db.getProof(token)).phrase,phrase);
  const attempts = await Promise.all(Array.from({length:12},()=>db.reserveAttempt(token)));
  assert.equal(attempts.filter(Boolean).length,5);
  await assert.rejects(()=>db.submit(token,{id:1,full_name:"wrong/widget",owner:{id:1}},"Check"));
  assert.ok(await db.getProof(token));
  const results = await Promise.allSettled(Array.from({length:2},()=>db.submit(token,{id:1,full_name:"check/widget",owner:{id:1}},"Diagnostic record")));
  assert.equal(results.filter(r=>r.status==="fulfilled").length,1);
  assert.equal(await db.getProof(token),undefined);
  assert.equal((await db.listings("pending")).length,1);
  await db.review(1,"approved");
  assert.equal((await db.listings("approved")).length,1);
  await db.review(1,"hidden");
  assert.equal((await db.listings("approved")).length,0);
  const stored = await readImage("duckdb.png");
  assert.ok(Buffer.from(stored.bytes).equals(await readFile("public/owners/duckdb.png")));
  const counts = await admin.query("SELECT (SELECT count(*) FROM listings) AS submissions,(SELECT count(*) FROM proofs) AS proofs");
  console.log(JSON.stringify({postgres:"passed",concurrentSingleUse:"passed",attemptLimit:"passed",moderation:"passed",s3:"passed",productionCounts:counts.rows[0]}));
} finally {
  if (db) await db.pool.end();
  await admin.query('DROP SCHEMA IF EXISTS "'+schema+'" CASCADE');
  await admin.end();
}
