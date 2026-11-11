import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { writeImage, readImage } from "../src/lib/media.mjs";
let count=0;
for (const name of await readdir("public/owners")) {
  if (!name.endsWith(".png")) continue;
  const bytes = await readFile(join("public/owners",name));
  await writeImage(name,bytes);
  const stored = await readImage(name);
  if (!Buffer.from(stored.bytes).equals(bytes)) throw new Error("Image verification failed");
  count++;
}
console.log(JSON.stringify({uploaded:count,verified:count}));
