import type { PublicRepository } from "./github-input";
export function repositorySnapshot(
  data: Record<string, unknown>,
  at?: string,
): PublicRepository;
