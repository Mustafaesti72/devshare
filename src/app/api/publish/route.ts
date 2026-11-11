import { NextRequest, NextResponse } from "next/server";
import { siteUrl } from "@/lib/site";
import { parseRepository } from "@/lib/github-input";
import { startProof, getProof, submit, reserveAttempt } from "@/lib/submissions.mjs";
const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status });
async function github(path: string) {
  return fetch("https://api.github.com/" + path, {
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(8000),
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "DevShare-publishing",
    },
  });
}
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== siteUrl.origin)
    return fail("Open the form on this site to submit.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return fail("JSON is required.", 415);
  const raw = await request.text();
  if (raw.length > 5000) return fail("Input too long.", 413);
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return fail("Invalid form.", 400);
  }
  if (!data || typeof data !== "object") return fail("Invalid form.", 400);
  if (data.action === "start") {
    const repo = parseRepository(
      typeof data.repo === "string" ? data.repo : "",
    );
    if (!repo) return fail("Enter a public GitHub repository.", 400);
    try {
      const proof = await startProof(repo.owner + "/" + repo.repo);
      const result = NextResponse.json({ phrase: proof.phrase });
      result.cookies.set("devshare_proof", proof.token, {
        httpOnly: true,
        sameSite: "strict",
        secure: siteUrl.protocol === "https:",
        maxAge: 900,
        path: "/api/publish",
      });
      return result;
    } catch {
      return fail("Publishing is temporarily unavailable.", 503);
    }
  }
  if (data.action !== "verify") return fail("Unknown action.", 400);
  const token = request.cookies.get("devshare_proof")?.value || "",
    proof = await getProof(token);
  if (!proof) return fail("The verification expired. Start again.", 410);
  const match =
    typeof data.gist === "string" &&
    data.gist
      .trim()
      .match(
        /^https:\/\/gist\.github\.com\/[a-z0-9-]+\/([a-f0-9]{20,64})\/?$/i,
      );
  const summary = typeof data.summary === "string" ? data.summary.trim() : "";
  if (!match || summary.length < 40 || summary.length > 1000)
    return fail(
      "Enter the Gist URL and a description of 40 to 1000 characters.",
      400,
    );
  try {
    if(!(await reserveAttempt(token)))return fail("Verification attempts exhausted. Start a new verification.",429);
    const [gr, rr] = await Promise.all([
      github("gists/" + match[1]),
      github("repos/" + proof.repo),
    ]);
    if (!gr.ok || !rr.ok)
      return fail(
        "GitHub could not confirm both public resources. Check the URLs or retry later.",
        422,
      );
    const [gist, repo] = await Promise.all([gr.json(), rr.json()]);
    if (
      gist.public !== true ||
      repo.private !== false ||
      repo.owner?.type !== "User" ||
      !Number.isSafeInteger(repo.owner?.id) ||
      gist.owner?.id !== repo.owner.id ||
      gist.files?.["devshare.txt"]?.content?.trim() !== proof.phrase ||
      repo.full_name?.toLowerCase() !== proof.repo.toLowerCase()
    )
      return fail(
        "Verification failed. The personal repository and Gist must have the same owner and the file must match the challenge.",
        403,
      );
    await submit(token, repo, summary);
    const result = NextResponse.json({
      status: "pending",
      name: repo.full_name,
    });
    result.cookies.set("devshare_proof", "", {
      path: "/api/publish",
      maxAge: 0,
    });
    return result;
  } catch {
    return fail(
      "Verification could not finish. Retry or start a new verification.",
      503,
    );
  }
}
