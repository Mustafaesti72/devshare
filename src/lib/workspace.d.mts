export function readWorkspace(userId: string): Promise<Record<string, string>>;
export function writeWorkspace(
  userId: string,
  key: string,
  base: string,
  next: string,
): Promise<{ conflict: boolean; value: string }>;
