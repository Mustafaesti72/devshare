import { listings } from "@/lib/submissions.mjs";
export const dynamic = "force-dynamic";
export function GET() {
  try { listings("pending"); return Response.json({status:"ok"}, {headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex"}}); }
  catch { return Response.json({status:"unavailable"}, {status:503}); }
}
