export function apiLimit(
  request: Request,
  scope: string,
  options?: { identity?: string; limit?: number; seconds?: number },
): Promise<Response | null>;
export function cleanRateLimits(): Promise<void>;
