import { currentUser } from "@/lib/auth";
import { updateProfile } from "@/lib/accounts.mjs";
import { siteUrl } from "@/lib/site";
export async function POST(request:Request) {
  if(request.headers.get("origin")!==siteUrl.origin) return Response.json({error:"Open your profile on this site."},{status:403});
  const user=await currentUser();
  if(!user)return Response.json({error:"Sign in to edit your profile."},{status:401});
  if(!request.headers.get("content-type")?.startsWith("application/json"))return Response.json({error:"JSON is required."},{status:415});
  const body=await request.text();
  if(body.length>5000)return Response.json({error:"Profile is too long."},{status:413});
  let input;
  try {input=JSON.parse(body);if(!input || typeof input!=="object")throw new Error();}
  catch {return Response.json({error:"Invalid profile."},{status:400});}
  try {await updateProfile(user.id,input);return Response.json({saved:true},{headers:{"Cache-Control":"no-store"}});}
  catch(error) {return Response.json({error:error instanceof Error && !("code" in error)?error.message:"Profile could not be saved."},{status:400});}
}
