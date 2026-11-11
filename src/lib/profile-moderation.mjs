import { initialize, pool, transaction } from "./postgres.mjs";
export async function profileQueue() {
  await initialize();
  return (
    await pool.query(
      "SELECT id,github_login,display_name,bio,is_hidden,review_requested,moderation_note,profile_revision::float8 AS profile_revision FROM users ORDER BY is_hidden DESC,review_requested DESC,created_at DESC LIMIT 100",
    )
  ).rows;
}
export async function reviewProfile(id, revision, action, note, reviewerId) {
  if (
    !/^[a-f0-9-]{36}$/.test(id) ||
    !Number.isSafeInteger(revision) ||
    !["hide", "restore"].includes(action) ||
    typeof note !== "string" ||
    note.trim().length < 10 ||
    note.length > 1000
  )
    throw new Error("Invalid review");
  await initialize();
  return transaction(async (c) => {
    const user = (
      await c.query(
        "UPDATE users SET is_hidden=$1,moderation_note=$2,review_requested=FALSE,profile_revision=profile_revision+1 WHERE id=$3 AND profile_revision=$4 RETURNING github_id",
        [action === "hide", note.trim(), id, revision],
      )
    ).rows[0];
    if (!user) return false;
    await c.query(
      "INSERT INTO profile_reviews(user_id,reviewer_id,action,note) VALUES($1,$2,$3,$4)",
      [id, reviewerId, action, note.trim()],
    );
    if (action === "hide") {
      const projects = (
        await c.query(
          "UPDATE listings SET status='hidden',revision=revision+1 WHERE owner_id=$1 AND status IN ('pending','approved') RETURNING id",
          [user.github_id],
        )
      ).rows;
      for (const project of projects) {
        await c.query("INSERT INTO reviews VALUES($1,'hidden',$2)", [
          project.id,
          Date.now(),
        ]);
        await c.query(
          "INSERT INTO moderation_events(listing_id,reviewer_id,action,reason,at) VALUES($1,$2,'hidden',$3,$4)",
          [project.id, reviewerId, note.trim(), Date.now()],
        );
      }
    }
    return true;
  });
}
