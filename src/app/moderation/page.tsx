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
  const status = ["pending", "approved", "hidden"].includes(params.status || "")
    ? params.status!
    : "pending";
  const reviews = await pendingReviews(status);
  return (
    <main id="main" className="directory account-page">
      <Link href="/dashboard">← Your dashboard</Link>
      <h1>Review submissions</h1>
      <nav className="account-nav">
        {["pending", "approved", "hidden"].map((s) => (
          <Link
            key={s}
            href={"/moderation?status=" + s}
            aria-current={s === status ? "page" : undefined}
          >
            {s === "pending"
              ? "In review"
              : s === "approved"
                ? "Published"
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
      {!reviews.length && <p>No submissions in this queue.</p>}
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
