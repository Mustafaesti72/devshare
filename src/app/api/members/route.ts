import { publicMembers } from "@/lib/accounts.mjs";
import { memberIds } from "@/lib/member-data";
import { apiLimit } from "@/lib/api-limit.mjs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
export async function GET(request: Request) {
  let ids: string[];
  try {
    ids = memberIds(new URL(request.url).searchParams.get("ids") || "");
  } catch {
    return Response.json(
      { error: "Request up to 50 valid profile IDs." },
      { status: 400, headers },
    );
  }
  if (!ids.length) return Response.json({ members: [] }, { headers });
  const limited = await apiLimit(request, "public-members", { limit: 120 });
  if (limited) return limited;
  try {
    return Response.json({ members: await publicMembers(ids) }, { headers });
  } catch {
    return Response.json(
      { error: "Profiles are temporarily unavailable." },
      { status: 503, headers },
    );
  }
}
