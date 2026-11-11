import { parseRepository, type PublicRepository } from "@/lib/github-input";
const cache = new Map<string, { expires: number; data: PublicRepository }>();
let windowStart = Date.now();
let requests = 0;
let concurrent = 0;
function reply(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
    },
  });
}
function text(v: unknown, max = 500) {
  return typeof v === "string" ? v.slice(0, max) : "";
}
function count(v: unknown) {
  return typeof v === "number" && Number.isFinite(v)
    ? Math.max(0, Math.floor(v))
    : 0;
}
export async function GET(request: Request) {
  const input = new URL(request.url).searchParams.get("repo") || "";
  const parsed = parseRepository(input);
  if (!parsed)
    return reply(
      {
        error:
          "Use owner/repository or a full https://github.com/owner/repository URL.",
      },
      400,
    );
  const key = `${parsed.owner}/${parsed.repo}`.toLowerCase();
  const existing = cache.get(key);
  if (existing && existing.expires > Date.now())
    return reply({ repository: existing.data, cached: true });
  if (Date.now() - windowStart > 3600000) {
    windowStart = Date.now();
    requests = 0;
  }
  if (requests >= 45 || concurrent >= 3)
    return reply(
      {
        error:
          "The shared public lookup budget is temporarily exhausted. Try again later or open the repository on GitHub.",
      },
      429,
    );
  requests++;
  concurrent++;
  try {
    const response = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2026-03-10",
          "User-Agent": "DevShare-Local-Preview",
        },
        signal: AbortSignal.timeout(8000),
        redirect: "error",
        cache: "no-store",
      },
    );
    if (response.status === 404)
      return reply(
        {
          error:
            "Public repository not found. Check the owner and repository name.",
        },
        404,
      );
    if ([403, 429].includes(response.status))
      return reply(
        {
          error:
            "GitHub is limiting unauthenticated requests. Try again later. No private credentials are needed for this preview.",
        },
        429,
      );
    if (!response.ok)
      return reply(
        {
          error:
            "GitHub could not complete this request. Please try again later.",
        },
        502,
      );
    const data = await response.json();
    if (
      data.private !== false ||
      data.visibility !== "public" ||
      typeof data.id !== "number" ||
      !data.owner ||
      typeof data.owner.login !== "string" ||
      typeof data.name !== "string"
    )
      return reply(
        { error: "The response was not a supported public repository." },
        502,
      );
    const normalized = parseRepository(`${data.owner.login}/${data.name}`);
    if (!normalized)
      return reply(
        { error: "Repository metadata could not be validated." },
        502,
      );
    const repository: PublicRepository = {
      id: data.id,
      fullName: `${normalized.owner}/${normalized.repo}`,
      owner: normalized.owner,
      name: normalized.repo,
      description: text(data.description, 1500),
      sourceUrl: `https://github.com/${encodeURIComponent(normalized.owner)}/${encodeURIComponent(normalized.repo)}`,
      language:
        typeof data.language === "string" ? text(data.language, 80) : null,
      license:
        typeof data.license?.spdx_id === "string" &&
        data.license.spdx_id !== "NOASSERTION"
          ? text(data.license.spdx_id, 100)
          : null,
      stars: count(data.stargazers_count),
      forks: count(data.forks_count),
      openIssues: count(data.open_issues_count),
      archived: data.archived === true,
      isFork: data.fork === true,
      defaultBranch: text(data.default_branch, 100),
      pushedAt:
        typeof data.pushed_at === "string" ? text(data.pushed_at, 40) : null,
      fetchedAt: new Date().toISOString(),
      topics: Array.isArray(data.topics)
        ? data.topics
            .filter((v: unknown) => typeof v === "string")
            .slice(0, 12)
            .map((v: string) => v.slice(0, 60))
        : [],
    };
    if (cache.size >= 40) {
      const oldest = cache.keys().next().value;
      if (oldest) cache.delete(oldest);
    }
    cache.set(key, { expires: Date.now() + 300000, data: repository });
    return reply({ repository, cached: false });
  } catch {
    return reply(
      {
        error:
          "The public GitHub API is unavailable from this server. Check the network connection and try again.",
      },
      502,
    );
  } finally {
    concurrent--;
  }
}
