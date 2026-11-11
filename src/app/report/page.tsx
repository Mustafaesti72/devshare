import Link from "next/link";
import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { publicProfile } from "@/lib/accounts.mjs";
import { publishedProject } from "@/lib/publishing.mjs";
import records from "@/lib/directory.json";
import { ReportForm } from "@/components/report-form";
export const metadata = {
  title: "Report a concern",
  robots: { index: false, follow: false },
};
export default async function Report({
  searchParams,
}: {
  searchParams: Promise<{ repo?: string; profile?: string }>;
}) {
  const params = await searchParams;
  const profile =
    process.env.DATABASE_URL && typeof params.profile === "string"
      ? await publicProfile(params.profile)
      : null;
  const name = typeof params.repo === "string" ? params.repo : "";
  const project = name ? await publishedProject(name) : null;
  const source = records.find(
    (repo) => repo.fullName.toLowerCase() === name.toLowerCase(),
  );
  if (!profile && !project && !source) notFound();
  const type = profile ? "profile" : "project",
    target = profile?.id || project?.full_name || source!.fullName;
  const user = await currentUser();
  return (
    <main id="main" className="directory account-page">
      <Link href="/">← Discover projects</Link>
      <h1>Report a concern</h1>
      <p>{profile ? profile.display_name : target}</p>
      {user ? (
        <ReportForm type={type} target={target} />
      ) : (
        <p>
          <Link href="/login">Sign in with GitHub</Link> to send a report for
          review.
        </p>
      )}
    </main>
  );
}
