import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { initialize, pool, transaction } from "./postgres.mjs";
export const sources = [
  "Direct",
  "Internal",
  "Google",
  "Bing",
  "DuckDuckGo",
  "GitHub",
  "Hacker News",
  "Reddit",
  "Other",
];
function secret() {
  return process.env.GITHUB_CLIENT_SECRET || "";
}
export function engagementToken(id, now = Date.now()) {
  if (!secret() || !Number.isSafeInteger(id) || id <= 0) return "";
  const body = Buffer.from(
    JSON.stringify({ id, at: now, nonce: randomUUID() }),
  ).toString("base64url");
  const signature = createHmac("sha256", secret())
    .update("devshare-engagement:" + body)
    .digest("base64url");
  return body + "." + signature;
}
export function verifyEngagementToken(token, now = Date.now()) {
  try {
    if (!secret() || typeof token !== "string" || token.length > 512)
      return null;
    const [body, signature, ...rest] = token.split(".");
    if (rest.length || !/^[A-Za-z0-9_-]{43}$/.test(signature)) return null;
    const expected = createHmac("sha256", secret())
      .update("devshare-engagement:" + body)
      .digest("base64url");
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature)))
      return null;
    const value = JSON.parse(Buffer.from(body, "base64url").toString());
    if (
      !Number.isSafeInteger(value.id) ||
      value.id <= 0 ||
      !Number.isSafeInteger(value.at) ||
      value.at > now + 60000 ||
      value.at < now - 3600000 ||
      !/^[a-f0-9-]{36}$/.test(value.nonce)
    )
      return null;
    return value;
  } catch {
    return null;
  }
}
export async function recordEngagement({ token, actor, kind, source }) {
  const proof = verifyEngagementToken(token);
  if (
    !proof ||
    typeof actor !== "string" ||
    !/^[a-f0-9-]{36}$/.test(actor) ||
    !["view", "outbound"].includes(kind) ||
    !sources.includes(source)
  )
    return false;
  await initialize();
  const now = new Date(),
    day = now.toISOString().slice(0, 10);
  const actorHash = createHmac("sha256", secret())
    .update("actor:" + proof.id + ":" + day.slice(0, 7) + ":" + actor)
    .digest("hex");
  return transaction(async (c) => {
    const project = (
      await c.query(
        "SELECT id FROM listings WHERE id=$1 AND status='approved' FOR SHARE",
        [proof.id],
      )
    ).rows[0];
    if (!project) return false;
    let recorded = false;
    for (const event of kind === "outbound" ? ["view", "outbound"] : ["view"]) {
      const receipt = await c.query(
        "INSERT INTO engagement_receipts(nonce,kind,project_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING RETURNING nonce",
        [proof.nonce, event, proof.id],
      );
      if (!receipt.rowCount) continue;
      const visit = await c.query(
        "INSERT INTO engagement_events(project_id,day,actor_hash,kind,source) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING RETURNING project_id",
        [proof.id, day, actorHash, event, source],
      );
      if (!visit.rowCount) continue;
      await c.query(
        "INSERT INTO engagement_daily(project_id,day,views,outbound) VALUES($1,$2,$3,$4) ON CONFLICT(project_id,day) DO UPDATE SET views=engagement_daily.views+excluded.views,outbound=engagement_daily.outbound+excluded.outbound",
        [proof.id, day, event === "view" ? 1 : 0, event === "outbound" ? 1 : 0],
      );
      recorded = true;
    }
    return recorded;
  });
}
export async function cleanEngagement() {
  await initialize();
  await pool.query(
    "DELETE FROM engagement_receipts WHERE created_at<NOW()-INTERVAL '2 hours'",
  );
  await pool.query(
    "DELETE FROM engagement_events WHERE day<(NOW() AT TIME ZONE 'UTC')::date-35",
  );
}
export async function creatorAnalytics(ownerId, userId, days = 30) {
  if (![1, 7, 30].includes(days)) throw new Error("Invalid analytics period");
  await initialize();
  const first = new Date();
  first.setUTCHours(0, 0, 0, 0);
  first.setUTCDate(first.getUTCDate() - days + 1);
  const since = first.toISOString().slice(0, 10);
  const [projects, daily, referrals, allTime, followers] = await Promise.all([
    pool.query(
      `SELECT l.id::float8 AS id,l.full_name,COALESCE(sum(d.views),0)::float8 AS views,COALESCE(sum(d.outbound),0)::float8 AS outbound,
      (SELECT count(DISTINCT actor_hash)::float8 FROM engagement_events e WHERE e.project_id=l.id AND e.kind='view' AND e.day>=$3) AS visitors,
      (SELECT count(DISTINCT w.user_id)::float8 FROM user_workspace w WHERE w.user_id<>$2 AND ((w.key='drp-source-references' AND w.value::jsonb @> jsonb_build_array(jsonb_build_object('id',l.id))) OR (w.key='drp-saved' AND w.value::jsonb @> jsonb_build_array('github:'||l.id)) )) AS saves
      FROM listings l LEFT JOIN engagement_daily d ON d.project_id=l.id AND d.day>=$3 WHERE l.owner_id=$1 GROUP BY l.id ORDER BY l.submitted DESC`,
      [ownerId, userId, since],
    ),
    pool.query(
      "SELECT d.day::text AS day,sum(d.views)::float8 AS views,sum(d.outbound)::float8 AS outbound FROM engagement_daily d JOIN listings l ON l.id=d.project_id WHERE l.owner_id=$1 AND d.day>=$2 GROUP BY d.day ORDER BY d.day",
      [ownerId, since],
    ),
    pool.query(
      "SELECT e.source,count(*)::float8 AS visits FROM engagement_events e JOIN listings l ON l.id=e.project_id WHERE l.owner_id=$1 AND e.day>=$2 AND e.kind='view' GROUP BY e.source ORDER BY visits DESC",
      [ownerId, since],
    ),
    pool.query(
      "SELECT COALESCE(sum(d.views),0)::float8 AS views,COALESCE(sum(d.outbound),0)::float8 AS outbound FROM engagement_daily d JOIN listings l ON l.id=d.project_id WHERE l.owner_id=$1",
      [ownerId],
    ),
    pool.query(
      "SELECT count(*)::float8 AS n FROM user_workspace WHERE key='drp-following' AND user_id<>$1 AND value::jsonb @> $2::jsonb",
      [userId, JSON.stringify(["member:" + userId])],
    ),
  ]);
  const rows = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(first);
    date.setUTCDate(date.getUTCDate() + i);
    const day = date.toISOString().slice(0, 10);
    rows.push(
      daily.rows.find((row) => row.day === day) || {
        day,
        views: 0,
        outbound: 0,
      },
    );
  }
  return {
    projects: projects.rows,
    daily: rows,
    sources: referrals.rows,
    allTime: allTime.rows[0],
    followers: followers.rows[0].n,
    period: {
      views: rows.reduce((n, r) => n + r.views, 0),
      outbound: rows.reduce((n, r) => n + r.outbound, 0),
    },
  };
}
