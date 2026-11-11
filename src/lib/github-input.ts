export function parseRepository(
  input: string,
): { owner: string; repo: string } | null {
  let value = input.trim();
  if (value.length > 250) return null;
  if (value.startsWith("https://")) {
    try {
      const url = new URL(value);
      if (
        url.hostname !== "github.com" ||
        url.username ||
        url.password ||
        url.port ||
        url.search ||
        url.hash
      )
        return null;
      value = url.pathname.replace(/^\//, "");
    } catch {
      return null;
    }
  }
  value = value.replace(/\/$/, "").replace(/\.git$/, "");
  const parts = value.split("/");
  if (parts.length !== 2) return null;
  const [owner, repo] = parts;
  if (
    !/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(owner) ||
    !/^[a-z\d_.-]{1,100}$/i.test(repo) ||
    repo === "." ||
    repo === ".."
  )
    return null;
  return { owner, repo };
}
export type PublicRepository = {
  id: number;
  fullName: string;
  description: string;
  sourceUrl: string;
  owner: string;
  name: string;
  language: string | null;
  license: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  archived: boolean;
  isFork: boolean;
  defaultBranch: string;
  pushedAt: string | null;
  fetchedAt: string;
  topics: string[];
};

export const sourceSnapshotLimit = 500;

export function parseSourceSnapshots(raw: string): PublicRepository[] {
  try {
    const values = JSON.parse(raw);
    if (!Array.isArray(values)) return [];
    const text = (v: unknown, max: number) =>
      typeof v === "string" ? v.slice(0, max) : "";
    const count = (v: unknown) =>
      typeof v === "number" && Number.isFinite(v)
        ? Math.max(0, Math.floor(v))
        : 0;
    const result: PublicRepository[] = [];
    for (const x of values.slice(0, sourceSnapshotLimit)) {
      if (
        !x ||
        typeof x.id !== "number" ||
        !Number.isSafeInteger(x.id) ||
        x.id <= 0 ||
        typeof x.fullName !== "string" ||
        typeof x.fetchedAt !== "string" ||
        !Number.isFinite(Date.parse(x.fetchedAt))
      )
        continue;
      const p = parseRepository(x.fullName);
      if (!p) continue;
      result.push({
        id: x.id,
        owner: p.owner,
        name: p.repo,
        fullName: `${p.owner}/${p.repo}`,
        sourceUrl: `https://github.com/${p.owner}/${p.repo}`,
        description: text(x.description, 1500),
        language: typeof x.language === "string" ? text(x.language, 80) : null,
        license: typeof x.license === "string" ? text(x.license, 100) : null,
        stars: count(x.stars),
        forks: count(x.forks),
        openIssues: count(x.openIssues),
        archived: x.archived === true,
        isFork: x.isFork === true,
        defaultBranch: text(x.defaultBranch, 100),
        pushedAt:
          typeof x.pushedAt === "string" &&
          Number.isFinite(Date.parse(x.pushedAt))
            ? x.pushedAt
            : null,
        fetchedAt: x.fetchedAt,
        topics: Array.isArray(x.topics)
          ? x.topics
              .filter((v: unknown) => typeof v === "string")
              .slice(0, 12)
              .map((v: string) => v.slice(0, 60))
          : [],
      });
    }
    return result;
  } catch {
    return [];
  }
}

export function storeSourceSnapshot(
  raw: string,
  source: PublicRepository,
): string {
  const references = parseSourceSnapshots(raw);
  const valid = parseSourceSnapshots(JSON.stringify([source]))[0];
  if (!valid) throw new Error("Invalid source snapshot");
  if (
    references.length >= sourceSnapshotLimit &&
    !references.some((item) => item.id === valid.id)
  )
    throw new Error("Source library limit reached");
  return JSON.stringify([
    valid,
    ...references.filter((item) => item.id !== valid.id),
  ]);
}
