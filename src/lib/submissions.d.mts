import type { PublicRepository } from "./github-input";
type Listing = {
  id: number;
  full_name: string;
  summary: string;
  submitted: number;
  published_at?: number | null;
  category?: string;
  repository?: PublicRepository;
};
export function startProof(
  repo: string,
): Promise<{ token: string; phrase: string }>;
export function getProof(
  token: string,
): Promise<{ phrase: string; repo: string } | undefined>;
export function submit(
  token: string,
  repo: { id: number; full_name: string; owner: { id: number } },
  summary: string,
  category?: string,
): Promise<void>;
export function listings(status: "approved" | "pending"): Promise<Listing[]>;
export function review(
  id: number,
  action: "approved" | "hidden",
): Promise<void>;
export function reserveAttempt(token: string): Promise<boolean>;
