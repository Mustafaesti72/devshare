import { initialize, pool, transaction } from "./postgres.mjs";
import {
  workspaceKeys,
  normalizeWorkspace,
  emptyValue,
  mergeWorkspace,
} from "./workspace-data.mjs";
export async function readWorkspace(userId) {
  await initialize();
  const result = await pool.query(
    "SELECT key,value FROM user_workspace WHERE user_id=$1",
    [userId],
  );
  return Object.fromEntries(result.rows.map((r) => [r.key, r.value]));
}
export async function writeWorkspace(userId, key, base, next) {
  if (!workspaceKeys.includes(key)) throw new Error("Invalid workspace key");
  base = normalizeWorkspace(key, base);
  next = normalizeWorkspace(key, next);
  await initialize();
  return transaction(async (c) => {
    await c.query(
      "SELECT pg_advisory_xact_lock(hashtextextended($1,73921006))",
      [userId],
    );
    const row = (
      await c.query(
        "SELECT value FROM user_workspace WHERE user_id=$1 AND key=$2 FOR UPDATE",
        [userId, key],
      )
    ).rows[0];
    const current = row?.value || emptyValue(key);
    let merged;
    try {
      merged = mergeWorkspace(key, base, next, current);
    } catch {
      return { conflict: true, value: current };
    }
    await c.query(
      "INSERT INTO user_workspace(user_id,key,value) VALUES($1,$2,$3) ON CONFLICT(user_id,key) DO UPDATE SET value=excluded.value,updated_at=NOW()",
      [userId, key, merged],
    );
    return { conflict: false, value: merged };
  });
}
