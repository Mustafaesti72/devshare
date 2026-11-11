import { randomUUID } from "node:crypto";
import { initialize, pool, transaction } from "./postgres.mjs";
export async function submitReport(userId, type, target, category, reason) {
  if (
    !["project", "profile"].includes(type) ||
    typeof target !== "string" ||
    !target ||
    target.length > 160 ||
    !["spam", "ownership", "unsafe", "other"].includes(category) ||
    typeof reason !== "string" ||
    reason.trim().length < 20 ||
    reason.length > 2000
  )
    throw new Error("Invalid report");
  await initialize();
  return transaction(async (c) => {
    await c.query(
      "SELECT pg_advisory_xact_lock(hashtextextended($1,73921007))",
      [userId],
    );
    const previous = (
      await c.query(
        "SELECT id FROM reports WHERE reporter_id=$1 AND target_type=$2 AND lower(target)=lower($3) AND status='open' FOR UPDATE",
        [userId, type, target],
      )
    ).rows[0];
    if (previous) {
      await c.query("UPDATE reports SET category=$1,reason=$2 WHERE id=$3", [
        category,
        reason.trim(),
        previous.id,
      ]);
      return previous.id;
    }
    const id = randomUUID();
    await c.query(
      "INSERT INTO reports(id,reporter_id,target_type,target,category,reason) VALUES($1,$2,$3,$4,$5,$6)",
      [id, userId, type, target, category, reason.trim()],
    );
    return id;
  });
}
export async function openReports() {
  await initialize();
  return (
    await pool.query(
      "SELECT r.id,r.target_type,r.target,r.category,r.reason,r.created_at,u.github_login FROM reports r JOIN users u ON u.id=r.reporter_id WHERE r.status='open' ORDER BY r.created_at LIMIT 100",
    )
  ).rows;
}
export async function resolveReport(id, reviewerId, note) {
  if (
    typeof note !== "string" ||
    note.trim().length < 10 ||
    note.length > 1000 ||
    typeof id !== "string" ||
    !/^[a-f0-9-]{36}$/.test(id)
  )
    throw new Error("Invalid report resolution");
  await initialize();
  return (
    (
      await pool.query(
        "UPDATE reports SET status='closed',reviewer_id=$1,resolution=$2,resolved_at=NOW() WHERE id=$3 AND status='open'",
        [reviewerId, note.trim(), id],
      )
    ).rowCount === 1
  );
}
