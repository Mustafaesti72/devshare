export type Report = {
  id: string;
  target_type: string;
  target: string;
  category: string;
  reason: string;
  created_at: Date;
  github_login: string;
};
export function submitReport(
  userId: string,
  type: string,
  target: string,
  category: string,
  reason: string,
): Promise<string>;
export function openReports(): Promise<Report[]>;
export function resolveReport(
  id: string,
  reviewerId: number,
  note: string,
): Promise<boolean>;
