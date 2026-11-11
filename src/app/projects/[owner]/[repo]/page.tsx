import { notFound } from "next/navigation";
import { projects } from "@/lib/catalog";
import { ProjectDetail } from "@/components/project-detail";
export function generateStaticParams() {
  return projects.map((p) => ({ owner: p.owner, repo: p.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const x = await params;
  const p = projects.find((p) => p.id === x.repo && p.owner === x.owner);
  return {
    title: p ? `${p.name} · ${p.tagline}` : "Project not found",
    description: p?.description,
    robots: { index: false, follow: true },
  };
}
export default async function Project({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const x = await params;
  const p = projects.find((p) => p.id === x.repo && p.owner === x.owner);
  if (!p) notFound();
  return <ProjectDetail project={p} />;
}
