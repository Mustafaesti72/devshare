import { currentUser } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET() {
  const headers={"Cache-Control":"no-store","X-Robots-Tag":"noindex"};
  try {const user=await currentUser();return Response.json({user:user?{id:user.id,display_name:user.display_name,avatar_url:user.avatar_url}:null},{headers});}
  catch {return Response.json({error:"Account service unavailable"},{status:503,headers});}
}
