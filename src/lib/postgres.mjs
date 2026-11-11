import pg from "pg";
import { randomBytes, createHash } from "node:crypto";
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 10000,
  allowExitOnIdle: true,
});
pool.on("error", () => console.error("Database connection interrupted"));
let initializing;
export function initialize() {
  if (!initializing)
    initializing = transaction(async (client) => {
      await client.query("SELECT pg_advisory_xact_lock(73921001)");
      await client.query(`CREATE TABLE IF NOT EXISTS proofs(token TEXT PRIMARY KEY, phrase TEXT NOT NULL, repo TEXT NOT NULL, expires BIGINT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE IF NOT EXISTS listings(id BIGINT PRIMARY KEY, owner_id BIGINT NOT NULL, full_name TEXT NOT NULL, summary TEXT NOT NULL, submitted BIGINT NOT NULL, status TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS reviews(id BIGINT NOT NULL, action TEXT NOT NULL, at BIGINT NOT NULL);
      CREATE TABLE IF NOT EXISTS data_migrations(name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
      ALTER TABLE listings ADD COLUMN IF NOT EXISTS revision BIGINT NOT NULL DEFAULT 1;
      CREATE INDEX IF NOT EXISTS listings_status_submitted ON listings(status, submitted DESC);
      CREATE INDEX IF NOT EXISTS proofs_expiry ON proofs(expires);
      CREATE TABLE IF NOT EXISTS users(id UUID PRIMARY KEY,github_id BIGINT NOT NULL UNIQUE,github_login TEXT NOT NULL,display_name TEXT NOT NULL,bio TEXT NOT NULL DEFAULT '',website TEXT NOT NULL DEFAULT '',avatar_url TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
      CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires BIGINT NOT NULL);
      CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires);
      CREATE TABLE IF NOT EXISTS oauth_flows(state_hash TEXT PRIMARY KEY,verifier TEXT NOT NULL,expires BIGINT NOT NULL);
      CREATE INDEX IF NOT EXISTS oauth_expiry ON oauth_flows(expires);
      CREATE TABLE IF NOT EXISTS moderation_events(id BIGSERIAL PRIMARY KEY,listing_id BIGINT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,reviewer_id BIGINT NOT NULL,action TEXT NOT NULL,reason TEXT NOT NULL,at BIGINT NOT NULL);
      CREATE INDEX IF NOT EXISTS moderation_events_listing ON moderation_events(listing_id,at DESC);
      CREATE TABLE IF NOT EXISTS listing_images(listing_id BIGINT PRIMARY KEY REFERENCES listings(id) ON DELETE CASCADE,object_key TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS media_deletions(object_key TEXT PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS user_workspace(user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,key TEXT NOT NULL,value TEXT NOT NULL,updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),PRIMARY KEY(user_id,key));`);
    }).catch((error) => {
      initializing = undefined;
      throw error;
    });
  return initializing;
}
export async function transaction(action) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await action(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
const digest = (value) => createHash("sha256").update(value).digest("hex");
export async function startProof(repo) {
  await initialize();
  return transaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(73921002)");
    const now = Date.now();
    await client.query("DELETE FROM proofs WHERE expires < $1", [now]);
    const count = await client.query("SELECT count(*) AS n FROM proofs");
    if (Number(count.rows[0].n) >= 100) throw new Error("busy");
    const token = randomBytes(32).toString("hex"),
      phrase = "devshare-owner-" + randomBytes(24).toString("hex");
    await client.query(
      "INSERT INTO proofs(token,phrase,repo,expires) VALUES($1,$2,$3,$4)",
      [digest(token), phrase, repo, now + 900000],
    );
    return { token, phrase };
  });
}
export async function getProof(token) {
  await initialize();
  return (
    await pool.query(
      "SELECT phrase,repo FROM proofs WHERE token=$1 AND expires>$2",
      [digest(token), Date.now()],
    )
  ).rows[0];
}
export async function submit(token, repo, summary) {
  await initialize();
  return transaction(async (client) => {
    const proof = (
      await client.query(
        "DELETE FROM proofs WHERE token=$1 AND expires>$2 RETURNING repo",
        [digest(token), Date.now()],
      )
    ).rows[0];
    if (!proof || proof.repo.toLowerCase() !== repo.full_name.toLowerCase())
      throw new Error("expired");
    await client.query("SELECT id FROM listings WHERE id=$1 FOR UPDATE", [
      repo.id,
    ]);
    await client.query(
      "INSERT INTO media_deletions(object_key) SELECT i.object_key FROM listing_images i JOIN listings l ON l.id=i.listing_id WHERE l.id=$1 AND l.owner_id<>$2 ON CONFLICT DO NOTHING",
      [repo.id, repo.owner.id],
    );
    await client.query(
      "DELETE FROM listing_images WHERE listing_id IN(SELECT id FROM listings WHERE id=$1 AND owner_id<>$2)",
      [repo.id, repo.owner.id],
    );
    await client.query(
      `INSERT INTO listings(id,owner_id,full_name,summary,submitted,status) VALUES($1,$2,$3,$4,$5,'pending')
      ON CONFLICT(id) DO UPDATE SET owner_id=excluded.owner_id,full_name=excluded.full_name,summary=excluded.summary,submitted=excluded.submitted,status='pending',revision=listings.revision+1`,
      [repo.id, repo.owner.id, repo.full_name, summary, Date.now()],
    );
  });
}
export async function listings(status) {
  await initialize();
  return (
    await pool.query(
      "SELECT id::float8 AS id,full_name,summary,submitted::float8 AS submitted FROM listings WHERE status=$1 ORDER BY submitted DESC LIMIT 100",
      [status],
    )
  ).rows;
}
export async function review(id, action) {
  if (!["approved", "hidden"].includes(action))
    throw new Error("Invalid review");
  await initialize();
  return transaction(async (client) => {
    if (
      !(
        await client.query(
          "UPDATE listings SET status=$1,revision=revision+1 WHERE id=$2",
          [action, id],
        )
      ).rowCount
    )
      throw new Error("Listing not found");
    await client.query("INSERT INTO reviews VALUES($1,$2,$3)", [
      id,
      action,
      Date.now(),
    ]);
  });
}
export async function reserveAttempt(token) {
  await initialize();
  return (
    (
      await pool.query(
        "UPDATE proofs SET attempts=attempts+1 WHERE token=$1 AND expires>$2 AND attempts<5",
        [digest(token), Date.now()],
      )
    ).rowCount === 1
  );
}
