import Link from "next/link";
import { Icon } from "./icon";

export function DiscoveryIntro({ total }: { total: number }) {
  return (
    <section
      className="discovery-intro"
      aria-labelledby="discovery-intro-title"
    >
      <div className="intro-copy">
        <span className="intro-eyebrow">
          <span aria-hidden="true">↳</span> THE DEVELOPER’S FIELD GUIDE
        </span>
        <h1 id="discovery-intro-title">
          <span>Good tools.</span>
          <span>
            Better <em>building.</em>
          </span>
        </h1>
        <p>
          Find open source worth your time. Look under the hood, compare your
          options, and keep a shortlist.
        </p>
        <div className="intro-actions">
          <a href="#repositories">
            Explore the index <Icon name="arrow" size={16} />
          </a>
          <Link href="/for-developers">
            Share your project <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="intro-caption">
          <span>{total} public repositories</span>
          <span>Independent picks. Real source code.</span>
        </div>
      </div>
      <Link
        className="intro-spotlight"
        href="/directory/duckdb/duckdb"
        aria-label="Explore DuckDB, our project spotlight"
      >
        <div className="spotlight-label">
          <span>PROJECT SPOTLIGHT</span>
          <span>01 / DATA</span>
        </div>
        <div className="query-art" aria-hidden="true">
          <div className="query-orbit query-orbit-outer" />
          <div className="query-orbit query-orbit-inner" />
          <span className="query-file query-file-one">.csv</span>
          <span className="query-file query-file-two">.parquet</span>
          <div className="query-stack">
            <div className="query-layer query-layer-bottom" />
            <div className="query-layer query-layer-middle" />
            <div className="query-layer query-layer-top">
              <span>SQL</span>
              <i />
              <i />
              <i />
            </div>
          </div>
          <span className="query-output">
            <Icon name="check" size={13} /> answers
          </span>
          <span className="query-coordinate">LOCAL FILES · ONE QUERY</span>
        </div>
        <div className="spotlight-copy">
          <div>
            <h2>DuckDB</h2>
            <span>SQL, right where your data lives.</span>
          </div>
          <span className="spotlight-arrow" aria-hidden="true">
            <Icon name="arrow" size={21} />
          </span>
        </div>
        <div className="spotlight-meta">
          <span>Embedded analytics</span>
          <span>C++ / MIT</span>
        </div>
      </Link>
    </section>
  );
}
