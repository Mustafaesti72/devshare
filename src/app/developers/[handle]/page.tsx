import { FollowCreator } from "@/components/research-actions";
import { notFound } from "next/navigation";
import { projects } from "@/lib/catalog";
import { ProjectCard } from "@/components/project-card";
import { Icon } from "@/components/icon";
export function generateStaticParams() {
  return [...new Set(projects.map((p) => p.owner))].map((handle) => ({
    handle,
  }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  return { title: (await params).handle };
}
export default async function Creator({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const list = projects.filter((p) => p.owner === handle);
  if (!list.length) notFound();
  return (
    <main id="main" className="inner-page">
      <div className="profile-cover">
        <div className="profile-cover-grid" />
        <span>SAMPLE MAINTAINER</span>
      </div>
      <div className="creator-heading">
        <span className={`creator-avatar extra-large ${list[0].color}`}>
          {handle[0].toUpperCase()}
        </span>
        <div>
          <div className="section-kicker">CREATOR PROFILE · DEMO</div>
          <h1>{handle}</h1>
          <p>A sample maintainer in the product preview.</p>
        </div>
      </div>
      <FollowCreator handle={handle} />
      <div className="profile-metadata">
        <span>
          <Icon name="code" size={16} />
          {list.length} sample projects
        </span>
        <span>
          <Icon name="shield" size={16} />
          Ownership not verified
        </span>
      </div>
      <div className="catalog-heading">
        <h2>Projects</h2>
        <span className="quiet">ILLUSTRATIVE LISTINGS</span>
      </div>
      <div className="projects-grid three-col">
        {list.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </main>
  );
}
