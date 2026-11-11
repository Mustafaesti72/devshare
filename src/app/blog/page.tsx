import Link from "next/link";
import articles from "@/lib/articles.json";
export const metadata = { title: "Developer guides", description: "Practical guides to evaluating open source, testing, databases and maintaining dependencies.", alternates: { canonical: "/blog" } };
export default function Blog(){return <main id="main" className="directory"><header className="dir-title"><h1>Developer guides</h1></header><p>Make a better shortlist. Understand the work behind a dependency.</p><div className="brief-grid">{articles.map(a=><article key={a.slug}><h2><Link href={"/blog/"+a.slug}>{a.title}</Link></h2><p>{a.description}</p><Link href={"/blog/"+a.slug}>Read guide →</Link></article>)}</div></main>}
