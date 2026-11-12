import Link from "next/link";
import { Directory } from "@/components/directory";
import { listings } from "@/lib/submissions.mjs";
import { indexable } from "@/lib/site";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Maintainer launches",
  description:
    "Discover reviewed developer projects submitted by verified GitHub repository owners, ordered by first publication on DevShare.",
  robots: { index: indexable, follow: true },
  alternates: {
    canonical: "/launches",
    types: { "application/rss+xml": "/feed.xml" },
  },
};
export default async function Launches() {
  return (
    <>
      <Directory
        published={await listings("approved")}
        initialSource="community"
        initialSort="newest"
        intro="Projects submitted by verified maintainers and reviewed before publication. Ordered by first publication, independent of GitHub stars."
      />
      <section className="launch-explainer">
        <h2>Put your project in front of other developers</h2>
        <p>
          Submit a public repository you own. After ownership verification and
          editorial review, it appears here with its original publication date.
        </p>
        <div className="account-actions">
          <Link className="btn primary" href="/for-developers">
            Submit a repository
          </Link>
          <Link className="btn" href="/feed.xml">
            Follow the RSS feed
          </Link>
        </div>
      </section>
    </>
  );
}
