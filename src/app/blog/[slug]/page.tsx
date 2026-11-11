import Link from "next/link";
import { notFound } from "next/navigation";
import articles from "@/lib/articles.json";
import records from "@/lib/directory.json";
type Props = { params: Promise<{slug:string}> };
export function generateStaticParams(){return articles.map(a=>({slug:a.slug}))}
async function article(p:Props){const {slug}=await p.params;const a=articles.find(a=>a.slug===slug);if(!a)notFound();return a}
export async function generateMetadata(p:Props){const a=await article(p);return {title:a.title,description:a.description,alternates:{canonical:"/blog/"+a.slug},openGraph:{title:a.title,description:a.description,type:"article" as const}}}
export default async function Page(p:Props){const a=await article(p);return <main id="main" className="directory" style={{maxWidth:780}}><Link href="/blog">← Developer guides</Link><article><header className="dir-title"><h1>{a.title}</h1></header><p>{a.description}</p>{a.sections.map(s=><section key={s.title} style={{marginBlock:32,lineHeight:1.8}}><h2>{s.title}</h2><p>{s.body}</p></section>)}</article><aside><h2>Explore the repositories</h2><ul>{a.repositories.filter(n=>records.some(r=>r.fullName===n)).map(n=><li key={n}><Link href={"/directory/"+n}>{n}</Link></li>)}</ul></aside><section><h2>Keep reading</h2>{articles.filter(b=>b.slug!==a.slug).slice(0,3).map(b=><p key={b.slug}><Link href={"/blog/"+b.slug}>{b.title}</Link></p>)}</section><p><Link href="/for-developers">Submit your own repository →</Link></p></main>}
