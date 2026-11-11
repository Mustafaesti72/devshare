import { profileQueue } from "@/lib/profile-moderation.mjs";
import { openReports } from "@/lib/reports.mjs";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { currentModerator } from "@/lib/moderation";
import { pendingReviews } from "@/lib/publishing.mjs";
export const metadata = {
  title: "Review submissions",
  robots: { index: false, follow: false },
};
export default async function Moderation({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; result?: string }>;
}) {
  if (!(await currentModerator())) notFound();
  const params = await searchParams;
  const status = [
    "pending",
    "approved",
    "hidden",
    "reports",
    "profiles",
  ].includes(params.status || "")
    ? params.status!
    : "pending";
  const reports = status === "reports" ? await openReports() : [];
  const profiles = status === "profiles" ? await profileQueue() : [];
  const reviews = ["reports", "profiles"].includes(status)
    ? []
    : await pendingReviews(status);
  return (
    <main id="main" className="directory account-page">
      <Link href="/dashboard">← Your dashboard</Link>
      <h1>Review submissions</h1>
      <nav className="account-nav">
        {["pending", "approved", "hidden", "reports", "profiles"].map((s) => (
          <Link
            key={s}
            href={"/moderation?status=" + s}
            aria-current={s === status ? "page" : undefined}
          >
            {s === "pending"
              ? "In review"
              : s === "approved"
                ? "Published"
                : s === "reports"
                  ? "Reports"
                  : s === "profiles"
                    ? "Profiles"
                    : "Hidden"}
          </Link>
        ))}
      </nav>
      {params.result && (
        <p role="status">
          {params.result === "saved"
            ? "Review saved."
            : params.result === "stale"
              ? "The submission changed during your review. Review the latest version below."
              : "Enter a reason of at least 10 characters when hiding a listing."}
        </p>
      )}
      {status === "profiles" && (
        <section>
          <h2>Maintainer profiles</h2>
          {profiles.map((profile) => (
            <article className="moderation-card" key={profile.id}>
              <h3>
                {profile.display_name} · @{profile.github_login}
              </h3>
              <p>{profile.bio}</p>
              <p>
                {profile.is_hidden
                  ? profile.review_requested
                    ? "Hidden · changes awaiting review"
                    : "Hidden"
                  : "Public"}
              </p>
              {profile.moderation_note && (
                <p>Latest review: {profile.moderation_note}</p>
              )}
              <form
                className="profile-form"
                action="/api/moderation/profiles"
                method="post"
              >
                <input type="hidden" name="id" value={profile.id} />
                <input
                  type="hidden"
                  name="revision"
                  value={profile.profile_revision}
                />
                <label>
                  Review note
                  <textarea
                    name="note"
                    required
                    minLength={10}
                    maxLength={1000}
                  />
                </label>
                <button
                  className="btn"
                  name="action"
                  value={profile.is_hidden ? "restore" : "hide"}
                >
                  {profile.is_hidden
                    ? "Restore profile"
                    : "Hide profile and published projects"}
                </button>
              </form>
            </article>
          ))}
        </section>
      )}
      {status === "reports" && (
        <section>
          <h2>Private reports</h2>
          {!reports.length && <p>No open reports.</p>}
          {reports.map((report) => (
            <article className="moderation-card" key={report.id}>
              <h3>
                {report.target_type} · {report.target}
              </h3>
              <p>
                {report.category} · Reported by @{report.github_login}
              </p>
              <p>{report.reason}</p>
              <Link
                href={
                  report.target_type === "profile"
                    ? "/members/" + report.target
                    : "/inspect?repo=" + encodeURIComponent(report.target)
                }
              >
                Inspect target →
              </Link>
              <form
                className="profile-form"
                method="post"
                action="/api/reports/resolve"
              >
                <input type="hidden" name="id" value={report.id} />
                <label>
                  Resolution
                  <textarea
                    name="note"
                    required
                    minLength={10}
                    maxLength={1000}
                  />
                </label>
                <button className="btn">Resolve report</button>
              </form>
            </article>
          ))}
        </section>
      )}
      {!["reports", "profiles"].includes(status) && !reviews.length && (
        <p>No submissions in this queue.</p>
      )}
      {reviews.map((row) => (
        <article className="moderation-card" key={row.id}>
          <h2>
            <a
              href={"https://github.com/" + row.full_name}
              target="_blank"
              rel="noreferrer"
            >
              {row.full_name} ↗
            </a>
          </h2>
          <p>{row.summary}</p>
          <small>
            Ownership verified · Submitted{" "}
            {new Date(row.submitted).toISOString().slice(0, 10)}
          </small>
          {row.has_image && (
            <Image
              className="project-cover"
              src={"/api/listing-images/" + row.id + "?v=" + row.revision}
              width={800}
              height={500}
              alt="Submitted project cover"
              unoptimized
            />
          )}
          <form className="profile-form" method="post" action="/api/moderation">
            <input type="hidden" name="id" value={row.id} />
            <input type="hidden" name="revision" value={row.revision} />
            <label>
              Review note
              <textarea name="reason" maxLength={1000} rows={3} />
            </label>
            <div className="account-actions">
              <button className="btn primary" name="action" value="approved">
                Publish
              </button>
              <button className="btn" name="action" value="hidden">
                Hide with feedback
              </button>
            </div>
          </form>
          {row.status === "approved" && (
            <Link href={"/showcase/" + row.full_name}>
              View published page →
            </Link>
          )}
        </article>
      ))}
    </main>
  );
}
