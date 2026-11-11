import { NextRequest, NextResponse } from "next/server";
import { endSession } from "@/lib/accounts.mjs";
import { cookieOptions, sessionCookie } from "@/lib/auth";
import { siteUrl } from "@/lib/site";
export async function POST(request:NextRequest) {
  if(request.headers.get("origin")!==siteUrl.origin)return new Response(null,{status:403});
  const token=request.cookies.get(sessionCookie)?.value;
  if(token) {
    const data=await request.formData();
    await endSession(token,data.get("all")==="true");
  }
  const response=NextResponse.redirect(new URL("/",siteUrl),303);
  response.cookies.set(sessionCookie,"",{...cookieOptions,maxAge:0});
  response.headers.set("Cache-Control","no-store");
  return response;
}
