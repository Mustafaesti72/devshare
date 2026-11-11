import { currentUser } from "./auth";
export async function currentModerator() {
  const user = await currentUser();
  const ids = (process.env.ADMIN_GITHUB_IDS || "")
    .split(",")
    .map((id) => id.trim());
  return user && ids.includes(String(user.github_id)) ? user : null;
}
