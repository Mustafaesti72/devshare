import { apiLimit } from "@/lib/api-limit.mjs";
import { NextResponse } from "next/server";
import { startLogin } from "@/lib/accounts.mjs";
import { authConfigured, stateCookie, cookieOptions } from "@/lib/auth";
import { siteUrl } from "@/lib/site";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const limited = await apiLimit(request, "sign-in", {
    limit: 20,
    seconds: 600,
  });
  if (limited) return limited;
  if (!authConfigured())
    return NextResponse.redirect(new URL("/login?error=unavailable", siteUrl));
  try {
    const { state, challenge } = await startLogin();
    const url = new URL("https://github.com/login/oauth/authorize");
    url.search = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID!,
      redirect_uri: new URL("/api/auth/github/callback", siteUrl).href,
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
      scope: "",
      allow_signup: "true",
    }).toString();
    const response = NextResponse.redirect(url);
    response.headers.set("Cache-Control", "no-store");
    response.cookies.set(stateCookie, state, { ...cookieOptions, maxAge: 600 });
    return response;
  } catch {
    return NextResponse.redirect(new URL("/login?error=unavailable", siteUrl));
  }
}
