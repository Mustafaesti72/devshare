import { listings } from "@/lib/submissions.mjs";
import { storageConfigured, checkStorage } from "@/lib/media.mjs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await listings("pending");
    if (storageConfigured()) await checkStorage();
    return Response.json({status:"ok",database:process.env.DATABASE_URL?"postgresql":"sqlite",storage:storageConfigured()?"s3":"local"}, {headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex"}});
  } catch { return Response.json({status:"unavailable"}, {status:503}); }
}
