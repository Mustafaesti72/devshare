export type PublishedProject = {
  id: number;
  full_name: string;
  summary: string;
  submitted: number;
  has_image?: boolean;
  creator_id?: string;
  creator_name?: string;
  published_at?: number;
};
export type Review = {
  id: number;
  full_name: string;
  summary: string;
  submitted: number;
  status: string;
  has_image?: boolean;
};
export function publishedProject(
  name: string,
): Promise<PublishedProject | null>;
export function pendingReviews(status: string): Promise<Review[]>;
export function moderate(
  id: number,
  submitted: number,
  action: string,
  reason: string,
  reviewerId: number,
): Promise<boolean>;
export function publishedPaths(): Promise<
  { full_name: string; submitted: number }[]
>;
