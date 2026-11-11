import records from "@/lib/directory.json";
import { readImage, storageConfigured } from "@/lib/media.mjs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
export const runtime = "nodejs";
const names = new Set(records.map(r=>r.name+".png"));
export async function GET(request:Request, {params}:{params:Promise<{name:string}>}) {
  const {name}=await params;
  if (!names.has(name)) return new Response(null,{status:404});
  try {
    const image = storageConfigured() ? await readImage(name) : {bytes:await readFile(join(process.cwd(),"public","owners",name)),etag:undefined};
    const headers:Record<string,string>={"Content-Type":"image/png","Cache-Control":"public, max-age=86400, s-maxage=86400","X-Content-Type-Options":"nosniff"};
    if(image.etag) headers.ETag=image.etag;
    if(image.etag && request.headers.get("if-none-match")===image.etag) return new Response(null,{status:304,headers});
    return new Response(new Uint8Array(image.bytes),{headers});
  } catch { return new Response(null,{status:503,headers:{"Cache-Control":"no-store"}}); }
}
