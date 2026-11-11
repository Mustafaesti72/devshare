import { notFound } from "next/navigation";
import { topics, topicSlug } from "@/lib/catalog";
import { Discovery } from "@/components/discovery";
export function generateStaticParams() {
  return topics.map((t) => ({ topic: topicSlug(t) }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const p = await params;
  return {
    title: topics.find((t) => topicSlug(t) === p.topic) || "Category",
    robots: { index: false, follow: true },
  };
}
export default async function Topic({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const p = await params;
  const topic = topics.find((t) => topicSlug(t) === p.topic);
  if (!topic) notFound();
  return <Discovery key={topic} mode="category" initialTopic={topic} />;
}
