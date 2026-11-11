import { currentUser } from "@/lib/auth";
import { submitReport } from "@/lib/reports.mjs";
import { publishedProject } from "@/lib/publishing.mjs";
import { publicProfile } from "@/lib/accounts.mjs";
import { apiLimit } from "@/lib/api-limit.mjs";
import { jsonObject, RequestBodyError } from "@/lib/request-body";
import { siteUrl } from "@/lib/site";
import records from "@/lib/directory.json";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== siteUrl.origin)
    return new Response(null, { status: 403 });
  const user = await currentUser();
  if (!user)
    return Response.json(
      { error: "Sign in to send a report." },
      { status: 401 },
    );
  const limited = await apiLimit(request, "reports", {
    identity: user.id,
    limit: 10,
    seconds: 3600,
  });
  if (limited) return limited;
  let input;
  try {
    input = await jsonObject(request, 10000);
  } catch (error) {
    return Response.json(
      { error: "Invalid report." },
      { status: error instanceof RequestBodyError ? error.status : 400 },
    );
  }
  const { type, target, category, reason } = input;
  if (
    typeof type !== "string" ||
    typeof target !== "string" ||
    typeof category !== "string" ||
    typeof reason !== "string"
  )
    return Response.json({ error: "Complete the report." }, { status: 400 });
  const valid =
    type === "profile"
      ? await publicProfile(target)
      : type === "project" &&
        (records.some(
          (repo) => repo.fullName.toLowerCase() === target.toLowerCase(),
        ) ||
          (await publishedProject(target)));
  if (!valid)
    return Response.json(
      { error: "This page is no longer available." },
      { status: 404 },
    );
  try {
    await submitReport(user.id, type, target, category, reason);
    return Response.json(
      { received: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Use a description of 20 to 2000 characters." },
      { status: 400 },
    );
  }
}
