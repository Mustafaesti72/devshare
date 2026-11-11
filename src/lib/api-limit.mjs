import { createHmac } from "node:crypto";
import { initialize, transaction, pool } from "./postgres.mjs";
export async function apiLimit(
  request,
  scope,
  { identity, limit = 60, seconds = 60 } = {},
) {
  if (!process.env.DATABASE_URL) return null;
  const now = Date.now(),
    day = new Date(now).toISOString().slice(0, 10);
  const hint =
    identity ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const secret = process.env.GITHUB_CLIENT_SECRET || "local-rate-check";
  const key = (value) =>
    createHmac("sha256", secret)
      .update(scope + ":" + day + ":" + value)
      .digest("hex");
  try {
    await initialize();
    const accepted = await transaction(async (c) => {
      for (const [actor, maximum, windowSeconds] of [
        [key("global"), 5000, 60],
        [key(String(hint).slice(0, 200)), limit, seconds],
      ]) {
        const window = Math.floor(now / (windowSeconds * 1000));
        const result = await c.query(
          "INSERT INTO api_limits(key,window_id,count,expires) VALUES($1,$2,1,$3) ON CONFLICT(key,window_id) DO UPDATE SET count=api_limits.count+1 WHERE api_limits.count<$4 RETURNING count",
          [actor, window, (window + 1) * windowSeconds * 1000 + 60000, maximum],
        );
        if (!result.rowCount) return false;
      }
      return true;
    });
    return accepted
      ? null
      : Response.json(
          { error: "Too many requests. Please try again later." },
          {
            status: 429,
            headers: {
              "Retry-After": String(seconds),
              "Cache-Control": "no-store",
            },
          },
        );
  } catch {
    return Response.json(
      { error: "Service temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
export async function cleanRateLimits() {
  await initialize();
  await pool.query("DELETE FROM api_limits WHERE expires<$1", [Date.now()]);
}
