import { notFound } from "next/navigation";
import { listings } from "@/lib/submissions.mjs";
export const dynamic = "force-dynamic";
import { Directory } from "@/components/directory";
import { categories } from "@/lib/categories";
import { indexable } from "@/lib/site";
type Props = { params: Promise<{ topic: string }> };
export function generateStaticParams() {
  return categories.map((c) => ({ topic: c.slug }));
}
export async function generateMetadata({ params }: Props) {
  const { topic } = await params;
  const c = categories.find((c) => c.slug === topic);
  if (!c) notFound();
  return {
    title: c.name + " developer tools",
    description: c.description,
    robots: { index: indexable, follow: true },
    alternates: { canonical: "/topics/" + c.slug },
  };
}
export default async function Topic({ params }: Props) {
  const { topic } = await params;
  const c = categories.find((c) => c.slug === topic);
  if (!c) notFound();
  return (
    <Directory
      published={await listings("approved")}
      initialGroup={c.name}
      heading={c.name + " tools"}
      intro={c.description}
    />
  );
}
