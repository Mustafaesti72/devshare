import { currentUser } from "@/lib/auth";
import Link from "next/link";
import { PublishForm } from "@/components/publish-form";
export const metadata = { title: "Submit a repository" };
export default async function Creators() {
  const user = await currentUser();
  return (
    <main id="main" className="directory">
      <header className="dir-title">
        <h1>Submit your repository</h1>
      </header>
      <p>
        Publish a description of your work with a link to the original source.
        Personal GitHub repositories are eligible for editorial review.
      </p>
      <p><Link className="back-link" href="/earnings">How maintainers can earn →</Link></p>
      {!user && <p><Link href="/login">Sign in with GitHub</Link> to submit your own repositories directly, or use Gist verification below.</p>}
      <PublishForm signedIn={!!user} />
    </main>
  );
}
