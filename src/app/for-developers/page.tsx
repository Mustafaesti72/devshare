import { parseRepository } from "@/lib/github-input";
import { userProjects } from "@/lib/accounts.mjs";
import { currentUser } from "@/lib/auth";
import Link from "next/link";
import { PublishForm } from "@/components/publish-form";
export const metadata = {
  title: "Submit a repository",
  alternates: { canonical: "/for-developers" },
};
export default async function Creators({
  searchParams,
}: {
  searchParams: Promise<{ repo?: string }>;
}) {
  const user = await currentUser();
  const params = await searchParams;
  const parsed = parseRepository(typeof params.repo === "string" ? params.repo : "");
  const repo = parsed ? parsed.owner + "/" + parsed.repo : "";
  const existing =
    user && repo
      ? (await userProjects(user.github_id)).find(
          (p) => p.full_name.toLowerCase() === repo.toLowerCase(),
        )
      : null;
  return (
    <main id="main" className="directory">
      <header className="dir-title">
        <h1>Submit your repository</h1>
      </header>
      <p>
        Publish a description of your work with a link to the original source.
        Personal GitHub repositories are eligible for editorial review.
      </p>
      <p>
        <Link className="back-link" href="/earnings">
          How maintainers can earn →
        </Link>
      </p>
      {!user && (
        <p>
          <Link href="/login">Sign in with GitHub</Link> to submit your own
          repositories directly, or use Gist verification below.
        </p>
      )}
      <PublishForm
        key={repo}
        signedIn={!!user}
        initialRepo={repo}
        initialSummary={existing?.summary || ""}
      />
    </main>
  );
}
