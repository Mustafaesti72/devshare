import { NextRequest, NextResponse } from "next/server";
import {
  currentUser,
  sessionCookie,
  cookieOptions,
  deletionCookie,
} from "@/lib/auth";
import { cleanMedia } from "@/lib/listing-images.mjs";
import { deleteAccount } from "@/lib/accounts.mjs";
import { siteUrl } from "@/lib/site";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== siteUrl.origin)
    return new Response(null, { status: 403 });
  const user = await currentUser();
  if (!user) return new Response(null, { status: 401 });
  const data = await request.formData();
  if (data.get("confirm") !== user.github_login)
    return NextResponse.redirect(
      new URL("/profile?error=confirmation", siteUrl),
      303,
    );
  await deleteAccount(user.id);
  try {
    await cleanMedia();
  } catch {
    console.error("Deleted account media cleanup will retry");
  }
  const response = NextResponse.redirect(
    new URL("/login?deleted=true", siteUrl),
    303,
  );
  response.cookies.set(sessionCookie, "", {
    ...cookieOptions,
    maxAge: 0,
  });
  response.cookies.set(deletionCookie, user.id, {
    ...cookieOptions,
    maxAge: 60,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
