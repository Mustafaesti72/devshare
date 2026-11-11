export type PublicMember = {
  id: string;
  github_login: string;
  display_name: string;
  avatar_url: string;
  bio: string;
};
export function isMemberId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(value)
  );
}
export function memberIds(raw: string): string[] {
  if (raw.length > 2000) throw new Error("Too many profiles");
  if (!raw) return [];
  const values = raw.split(",");
  if (values.length > 50 || !values.every(isMemberId))
    throw new Error("Invalid profile IDs");
  return [...new Set(values)];
}
