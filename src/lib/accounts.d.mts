export type User = {
  id: string;
  github_id: number;
  github_login: string;
  display_name: string;
  bio: string;
  website: string;
  avatar_url: string;
  created_at: string;
};
export type UserProject = {
  id: number;
  full_name: string;
  summary: string;
  status: string;
  submitted: number;
  revision: number;
  has_image?: boolean;
  feedback?: string;
};
export function sameState(a: unknown, b: unknown): boolean;
export function safeWebsite(value: unknown): string;
export function startLogin(): Promise<{ state: string; challenge: string }>;
export function consumeLogin(state: string): Promise<string | undefined>;
export function createSession(
  identity: {
    id: number;
    login: string;
    avatar_url: string;
    name?: string;
    bio?: string;
  },
  previousToken?: string,
): Promise<string>;
export function sessionUser(token: string): Promise<User | null>;
export function endSession(token: string, all?: boolean): Promise<void>;
export function publicProfile(id: string): Promise<User | null>;
export function updateProfile(
  id: string,
  input: Record<string, unknown>,
): Promise<void>;
export function userProjects(
  githubId: number,
  publicOnly?: boolean,
): Promise<UserProject[]>;

export function deleteAccount(id: string): Promise<void>;
