import { currentModerator } from "@/lib/moderation";
import { ProjectImageUpload } from "@/components/project-image-upload";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { userProjects } from "@/lib/accounts.mjs";
export const metadata = {
  title: "Your dashboard",
  robots: { index: false, follow: false },
};
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const user = await currentUser();
  if (!user) redirect("/login");
  const moderator = await currentModerator();
  const projects = await userProjects(user.github_id);
  return (
    <main id="main" className="directory account-page">
      <header className="account-heading">
        <div>
          <p>@{user.github_login}</p>
          <h1>{user.display_name}’s workspace</h1>
        </div>
        <Link className="btn primary" href="/for-developers">
          Submit a repository
        </Link>
      </header>
      <nav className="account-nav">
        <Link href={"/members/" + user.id}>Public profile</Link>
        <Link href="/profile">Edit profile</Link>
        <Link href="/saved">Library</Link>
        {moderator && <Link href="/moderation">Review submissions</Link>}
      </nav>
      {notice && (
        <p role="status">
          {notice === "withdrawn"
            ? "Project withdrawn from discovery."
            : "The submission changed. Review its latest status below."}
        </p>
      )}
      <section>
        <h2>Your repositories</h2>
        {projects.length ? (
          <div className="account-projects">
            {projects.map((p) => (
              <article key={p.id}>
                <div>
                  <a href={"https://github.com/" + p.full_name}>
                    {p.full_name} ↗
                  </a>
                  <span className="status-pill">
                    {p.status === "pending"
                      ? "In review"
                      : p.status === "approved"
                        ? "Published"
                        : p.status === "withdrawn"
                          ? "Withdrawn"
                          : "Hidden"}
                  </span>
                </div>
                <p>{p.summary}</p>
                {p.feedback && <p>Latest update — {p.feedback}</p>}
                {p.status === "approved" && (
                  <p>
                    <Link href={"/showcase/" + p.full_name}>
                      View published page →
                    </Link>
                  </p>
                )}
                <small>
                  Submitted{" "}
                  {new Date(p.submitted).toLocaleDateString("en-US", {
                    dateStyle: "medium",
                    timeZone: "UTC",
                  })}
                </small>
                <p>
                  <Link
                    href={
                      "/for-developers?repo=" + encodeURIComponent(p.full_name)
                    }
                  >
                    Edit and resubmit →
                  </Link>
                </p>
                {p.status !== "withdrawn" && (
                  <form method="post" action={"/api/submissions/" + p.id}>
                    <input type="hidden" name="revision" value={p.revision} />
                    <button className="plain-button">
                      Withdraw from discovery
                    </button>
                  </form>
                )}
                <ProjectImageUpload
                  id={p.id}
                  hasImage={p.has_image}
                  version={p.revision}
                />
              </article>
            ))}
          </div>
        ) : (
          <div className="account-empty">
            <p>Your first repository starts here.</p>
            <p>
              Submit a personal public GitHub repository. Once ownership is
              confirmed, it enters editorial review.
            </p>
            <Link href="/for-developers">Submit your first repository →</Link>
          </div>
        )}
      </section>
      <section className="account-security">
        <h2>Account access</h2>
        <p>You’re signed in with GitHub. Sessions expire after 30 days.</p>
        <div className="account-actions">
          <form method="post" action="/api/auth/logout">
            <button className="btn">Sign out</button>
          </form>
          <form method="post" action="/api/auth/logout">
            <input type="hidden" name="all" value="true" />
            <button className="btn">Sign out on all devices</button>
          </form>
        </div>
      </section>
    </main>
  );
}
