export const sources: string[];
export function engagementToken(id: number, now?: number): string;
export function verifyEngagementToken(
  token: unknown,
  now?: number,
): { id: number; at: number; nonce: string } | null;
export function recordEngagement(input: {
  token: string;
  actor: string;
  kind: string;
  source: string;
}): Promise<boolean>;
export function cleanEngagement(): Promise<void>;
export type Analytics = {
  projects: {
    id: number;
    full_name: string;
    views: number;
    outbound: number;
    visitors: number;
    saves: number;
  }[];
  daily: { day: string; views: number; outbound: number }[];
  sources: { source: string; visits: number }[];
  allTime: { views: number; outbound: number };
  followers: number;
  period: { views: number; outbound: number };
};
export function creatorAnalytics(
  ownerId: number,
  userId: string,
  days?: number,
): Promise<Analytics>;
