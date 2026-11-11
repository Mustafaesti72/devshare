import { recordEngagement } from "@/lib/engagement.mjs";
import { apiLimit } from "@/lib/api-limit.mjs";
import { jsonObject, RequestBodyError } from "@/lib/request-body";
import { siteUrl } from "@/lib/site";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== siteUrl.origin)
    return new Response(null, { status: 403 });
  if (
    /bot|spider|crawl|headless|preview|lighthouse|monitor/i.test(
      request.headers.get("user-agent") || "",
    )
  )
    return Response.json({ recorded: false });
  const limited = await apiLimit(request, "engagement", { limit: 120 });
  if (limited) return limited;
  let data;
  try {
    data = await jsonObject(request, 2048);
  } catch (error) {
    return Response.json(
      { error: "Invalid event." },
      { status: error instanceof RequestBodyError ? error.status : 400 },
    );
  }
  if (
    typeof data.token !== "string" ||
    typeof data.actor !== "string" ||
    typeof data.kind !== "string" ||
    typeof data.source !== "string"
  )
    return Response.json({ error: "Invalid event." }, { status: 400 });
  return Response.json(
    {
      recorded: await recordEngagement({
        token: data.token,
        actor: data.actor,
        kind: data.kind,
        source: data.source,
      }),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
