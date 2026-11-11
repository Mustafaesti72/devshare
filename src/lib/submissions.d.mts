type Listing = {
  id: number;
  full_name: string;
  summary: string;
  submitted: number;
};
export function startProof(repo: string): { token: string; phrase: string };
export function getProof(
  token: string,
): { phrase: string; repo: string } | undefined;
export function submit(
  token: string,
  repo: { id: number; full_name: string; owner: { id: number } },
  summary: string,
): void;
export function listings(status: "approved" | "pending"): Listing[];
export function review(id: number, action: "approved" | "hidden"): void;

export function reserveAttempt(token:string):boolean;
