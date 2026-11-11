import { listings } from "@/lib/submissions.mjs";
export const dynamic = "force-dynamic";
import { Directory } from "@/components/directory";
import { indexable } from "@/lib/site";
export const metadata = {
  title: "Most-starred developer tools",
  description:
    "Compare real open source developer tools by their recorded GitHub star counts.",
  robots: { index: indexable, follow: true },
  alternates: { canonical: "/trending" },
};
export default async function Trending() {
  return (
    <Directory
      published={await listings("approved")}
      initialSort="stars"
      heading="Most-starred tools"
      intro="Ordered by recorded GitHub stars. Counts are repository snapshots, not a live platform ranking."
    />
  );
}
