import { initialize, pool, transaction } from "./postgres.mjs";
export async function publishedProject(fullName) {
  if (!process.env.DATABASE_URL) {
    const { listings } = await import("./submissions.mjs");
    return (
      (await listings("approved")).find(
        (row) => row.full_name.toLowerCase() === fullName.toLowerCase(),
      ) || null
    );
  }
  await initialize();
  return (
    (
      await pool.query(
        `SELECT l.id::float8 AS id,l.full_name,l.summary,l.submitted::float8 AS submitted,l.revision::float8 AS revision,
    EXISTS(SELECT 1 FROM listing_images WHERE listing_id=l.id) AS has_image,u.id AS creator_id,u.display_name AS creator_name,
    (SELECT max(r.at)::float8 FROM reviews r WHERE r.id=l.id AND r.action='approved') AS published_at
    FROM listings l LEFT JOIN users u ON u.github_id=l.owner_id WHERE lower(l.full_name)=lower($1) AND l.status='approved'`,
        [fullName],
      )
    ).rows[0] || null
  );
}
export async function pendingReviews(status) {
  if (!["pending", "approved", "hidden"].includes(status))
    throw new Error("Invalid review status");
  await initialize();
  return (
    await pool.query(
      "SELECT id::float8 AS id,full_name,summary,submitted::float8 AS submitted,revision::float8 AS revision,status,EXISTS(SELECT 1 FROM listing_images WHERE listing_id=listings.id) AS has_image FROM listings WHERE status=$1 ORDER BY submitted DESC LIMIT 100",
      [status],
    )
  ).rows;
}
export async function moderate(id, revision, action, reason, reviewerId) {
  if (
    !["approved", "hidden"].includes(action) ||
    !Number.isSafeInteger(id) ||
    !Number.isSafeInteger(revision) ||
    typeof reason !== "string" ||
    reason.length > 1000 ||
    (action === "hidden" && reason.trim().length < 10)
  )
    throw new Error("Invalid review");
  await initialize();
  return transaction(async (c) => {
    const updated = await c.query(
      "UPDATE listings SET status=$1,revision=revision+1 WHERE id=$2 AND revision=$3 AND status IN ('pending','approved','hidden') RETURNING id",
      [action, id, revision],
    );
    if (!updated.rowCount) return false;
    const now = Date.now();
    await c.query("INSERT INTO reviews VALUES($1,$2,$3)", [id, action, now]);
    await c.query(
      "INSERT INTO moderation_events(listing_id,reviewer_id,action,reason,at) VALUES($1,$2,$3,$4,$5)",
      [id, reviewerId, action, reason.trim(), now],
    );
    return true;
  });
}
export async function publishedPaths() {
  if (!process.env.DATABASE_URL) return [];
  await initialize();
  return (
    await pool.query(
      "SELECT full_name,submitted::float8 AS submitted FROM listings WHERE status='approved' ORDER BY submitted DESC LIMIT 5000",
    )
  ).rows;
}

export async function withdrawProject(id, ownerId, revision) {
  if (
    !Number.isSafeInteger(id) ||
    !Number.isSafeInteger(ownerId) ||
    !Number.isSafeInteger(revision)
  )
    return false;
  await initialize();
  return transaction(async (c) => {
    const row = await c.query(
      "UPDATE listings SET status='withdrawn',revision=revision+1 WHERE id=$1 AND owner_id=$2 AND revision=$3 AND status<>'withdrawn' RETURNING id",
      [id, ownerId, revision],
    );
    if (!row.rowCount) return false;
    const now = Date.now();
    await c.query("INSERT INTO reviews VALUES($1,'withdrawn',$2)", [id, now]);
    await c.query(
      "INSERT INTO moderation_events(listing_id,reviewer_id,action,reason,at) VALUES($1,$2,'withdrawn','Withdrawn by the maintainer',$3)",
      [id, ownerId, now],
    );
    return true;
  });
}
