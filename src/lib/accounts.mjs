import {
  randomBytes,
  randomUUID,
  createHash,
  timingSafeEqual,
} from "node:crypto";
import { memberIds } from "./member-data.ts";
import { pool, initialize, transaction } from "./postgres.mjs";
export const hash = (value) => createHash("sha256").update(value).digest("hex");
export function sameState(a, b) {
  if (
    typeof a !== "string" ||
    typeof b !== "string" ||
    !/^[a-f0-9]{64}$/.test(a) ||
    !/^[a-f0-9]{64}$/.test(b)
  )
    return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
export function safeWebsite(value) {
  if (!value) return "";
  if (typeof value !== "string" || value.length > 300)
    throw new Error("Enter an HTTPS website URL");
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password)
    throw new Error("Enter an HTTPS website URL");
  return url.href;
}
const fields =
  "u.id,u.github_id::float8 AS github_id,u.github_login,u.display_name,u.bio,u.website,u.avatar_url,u.created_at,u.is_hidden,u.moderation_note,u.profile_revision::float8 AS profile_revision,u.review_requested";
export async function startLogin() {
  await initialize();
  const state = randomBytes(32).toString("hex"),
    verifier = randomBytes(48).toString("base64url");
  await transaction(async (c) => {
    await c.query("SELECT pg_advisory_xact_lock(73921004)");
    await c.query("DELETE FROM oauth_flows WHERE expires<$1", [Date.now()]);
    if (
      Number(
        (await c.query("SELECT count(*) AS n FROM oauth_flows")).rows[0].n,
      ) > 1000
    )
      throw new Error("Sign in is busy");
    await c.query("INSERT INTO oauth_flows VALUES($1,$2,$3)", [
      hash(state),
      verifier,
      Date.now() + 600000,
    ]);
  });
  return {
    state,
    challenge: createHash("sha256").update(verifier).digest("base64url"),
  };
}
export async function consumeLogin(state) {
  await initialize();
  return (
    await pool.query(
      "DELETE FROM oauth_flows WHERE state_hash=$1 AND expires>$2 RETURNING verifier",
      [hash(state), Date.now()],
    )
  ).rows[0]?.verifier;
}
export async function createSession(identity, previousToken) {
  if (
    !Number.isSafeInteger(identity.id) ||
    identity.id <= 0 ||
    !/^[a-z0-9-]{1,39}$/i.test(identity.login)
  )
    throw new Error("Invalid GitHub identity");
  const avatar = new URL(identity.avatar_url);
  if (
    avatar.protocol !== "https:" ||
    avatar.hostname !== "avatars.githubusercontent.com"
  )
    throw new Error("Invalid avatar");
  await initialize();
  return transaction(async (c) => {
    const result = await c.query(
      `INSERT INTO users(id,github_id,github_login,display_name,bio,website,avatar_url)
      VALUES($1,$2,$3,$4,$5,'',$6) ON CONFLICT(github_id) DO UPDATE
      SET github_login=excluded.github_login,avatar_url=excluded.avatar_url RETURNING id`,
      [
        randomUUID(),
        identity.id,
        identity.login,
        (identity.name || identity.login).slice(0, 80),
        (identity.bio || "").slice(0, 500),
        avatar.href,
      ],
    );
    const userId = result.rows[0].id;
    const token = randomBytes(32).toString("hex");
    await c.query("DELETE FROM sessions WHERE expires<$1", [Date.now()]);
    if (previousToken)
      await c.query("DELETE FROM sessions WHERE token_hash=$1", [
        hash(previousToken),
      ]);
    await c.query("INSERT INTO sessions VALUES($1,$2,$3)", [
      hash(token),
      userId,
      Date.now() + 30 * 86400000,
    ]);
    await c.query(
      "DELETE FROM sessions WHERE user_id=$1 AND token_hash NOT IN (SELECT token_hash FROM sessions WHERE user_id=$1 ORDER BY expires DESC LIMIT 10)",
      [userId],
    );
    return token;
  });
}
export async function sessionUser(token) {
  if (!process.env.DATABASE_URL || !/^[a-f0-9]{64}$/.test(token || ""))
    return null;
  await initialize();
  return (
    (
      await pool.query(
        `SELECT ${fields} FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires>$2`,
        [hash(token), Date.now()],
      )
    ).rows[0] || null
  );
}
export async function endSession(token, all = false) {
  await initialize();
  if (all)
    await pool.query(
      "DELETE FROM sessions WHERE user_id=(SELECT user_id FROM sessions WHERE token_hash=$1 AND expires>$2)",
      [hash(token), Date.now()],
    );
  else
    await pool.query("DELETE FROM sessions WHERE token_hash=$1", [hash(token)]);
}
export async function publicProfile(id) {
  if (
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id)
  )
    return null;
  await initialize();
  return (
    (
      await pool.query(
        `SELECT ${fields} FROM users u WHERE id=$1 AND is_hidden=FALSE`,
        [id],
      )
    ).rows[0] || null
  );
}
export async function updateProfile(id, input) {
  const displayName =
    typeof input.display_name === "string" ? input.display_name.trim() : "";
  const bio = typeof input.bio === "string" ? input.bio.trim() : "";
  if (displayName.length < 2 || displayName.length > 80 || bio.length > 500)
    throw new Error(
      "Use a name of 2–80 characters and a bio up to 500 characters",
    );
  const website = safeWebsite(input.website);
  await initialize();
  await pool.query(
    "UPDATE users SET display_name=$1,bio=$2,website=$3,profile_revision=profile_revision+1,review_requested=is_hidden WHERE id=$4",
    [displayName, bio, website, id],
  );
}
export async function userProjects(githubId, publicOnly = false) {
  await initialize();
  return (
    await pool.query(
      `SELECT id::float8 AS id,full_name,summary,category,status,submitted::float8 AS submitted,revision::float8 AS revision,EXISTS(SELECT 1 FROM listing_images WHERE listing_id=listings.id) AS has_image,(SELECT reason FROM moderation_events WHERE listing_id=listings.id AND at>=listings.submitted ORDER BY at DESC LIMIT 1) AS feedback FROM listings WHERE owner_id=$1 AND ${publicOnly ? "status='approved'" : "status IN ('approved','pending','hidden','withdrawn')"} ORDER BY submitted DESC LIMIT 100`,
      [githubId],
    )
  ).rows;
}

export async function deleteAccount(id) {
  await initialize();
  await transaction(async (c) => {
    const user = (
      await c.query("SELECT github_id FROM users WHERE id=$1 FOR UPDATE", [id])
    ).rows[0];
    if (!user) return;
    await c.query(
      "INSERT INTO media_deletions(object_key) SELECT object_key FROM listing_images WHERE listing_id IN(SELECT id FROM listings WHERE owner_id=$1) ON CONFLICT DO NOTHING",
      [user.github_id],
    );
    await c.query(
      "DELETE FROM reviews WHERE id IN (SELECT id FROM listings WHERE owner_id=$1)",
      [user.github_id],
    );
    await c.query("DELETE FROM listings WHERE owner_id=$1", [user.github_id]);
    await c.query("DELETE FROM users WHERE id=$1", [id]);
  });
}

export async function publicMembers(ids) {
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string"))
    throw new Error("Invalid profile IDs");
  const selected = memberIds(ids.join(","));
  if (!selected.length || !process.env.DATABASE_URL) return [];
  await initialize();
  return (
    await pool.query(
      "SELECT id,github_login,display_name,avatar_url,left(bio,180) AS bio FROM users WHERE id=ANY($1::uuid[]) AND NOT is_hidden",
      [selected],
    )
  ).rows;
}
