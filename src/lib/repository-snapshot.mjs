import { parseRepository, parseSourceSnapshots } from "./github-input.ts";
export function repositorySnapshot(data, at = new Date().toISOString()) {
  const path = parseRepository(
    typeof data.full_name === "string" ? data.full_name : "",
  );
  if (!path) throw new Error("Invalid repository");
  const source = {
    id: data.id,
    fullName: path.owner + "/" + path.repo,
    description: data.description,
    language: data.language,
    license:
      typeof data.license?.spdx_id === "string" &&
      data.license.spdx_id !== "NOASSERTION"
        ? data.license.spdx_id
        : null,
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssues: data.open_issues_count,
    archived: data.archived === true,
    isFork: data.fork === true,
    defaultBranch: data.default_branch,
    pushedAt: data.pushed_at,
    fetchedAt: at,
    topics: data.topics,
  };
  const repository = parseSourceSnapshots(JSON.stringify([source]))[0];
  if (!repository) throw new Error("Unsupported repository metadata");
  return repository;
}
