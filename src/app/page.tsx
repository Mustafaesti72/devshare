import { Directory } from "@/components/directory";
import { listings } from "@/lib/submissions.mjs";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Open source index",
  alternates: { canonical: "/" },
};
export default function Home() {
  return <Directory published={listings("approved")} />;
}
