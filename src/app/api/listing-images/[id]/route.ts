import { currentUser } from "@/lib/auth";
import { currentModerator } from "@/lib/moderation";
import {
  listingForImage,
  saveListingImage,
  removeListingImage,
} from "@/lib/listing-images.mjs";
import { readObject } from "@/lib/media.mjs";
import { siteUrl } from "@/lib/site";
type Props = { params: Promise<{ id: string }> };
function numericId(value: string) {
  const id = Number(value);
  return /^[1-9]\d{0,15}$/.test(value) && Number.isSafeInteger(id) ? id : null;
}
export async function GET(request: Request, { params }: Props) {
  const id = numericId((await params).id);
  if (!id) return new Response(null, { status: 404 });
  const row = await listingForImage(id);
  if (!row?.object_key) return new Response(null, { status: 404 });
  if (row.status !== "approved") {
    const user = await currentUser();
    if (
      !user ||
      (user.github_id !== row.owner_id && !(await currentModerator()))
    )
      return new Response(null, { status: 404 });
  }
  try {
    const object = await readObject(row.object_key);
    return new Response(new Uint8Array(object.bytes), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
export async function POST(request: Request, { params }: Props) {
  if (request.headers.get("origin") !== siteUrl.origin)
    return new Response(null, { status: 403 });
  const user = await currentUser();
  if (!user)
    return Response.json(
      { error: "Sign in to upload an image." },
      { status: 401 },
    );
  const id = numericId((await params).id);
  if (!id) return new Response(null, { status: 404 });
  const row = await listingForImage(id);
  if (!row || row.owner_id !== user.github_id)
    return Response.json(
      { error: "Choose a repository you own." },
      { status: 403 },
    );
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(
      request.headers.get("content-type") || "",
    )
  )
    return Response.json(
      { error: "Choose a PNG, JPEG or WebP image." },
      { status: 415 },
    );
  const source = await fetch("https://api.github.com/repos/" + row.full_name, {
    headers: {
      "User-Agent": "DevShare-image-upload",
      Accept: "application/vnd.github+json",
    },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(8000),
  });
  if (!source.ok)
    return Response.json(
      { error: "GitHub could not confirm ownership. Try again later." },
      { status: 422 },
    );
  const repository = await source.json();
  if (
    repository.owner?.id !== user.github_id ||
    repository.id !== id ||
    repository.private !== false
  )
    return Response.json(
      { error: "Repository ownership could not be confirmed." },
      { status: 403 },
    );
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 4 * 1024 * 1024) {
      await reader.cancel();
      return Response.json(
        { error: "Image must be under 4 MB." },
        { status: 413 },
      );
    }
    chunks.push(value);
  }
  try {
    await saveListingImage(id, user.github_id, Buffer.concat(chunks));
    return Response.json(
      { uploaded: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      {
        error:
          "The image could not be saved. Use a still PNG, JPEG or WebP under 4 MB and 20 megapixels.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, { params }: Props) {
  if (request.headers.get("origin") !== siteUrl.origin)
    return new Response(null, { status: 403 });
  const user = await currentUser();
  if (!user) return new Response(null, { status: 401 });
  const id = numericId((await params).id);
  if (!id) return new Response(null, { status: 404 });
  try {
    await removeListingImage(id, user.github_id);
    return Response.json(
      { removed: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Image could not be removed." },
      { status: 403 },
    );
  }
}
