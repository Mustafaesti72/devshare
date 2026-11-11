import { DatabaseSync } from "node:sqlite";
import { mkdirSync, chmodSync } from "node:fs";
import { join } from "node:path";
import { randomBytes, createHash } from "node:crypto";

let database;
function db() {
  if (database) return database;
  const dir = process.env.DEVSHARE_DATA_DIR || join(process.cwd(), ".data");
  mkdirSync(dir, { recursive: true, mode: 0o700 });
  const filename = join(dir, "submissions.sqlite");
  const connection = new DatabaseSync(filename);
  chmodSync(filename, 0o600);
  connection.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
 CREATE TABLE IF NOT EXISTS proofs(token TEXT PRIMARY KEY, phrase TEXT NOT NULL, repo TEXT NOT NULL, expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS listings(id INTEGER PRIMARY KEY, owner_id INTEGER NOT NULL, full_name TEXT NOT NULL, summary TEXT NOT NULL, submitted INTEGER NOT NULL, status TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS reviews(id INTEGER NOT NULL, action TEXT NOT NULL, at INTEGER NOT NULL);`);
  if (!connection.prepare("PRAGMA table_info(proofs)").all().some(column=>column.name==="attempts")) {
    connection.exec("ALTER TABLE proofs ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0");
  }
  database = connection;
  return database;
}
const digest = (value) => createHash("sha256").update(value).digest("hex");
export function startProof(repo) {
  const conn = db(),
    now = Date.now();
  conn.prepare("DELETE FROM proofs WHERE expires < ?").run(now);
  if (conn.prepare("SELECT count(*) AS n FROM proofs").get().n >= 100)
    throw new Error("busy");
  const token = randomBytes(32).toString("hex"),
    phrase = "devshare-owner-" + randomBytes(24).toString("hex");
  conn
    .prepare("INSERT INTO proofs(token,phrase,repo,expires) VALUES(?,?,?,?)")
    .run(digest(token), phrase, repo, now + 15 * 60_000);
  return { token, phrase };
}
export function getProof(token) {
  return db()
    .prepare("SELECT phrase,repo FROM proofs WHERE token=? AND expires>?")
    .get(digest(token), Date.now());
}
export function submit(token, repo, summary) {
  const conn = db();
  conn.exec("BEGIN IMMEDIATE");
  try {
    const proof = getProof(token);
    if (!proof || proof.repo.toLowerCase() !== repo.full_name.toLowerCase())
      throw new Error("expired");
    conn
      .prepare(
        "INSERT INTO listings VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET owner_id=excluded.owner_id, full_name=excluded.full_name,summary=excluded.summary,submitted=excluded.submitted,status='pending'",
      )
      .run(
        repo.id,
        repo.owner.id,
        repo.full_name,
        summary,
        Date.now(),
        "pending",
      );
    conn.prepare("DELETE FROM proofs WHERE token=?").run(digest(token));
    conn.exec("COMMIT");
  } catch (e) {
    conn.exec("ROLLBACK");
    throw e;
  }
}
export function listings(status) {
  return db()
    .prepare(
      "SELECT id,full_name,summary,submitted FROM listings WHERE status=? ORDER BY submitted DESC LIMIT 100",
    )
    .all(status);
}
export function review(id, action) {
  if (!["approved", "hidden"].includes(action))
    throw new Error("Invalid review");
  const conn = db();
  conn.exec("BEGIN IMMEDIATE");
  try {
    if (
      !conn.prepare("UPDATE listings SET status=? WHERE id=?").run(action, id)
        .changes
    )
      throw new Error("Listing not found");
    conn
      .prepare("INSERT INTO reviews VALUES(?,?,?)")
      .run(id, action, Date.now());
    conn.exec("COMMIT");
  } catch (e) {
    conn.exec("ROLLBACK");
    throw e;
  }
}

export function reserveAttempt(token){return db().prepare("UPDATE proofs SET attempts=attempts+1 WHERE token=? AND expires>? AND attempts<5").run(digest(token),Date.now()).changes===1}
