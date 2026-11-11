import { siteUrl } from "@/lib/site";
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
  return {
    title: p.fullName,
    description: p.description,
    openGraph: { title: p.fullName, description: p.description },
    alternates: { canonical: "/directory/" + p.fullName },
  };
}
export default async function Page(props: Props) {
  const p = await find(props);
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: p.fullName,
    description: p.description,
    codeRepository: p.sourceUrl,
    programmingLanguage: p.language || undefined,
    url: new URL("/directory/" + p.fullName, siteUrl).href,
  };
  return (
    <>
      <SourceBrief p={p} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
