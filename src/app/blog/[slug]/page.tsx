import Link from "next/link";
import { notFound } from "next/navigation";
import articles from "@/lib/articles.json";
import records from "@/lib/directory.json";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}
async function article(p: Props) {
  const { slug } = await p.params;
  const a = articles.find((a) => a.slug === slug);
  if (!a) notFound();
  return a;
}
export async function generateMetadata(p: Props) {
  const a = await article(p);
  return {
    title: a.title,
    description: a.description,
    alternates: { canonical: "/blog/" + a.slug },
    openGraph: {
      title: a.title,
      description: a.description,
      type: "article" as const,
    },
  };
}
export default async function Page(p: Props) {
  const a = await article(p);
  const words = [
    a.title,
    a.description,
    ...a.sections.flatMap((s) => [s.title, s.body]),
  ]
    .join(" ")
    .split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  return (
    <main id="main" className="guide-reader">
      <div className="guide-progress" aria-hidden="true" />
      <Link className="guide-back" href="/blog">
        ← All developer guides
      </Link>
      <article>
        <header className="guide-reader-heading">
          <span className="intro-eyebrow">
            FIELD NOTES / {minutes} MIN READ
          </span>
          <h1>{a.title}</h1>
          <p>{a.description}</p>
        </header>
        <nav className="guide-contents" aria-label="In this guide">
          <span>IN THIS GUIDE</span>
          <ol>
            {a.sections.map((section, index) => (
              <li key={section.title}>
                <a href={"#section-" + (index + 1)}>{section.title}</a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="guide-body">
          {a.sections.map((section, index) => (
            <section key={section.title} id={"section-" + (index + 1)}>
              <span className="guide-section-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </article>
      <aside className="guide-repositories">
        <span className="intro-eyebrow">PUT IT INTO PRACTICE</span>
        <h2>Explore the repositories</h2>
        <ul>
          {a.repositories
            .filter((name) => records.some((repo) => repo.fullName === name))
            .map((name) => (
              <li key={name}>
                <Link href={"/directory/" + name}>
                  {name}
                  <span aria-hidden="true">↗</span>
                </Link>
              </li>
            ))}
        </ul>
      </aside>
      <section className="guide-next">
        <h2>Keep reading</h2>
        {articles
          .filter((other) => other.slug !== a.slug)
          .slice(0, 3)
          .map((other) => (
            <Link key={other.slug} href={"/blog/" + other.slug}>
              {other.title}
              <span aria-hidden="true">→</span>
            </Link>
          ))}
      </section>
      <p className="guide-submit">
        <Link href="/for-developers">Submit your own repository →</Link>
      </p>
    </main>
  );
}
