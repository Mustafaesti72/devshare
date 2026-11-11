import { listings, review } from "../src/lib/submissions.mjs";
const [action, id] = process.argv.slice(2);
if (!action) console.table(await listings("pending"));
else if (["approved", "hidden"].includes(action) && /^\d+$/.test(id))
  await review(Number(id), action);
else throw new Error("Usage: node scripts/review.mjs [approved|hidden ID]");
