import Link from "next/link";
import articles from "@/lib/articles.json";
import { Icon } from "@/components/icon";
export const metadata = {
  title: "Developer guides",
  description:
    "Practical guides to evaluating open source, testing, databases and maintaining dependencies.",
  alternates: { canonical: "/blog" },
};
export default function Blog() {
  return (
    <main id="main" className="directory guide-index">
      <header className="guide-index-heading">
        <span className="intro-eyebrow">
          THE FIELD NOTES / {String(articles.length).padStart(2, "0")} GUIDES
        </span>
        <h1>
          Read before
          <br />
          <em>you build.</em>
        </h1>
        <p>
          Practical notes on choosing tools, testing what matters, and keeping
          dependencies manageable.
        </p>
      </header>
      <div className="guide-cards">
        {articles.map((article, index) => (
          <Link
            className="guide-card"
            href={"/blog/" + article.slug}
            key={article.slug}
          >
            <span className="guide-card-number">
              {String(index + 1).padStart(2, "0")}
              <Icon name="arrow" size={20} />
            </span>
            <h2>{article.title}</h2>
            <p>{article.description}</p>
            <span className="guide-card-footer">
              {article.sections.length} sections<span>Read guide ↗</span>
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
