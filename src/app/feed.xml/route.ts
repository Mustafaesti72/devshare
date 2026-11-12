import { listings } from "@/lib/submissions.mjs";
import { launchFeed } from "@/lib/launch-feed";
import { siteUrl } from "@/lib/site";
export const dynamic = "force-dynamic";
export async function GET() {
  return new Response(launchFeed(await listings("approved"), siteUrl.origin), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=60",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
