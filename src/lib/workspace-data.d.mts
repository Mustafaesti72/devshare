export const workspaceKeys: string[];
export function emptyValue(key: string): string;
export function normalizeWorkspace(key: string, raw: string): string;
export function mergeWorkspace(
  key: string,
  base: string,
  next: string,
  current: string,
): string;
