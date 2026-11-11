import Link from "next/link";
import { PublishForm } from "@/components/publish-form";
export const metadata = { title: "Submit a repository" };
export default function Creators() {
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
      <PublishForm />
    </main>
  );
}
