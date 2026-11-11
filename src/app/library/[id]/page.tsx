import { PersonalCollectionPage } from "@/components/research-library";
export const metadata = {
  title: "Personal collection",
  robots: { index: false, follow: false },
};
export default async function Library({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PersonalCollectionPage id={id} />;
}
