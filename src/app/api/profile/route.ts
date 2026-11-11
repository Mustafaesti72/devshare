import { apiLimit } from "@/lib/api-limit.mjs";
import { jsonObject, RequestBodyError } from "@/lib/request-body";
import { currentUser } from "@/lib/auth";
import { updateProfile } from "@/lib/accounts.mjs";
import { siteUrl } from "@/lib/site";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== siteUrl.origin)
    return Response.json(
      { error: "Open your profile on this site." },
      { status: 403 },
    );
  const user = await currentUser();
  if (!user)
    return Response.json(
      { error: "Sign in to edit your profile." },
      { status: 401 },
    );
  const limited = await apiLimit(request, "profile", {
    identity: user.id,
    limit: 30,
    seconds: 600,
  });
  if (limited) return limited;
  let input;
  try {
    input = await jsonObject(request, 5000);
  } catch (error) {
    return Response.json(
      { error: "Invalid profile." },
      { status: error instanceof RequestBodyError ? error.status : 400 },
    );
  }
  try {
    await updateProfile(user.id, input);
    return Response.json(
      { saved: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error && !("code" in error)
            ? error.message
            : "Profile could not be saved.",
      },
      { status: 400 },
    );
  }
}
