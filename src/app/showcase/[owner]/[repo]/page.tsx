import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publishedProject } from "@/lib/publishing.mjs";
import { siteUrl, indexable } from "@/lib/site";
type Props = { params: Promise<{ owner: string; repo: string }> };
async function find({ params }: Props) {
  const { owner, repo } = await params;
  const row = await publishedProject(owner + "/" + repo);
  if (!row) notFound();
  return row;
}
export async function generateMetadata(props: Props) {
  const row = await find(props);
  return {
    title: row.full_name,
    description: row.summary.slice(0, 160),
    alternates: { canonical: "/showcase/" + row.full_name },
    robots: { index: indexable, follow: true },
  };
}
export default async function Showcase(props: Props) {
  const row = await find(props);
  const structured = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: row.full_name,
    description: row.summary,
    codeRepository: "https://github.com/" + row.full_name,
    url: new URL("/showcase/" + row.full_name, siteUrl).href,
  };
  return (
    <main id="main" className="directory account-page">
      <Link href="/">← All projects</Link>
      <header className="dir-title">
        <h1>{row.full_name}</h1>
      </header>
      <p className="member-bio">{row.summary}</p>
      <div className="account-actions">
        <a
          className="btn primary"
          href={"https://github.com/" + row.full_name}
          target="_blank"
          rel="noreferrer"
        >
          View repository ↗
        </a>
        <Link
          className="btn"
          href={"/inspect?repo=" + encodeURIComponent(row.full_name)}
        >
          Inspect and save
        </Link>
      </div>
      {row.has_image && (
        <Image
          className="project-cover"
          src={"/api/listing-images/" + row.id + "?v=" + row.revision}
          width={1200}
          height={750}
          alt={row.full_name + " project cover"}
          unoptimized
        />
      )}
      <section className="account-security">
        <h2>From the maintainer</h2>
        <p>Repository ownership was confirmed before editorial review.</p>
        {row.creator_id && (
          <Link href={"/members/" + row.creator_id}>
            {row.creator_name}’s profile →
          </Link>
        )}
        <p>
          Review the repository’s README and license before using its source.
        </p>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structured).replace(/</g, "\\u003c"),
        }}
      />
    </main>
  );
}
