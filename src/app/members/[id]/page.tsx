import { indexable } from "@/lib/site";
import { FollowCreator } from "@/components/research-actions";
import { currentUser } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publicProfile, userProjects } from "@/lib/accounts.mjs";
type Props = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const user = process.env.DATABASE_URL ? await publicProfile(id) : null;
  if (!user) return { title: "Member not found", robots: { index: false } };
  const projects = await userProjects(user.github_id, true);
  return {
    title: user.display_name + "’s profile",
    description: user.bio || "Developer on DevShare",
    alternates: { canonical: "/members/" + user.id },
    robots: { index: indexable && projects.length > 0, follow: true },
  };
}
export default async function Member({ params }: Props) {
  const { id } = await params;
  const user = process.env.DATABASE_URL ? await publicProfile(id) : null;
  if (!user) notFound();
  const projects = await userProjects(user.github_id, true);
  const viewer = await currentUser();
  return (
    <main id="main" className="directory account-page">
      <Link href="/">← Discover projects</Link>
      <header className="member-head">
        <Image
          className="member-initial"
          src={user.avatar_url}
          alt=""
          width={76}
          height={76}
        />
        <div>
          <h1>{user.display_name}</h1>
          <a href={"https://github.com/" + user.github_login}>
            @{user.github_login} on GitHub ↗
          </a>
        </div>
      </header>
      <div className="account-actions">
        {viewer?.id !== user.id && (
          <FollowCreator handle={"member:" + user.id} />
        )}
        <Link href={"/report?profile=" + user.id}>Report profile</Link>
      </div>
      {user.bio && <p className="member-bio">{user.bio}</p>}
      {user.website && (
        <p>
          <a href={user.website} rel="nofollow ugc noreferrer" target="_blank">
            {new URL(user.website).hostname} ↗
          </a>
        </p>
      )}
      <section>
        <h2>Published repositories</h2>
        {projects.length ? (
          projects.map((p) => (
            <article className="account-projects" key={p.id}>
              <h3>
                <Link href={"/showcase/" + p.full_name}>{p.full_name}</Link>
              </h3>
              <p>{p.summary}</p>
            </article>
          ))
        ) : (
          <p>This maintainer has no published repositories yet.</p>
        )}
      </section>
    </main>
  );
}
