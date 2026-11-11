import Link from "next/link";
import { Icon } from "@/components/icon";
export default function NotFound() {
  return (
    <main id="main" className="inner-page">
      <div className="section-kicker">404 · PAGE NOT FOUND</div>
      <h1>This page isn’t here.</h1>
      <p className="page-intro">
        The link may have changed, or this project is no longer listed.
      </p>
      <Link href="/explore" className="btn primary">
        Back to discovery <Icon name="arrow" size={15} />
      </Link>
    </main>
  );
}
