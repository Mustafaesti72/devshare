import { redirect } from "next/navigation";
import { listings } from "@/lib/submissions.mjs";
import { Directory } from "@/components/directory";
import { discoveryFilters } from "@/lib/discovery";
export const dynamic = "force-dynamic";
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
  const params = await searchParams;
  if (!Object.keys(params).length) redirect("/");
  const f = discoveryFilters(params);
  return (
    <Directory
      key={JSON.stringify(f)}
      published={await listings("approved")}
      initialQuery={f.q}
      initialGroup={f.group}
      initialLanguage={f.language}
      initialLicense={f.license}
      initialSort={f.sort}
      initialSource={f.source}
    />
  );
}
