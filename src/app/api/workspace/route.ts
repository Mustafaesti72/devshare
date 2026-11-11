import { currentUser } from "@/lib/auth";
import { readWorkspace, writeWorkspace } from "@/lib/workspace.mjs";
import { siteUrl } from "@/lib/site";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
export async function GET() {
  const user = await currentUser();
  if (!user)
    return Response.json(
      { error: "Sign in to sync your library." },
      { status: 401, headers },
    );
  return Response.json({ values: await readWorkspace(user.id) }, { headers });
}
export async function POST(request: Request) {
  if (request.headers.get("origin") !== siteUrl.origin)
    return Response.json(
      { error: "Invalid origin." },
      { status: 403, headers },
    );
  const user = await currentUser();
  if (!user)
    return Response.json(
      { error: "Sign in to sync your library." },
      { status: 401, headers },
    );
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return Response.json(
      { error: "JSON is required." },
      { status: 415, headers },
    );
  const reader = request.body?.getReader();
  if (!reader)
    return Response.json(
      { error: "Missing workspace data." },
      { status: 400, headers },
    );
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 4000000) {
      await reader.cancel();
      return Response.json(
        { error: "Workspace data is too large." },
        { status: 413, headers },
      );
    }
    chunks.push(value);
  }
  let data;
  try {
    data = JSON.parse(Buffer.concat(chunks).toString());
    if (
      typeof data.key !== "string" ||
      typeof data.base !== "string" ||
      typeof data.value !== "string"
    )
      throw new Error();
  } catch {
    return Response.json(
      { error: "Invalid workspace data." },
      { status: 400, headers },
    );
  }
  try {
    const result = await writeWorkspace(
      user.id,
      data.key,
      data.base,
      data.value,
    );
    return Response.json(result, {
      status: result.conflict ? 409 : 200,
      headers,
    });
  } catch {
    return Response.json(
      { error: "Workspace could not be saved." },
      { status: 503, headers },
    );
  }
}
