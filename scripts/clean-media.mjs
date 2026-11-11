if (process.env.DATABASE_URL && process.env.S3_BUCKET) {
  const { cleanMedia } = await import("../src/lib/listing-images.mjs");
  const { pool } = await import("../src/lib/postgres.mjs");
  try {
    await cleanMedia();
  } finally {
    await pool.end();
  }
}
