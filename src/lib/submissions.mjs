// Local development keeps its existing SQLite data. Production selects PostgreSQL.
let adapter;
function storage() {
  if (!adapter)
    adapter = process.env.DATABASE_URL
      ? import("./postgres.mjs")
      : import("./submissions-sqlite.mjs");
  return adapter;
}
export async function startProof(repo) {
  return (await storage()).startProof(repo);
}
export async function getProof(token) {
  return (await storage()).getProof(token);
}
export async function submit(token, repo, summary, category = "Tooling") {
  return (await storage()).submit(token, repo, summary, category);
}
export async function listings(status) {
  return (await storage()).listings(status);
}
export async function review(id, action) {
  return (await storage()).review(id, action);
}
export async function reserveAttempt(token) {
  return (await storage()).reserveAttempt(token);
}
