import type { User } from "./accounts.mjs";
export function profileQueue(): Promise<User[]>;
export function reviewProfile(
  id: string,
  revision: number,
  action: string,
  note: string,
  reviewerId: number,
): Promise<boolean>;
