import { NextResponse } from "next/server";
import { currentModerator } from "@/lib/moderation";
import { reviewProfile } from "@/lib/profile-moderation.mjs";
import { siteUrl } from "@/lib/site";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== siteUrl.origin)
    return new Response(null, { status: 403 });
  const user = await currentModerator();
  if (!user) return new Response(null, { status: 403 });
  const form = await request.formData();
  let result = "invalid";
  try {
    result = (await reviewProfile(
      String(form.get("id")),
      Number(form.get("revision")),
      String(form.get("action")),
      String(form.get("note") || ""),
      user.github_id,
    ))
      ? "saved"
      : "stale";
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "Invalid review")
      return new Response("Review unavailable", { status: 503 });
  }
  return NextResponse.redirect(
    new URL("/moderation?status=profiles&result=" + result, siteUrl),
    303,
  );
}
