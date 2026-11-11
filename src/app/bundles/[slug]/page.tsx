import Link from "next/link";
import { notFound } from "next/navigation";
import bundles from "@/lib/bundles.json";
import records from "@/lib/directory.json";
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return bundles.map((b) => ({ slug: b.slug }));
}
async function find({ params }: Props) {
  const { slug } = await params;
  const b = bundles.find((b) => b.slug === slug);
  if (!b) notFound();
  return b;
}
export async function generateMetadata(p: Props) {
  const b = await find(p);
  return {
    title: b.name,
    description: b.description,
    alternates: { canonical: "/bundles/" + b.slug },
  };
}
export default async function Bundle(p: Props) {
  const b = await find(p);
  return (
    <main id="main" className="directory account-page">
      <Link href="/collections">← Collections</Link>
      <h1>{b.name}</h1>
      <p>{b.description}</p>
      {b.repos.map((name) => {
        const repo = records.find((r) => r.fullName === name);
        return (
          repo && (
            <article className="moderation-card" key={name}>
              <h2>
                <Link href={"/directory/" + repo.fullName}>
                  {repo.fullName}
                </Link>
              </h2>
              <p>{repo.description}</p>
              <small>
                {repo.language} · {repo.license || "Review repository license"}
              </small>
            </article>
          )
        );
      })}
    </main>
  );
}
