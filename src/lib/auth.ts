import { cookies } from "next/headers";
import { sessionUser } from "@/lib/accounts.mjs";
import { siteUrl } from "@/lib/site";
export const secure = siteUrl.protocol === "https:";
export const sessionCookie = secure ? "__Host-devshare_session" : "devshare_session";
export const stateCookie = secure ? "__Host-devshare_oauth" : "devshare_oauth";
export const cookieOptions = {httpOnly:true,secure,sameSite:"lax" as const,path:"/"};
export async function currentUser() {return sessionUser((await cookies()).get(sessionCookie)?.value || "");}
export function authConfigured() {return !!(process.env.DATABASE_URL && process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);}
