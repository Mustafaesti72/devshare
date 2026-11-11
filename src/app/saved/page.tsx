import { ResearchLibrary } from "@/components/research-library";
export const metadata = {
  title: "Research library",
  robots: { index: false, follow: false },
};
export default function Saved() {
  return <ResearchLibrary />;
}
