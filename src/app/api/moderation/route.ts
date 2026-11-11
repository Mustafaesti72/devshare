import { NextResponse } from "next/server";
import { currentModerator } from "@/lib/moderation";
import { moderate } from "@/lib/publishing.mjs";
import { siteUrl } from "@/lib/site";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== siteUrl.origin)
    return new Response(null, { status: 403 });
  const user = await currentModerator();
  if (!user) return new Response(null, { status: 403 });
  const data = await request.formData();
  let result = "invalid";
  try {
    result = (await moderate(
      Number(data.get("id")),
      Number(data.get("submitted")),
      String(data.get("action")),
      String(data.get("reason") || ""),
      user.github_id,
    ))
      ? "saved"
      : "stale";
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "Invalid review")
      return new Response("Review service unavailable", { status: 503 });
  }
  return NextResponse.redirect(
    new URL("/moderation?result=" + result, siteUrl),
    303,
  );
}
