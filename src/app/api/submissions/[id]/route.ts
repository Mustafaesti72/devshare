import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { siteUrl } from "@/lib/site";
import { withdrawProject } from "@/lib/publishing.mjs";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (request.headers.get("origin") !== siteUrl.origin)
    return new Response(null, { status: 403 });
  const user = await currentUser();
  if (!user) return new Response(null, { status: 401 });
  const data = await request.formData();
  const saved = await withdrawProject(
    Number((await params).id),
    user.github_id,
    Number(data.get("revision")),
  );
  return NextResponse.redirect(
    new URL("/dashboard?notice=" + (saved ? "withdrawn" : "stale"), siteUrl),
    303,
  );
}
