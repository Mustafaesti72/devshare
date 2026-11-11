import { NextResponse } from "next/server";
import { currentModerator } from "@/lib/moderation";
import { resolveReport } from "@/lib/reports.mjs";
import { siteUrl } from "@/lib/site";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== siteUrl.origin)
    return new Response(null, { status: 403 });
  const user = await currentModerator();
  if (!user) return new Response(null, { status: 403 });
  const form = await request.formData();
  let result = "invalid";
  try {
    result = (await resolveReport(
      String(form.get("id")),
      user.github_id,
      String(form.get("note") || ""),
    ))
      ? "saved"
      : "stale";
  } catch {}
  return NextResponse.redirect(
    new URL("/moderation?status=reports&result=" + result, siteUrl),
    303,
  );
}
