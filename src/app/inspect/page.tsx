import { GithubInspector } from "@/components/github-inspector";
export const metadata = {
  title: "GitHub repository inspector",
  robots: { index: false, follow: false },
};
export default async function Inspect({
  searchParams,
}: {
  searchParams: Promise<{ repo?: string }>;
}) {
  const p = await searchParams;
  return (
    <GithubInspector
      key={typeof p.repo === "string" ? p.repo : ""}
      initialRepository={typeof p.repo === "string" ? p.repo.slice(0, 250) : ""}
    />
  );
}
