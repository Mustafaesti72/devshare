import { redirect } from "next/navigation";
import { listings } from "@/lib/submissions.mjs";
export const dynamic = "force-dynamic";
import { Directory } from "@/components/directory";
import { categoryNames } from "@/lib/categories";
export const metadata = {
  title: "Search developer projects",
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
  const group = categoryNames.includes(value("group")) ? value("group") : "All";
  const sort = ["stars", "updated"].includes(value("sort"))
    ? value("sort")
    : "editor";
  return (
    <Directory
      published={await listings("approved")}
      key={JSON.stringify(p)}
      initialQuery={value("q")}
      initialGroup={group}
      initialLanguage={value("lang")}
      initialLicense={value("license")}
      initialSort={sort}
    />
  );
}
