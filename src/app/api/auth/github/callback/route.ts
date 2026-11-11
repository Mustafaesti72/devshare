import { NextRequest, NextResponse } from "next/server";
import { consumeLogin, createSession, sameState } from "@/lib/accounts.mjs";
import { stateCookie, sessionCookie, cookieOptions } from "@/lib/auth";
import { siteUrl } from "@/lib/site";
export const dynamic = "force-dynamic";
export async function GET(request:NextRequest) {
  const state=request.nextUrl.searchParams.get("state"),code=request.nextUrl.searchParams.get("code");
  function failure() {
    const response=NextResponse.redirect(new URL("/login?error=failed",siteUrl));
    response.cookies.set(stateCookie,"",{...cookieOptions,maxAge:0});
    response.headers.set("Cache-Control","no-store");
    return response;
  }
  if(!sameState(state,request.cookies.get(stateCookie)?.value) || !code || code.length>512) return failure();
  try {
    const verifier=await consumeLogin(state!);
    if(!verifier) return failure();
    const tokenResponse=await fetch("https://github.com/login/oauth/access_token",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:process.env.GITHUB_CLIENT_ID!,client_secret:process.env.GITHUB_CLIENT_SECRET!,code,redirect_uri:new URL("/api/auth/github/callback",siteUrl).href,code_verifier:verifier}),cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10000)});
    if(!tokenResponse.ok) return failure();
    const token=await tokenResponse.json();
    if(typeof token.access_token!=="string") return failure();
    const identityResponse=await fetch("https://api.github.com/user",{headers:{Authorization:"Bearer "+token.access_token,Accept:"application/vnd.github+json","User-Agent":"DevShare"},cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10000)});
    if(!identityResponse.ok) return failure();
    const identity=await identityResponse.json();
    const session=await createSession(identity,request.cookies.get(sessionCookie)?.value);
    const response=NextResponse.redirect(new URL("/dashboard",siteUrl));
    response.cookies.set(stateCookie,"",{...cookieOptions,maxAge:0});
    response.cookies.set(sessionCookie,session,{...cookieOptions,maxAge:30*86400});
    response.headers.set("Cache-Control","no-store");
    return response;
  } catch { return failure(); }
}
