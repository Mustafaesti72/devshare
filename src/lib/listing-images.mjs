import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { pool, initialize, transaction } from "./postgres.mjs";
import { writeObject, deleteObject } from "./media.mjs";
export async function listingForImage(id) {
  await initialize();
  return (
    (
      await pool.query(
        "SELECT l.id::float8 AS id,l.owner_id::float8 AS owner_id,l.full_name,l.status,i.object_key FROM listings l LEFT JOIN listing_images i ON i.listing_id=l.id WHERE l.id=$1",
        [id],
      )
    ).rows[0] || null
  );
}
export async function saveListingImage(id, ownerId, input) {
  if (!Buffer.isBuffer(input) || input.length > 4 * 1024 * 1024)
    throw new Error("Image must be under 4 MB");
  const image = sharp(input, { limitInputPixels: 20000000 });
  const metadata = await image.metadata();
  if (
    !["png", "jpeg", "webp"].includes(metadata.format) ||
    (metadata.pages || 1) > 1
  )
    throw new Error("Choose a still PNG, JPEG or WebP image");
  const bytes = await image
    .rotate()
    .resize({
      width: 1600,
      height: 1000,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toBuffer();
  const key = "projects/" + id + "/" + randomUUID() + ".webp";
  await writeObject(key, bytes, "image/webp");
  try {
    await initialize();
    await transaction(async (c) => {
      const row = (
        await c.query("SELECT owner_id FROM listings WHERE id=$1 FOR UPDATE", [
          id,
        ])
      ).rows[0];
      if (!row || Number(row.owner_id) !== ownerId)
        throw new Error("Repository ownership changed");
      const previous = (
        await c.query(
          "SELECT object_key FROM listing_images WHERE listing_id=$1",
          [id],
        )
      ).rows[0];
      await c.query(
        "INSERT INTO listing_images(listing_id,object_key) VALUES($1,$2) ON CONFLICT(listing_id) DO UPDATE SET object_key=excluded.object_key",
        [id, key],
      );
      await c.query(
        "UPDATE listings SET status='pending',submitted=$1 WHERE id=$2",
        [Date.now(), id],
      );
      if (previous)
        await c.query(
          "INSERT INTO media_deletions(object_key) VALUES($1) ON CONFLICT DO NOTHING",
          [previous.object_key],
        );
    });
  } catch (error) {
    try {
      await deleteObject(key);
    } catch {}
    throw error;
  }
  try {
    await cleanMedia();
  } catch {
    console.error("Project image cleanup will retry");
  }
}
export async function cleanMedia() {
  if (!process.env.DATABASE_URL) return;
  await initialize();
  for (let i = 0; i < 3; i++) {
    const removed = await transaction(async (c) => {
      const row = (
        await c.query(
          "SELECT object_key FROM media_deletions FOR UPDATE SKIP LOCKED LIMIT 1",
        )
      ).rows[0];
      if (!row) return false;
      try {
        await deleteObject(row.object_key);
      } catch {
        return false;
      }
      await c.query("DELETE FROM media_deletions WHERE object_key=$1", [
        row.object_key,
      ]);
      return true;
    });
    if (!removed) break;
  }
}

export async function removeListingImage(id, ownerId) {
  await initialize();
  await transaction(async (c) => {
    const listing = (
      await c.query("SELECT owner_id FROM listings WHERE id=$1 FOR UPDATE", [
        id,
      ])
    ).rows[0];
    if (!listing || Number(listing.owner_id) !== ownerId)
      throw new Error("Not the owner");
    const image = (
      await c.query(
        "DELETE FROM listing_images WHERE listing_id=$1 RETURNING object_key",
        [id],
      )
    ).rows[0];
    if (image) {
      await c.query(
        "INSERT INTO media_deletions(object_key) VALUES($1) ON CONFLICT DO NOTHING",
        [image.object_key],
      );
      await c.query(
        "UPDATE listings SET status='pending',submitted=$1 WHERE id=$2",
        [Date.now(), id],
      );
    }
  });
  try {
    await cleanMedia();
  } catch {
    console.error("Removed image cleanup will retry");
  }
}
