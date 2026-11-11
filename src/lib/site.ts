export const siteUrl = new URL(process.env.APP_URL || (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : "http://localhost:3000"));
export const indexable =
  process.env.ALLOW_INDEXING !== "false" &&
  siteUrl.protocol === "https:" &&
  !["localhost", "127.0.0.1"].includes(siteUrl.hostname);
