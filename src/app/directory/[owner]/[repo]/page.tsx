import records from "@/lib/directory.json";
import { notFound } from "next/navigation";
import { SourceBrief } from "@/components/directory";
type Props = { params: Promise<{ owner: string; repo: string }> };
export function generateStaticParams() {
  return records.map((p) => ({ owner: p.owner, repo: p.name }));
}
async function find(props: Props) {
  const { owner, repo } = await props.params;
  const p = records.find((p) => p.owner === owner && p.name === repo);
  if (!p) notFound();
  return p;
}
export async function generateMetadata(props: Props) {
  const p = await find(props);
  return { title: p.fullName, description: p.description, alternates: {canonical: "/directory/" + p.fullName} };
}
export default async function Page(props: Props) {
  return <SourceBrief p={await find(props)} />;
}
