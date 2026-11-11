import { notFound } from "next/navigation";
import Link from "next/link";
import { collections, projects } from "@/lib/catalog";
import { ProjectCard } from "@/components/project-card";
import { Icon } from "@/components/icon";
export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: collections.find((c) => c.slug === slug)?.name || "Collection",
  };
}
export default async function Collection({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = collections.find((c) => c.slug === slug);
  if (!c) notFound();
  return (
    <main id="main" className="inner-page">
      <Link className="back-link" href="/collections">
        <Icon name="arrow" size={14} style={{ transform: "rotate(180deg)" }} />{" "}
        All collections
      </Link>
      <div className="section-kicker">{c.label}</div>
      <h1>{c.name}</h1>
      <p className="page-intro">{c.description}</p>
      <div className="collection-meta">
        <span className="tiny-badge">DEMO</span>
        <span>{c.ids.length} sample projects</span>
        <span>Public collection</span>
      </div>
      <div className="projects-grid three-col">
        {c.ids.map((id) => (
          <ProjectCard key={id} project={projects.find((p) => p.id === id)!} />
        ))}
      </div>
    </main>
  );
}
