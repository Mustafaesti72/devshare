import { redirect } from "next/navigation";
import { Discovery } from "@/components/discovery";
import { topics } from "@/lib/catalog";
export const metadata = {
  title: "Explore projects",
  robots: { index: false, follow: true },
  alternates: { canonical: "/explore" },
};
export default async function Explore({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const p = await searchParams;
  if (!Object.keys(p).length) redirect("/");
  const value = (key: string) =>
    typeof p[key] === "string" ? (p[key] as string).slice(0, 200) : "";
  const q = value("q");
  const topic = topics.includes(value("topic") as (typeof topics)[number])
    ? value("topic")
    : "";
  const language = ["TypeScript", "Python", "Go", "Rust"].includes(
    value("lang"),
  )
    ? value("lang")
    : "";
  const license = ["MIT", "Apache-2.0"].includes(value("license"))
    ? value("license")
    : "";
  const sort = ["featured", "newest", "stars"].includes(value("sort"))
    ? value("sort")
    : "featured";
  const layout = value("view") === "list" ? "list" : "grid";
  return (
    <Discovery
      key={`${q}:${topic}:${language}:${license}:${sort}:${layout}`}
      initialQuery={q}
      initialTopic={topic}
      initialLanguage={language}
      initialLicense={license}
      initialSort={sort}
      initialLayout={layout}
    />
  );
}
