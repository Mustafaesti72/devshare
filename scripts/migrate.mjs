import { existsSync } from "node:fs";
import { join } from "node:path";
if (process.env.DATABASE_URL) {
  const { pool, initialize, transaction } = await import(
    "../src/lib/postgres.mjs"
  );
  try {
    await initialize();
    const path = join(
      process.env.DEVSHARE_DATA_DIR || ".data",
      "submissions.sqlite",
    );
    if (existsSync(path)) {
      const { DatabaseSync } = await import("node:sqlite");
      const source = new DatabaseSync(path, { readOnly: true });
      try {
        await transaction(async (client) => {
          await client.query("SELECT pg_advisory_xact_lock(73921003)");
          if (
            (
              await client.query(
                "SELECT name FROM data_migrations WHERE name='sqlite-import-v1'",
              )
            ).rowCount
          )
            return;
          const tables = source
            .prepare("SELECT name FROM sqlite_master WHERE type='table'")
            .all()
            .map((r) => r.name);
          if (tables.includes("listings"))
            for (const r of source.prepare("SELECT * FROM listings").all())
              await client.query(
                "INSERT INTO listings(id,owner_id,full_name,summary,submitted,status) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(id) DO NOTHING",
                [
                  r.id,
                  r.owner_id,
                  r.full_name,
                  r.summary,
                  r.submitted,
                  r.status,
                ],
              );
          if (tables.includes("reviews"))
            for (const r of source.prepare("SELECT * FROM reviews").all())
              await client.query("INSERT INTO reviews VALUES($1,$2,$3)", [
                r.id,
                r.action,
                r.at,
              ]);
          if (tables.includes("proofs"))
            for (const r of source
              .prepare("SELECT * FROM proofs WHERE expires>?")
              .all(Date.now()))
              await client.query(
                "INSERT INTO proofs VALUES($1,$2,$3,$4,$5) ON CONFLICT(token) DO NOTHING",
                [r.token, r.phrase, r.repo, r.expires, r.attempts || 0],
              );
          await client.query(
            "INSERT INTO data_migrations(name) VALUES('sqlite-import-v1')",
          );
          console.log("Existing SQLite submissions imported into PostgreSQL");
        });
      } finally {
        source.close();
      }
    }
    console.log("PostgreSQL schema ready");
  } finally {
    await pool.end();
  }
}
