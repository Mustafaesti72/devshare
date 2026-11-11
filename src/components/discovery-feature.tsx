"use client";
import { useState } from "react";
import Link from "next/link";
import { projects, collections } from "@/lib/catalog";
import { ProjectVisual } from "./project-visual";
import { Icon } from "./icon";
export function DiscoveryFeature() {
  const [selection, setSelection] = useState(0);
  const featured = [projects[3], projects[2], projects[4]];
  const p = featured[selection];
  return (
    <div className="new-discovery-features">
      <section className="editorial-feature">
        <div className="editorial-feature-copy">
          <span className="editorial-label">
            <i />
            FIELD NOTES / {String(selection + 1).padStart(2, "0")}
          </span>
          <h2>
            {selection === 0 ? (
              <>
                A practical stack
                <br />
                for your next app.
              </>
            ) : selection === 1 ? (
              <>
                Document search
                <br />
                you can inspect.
              </>
            ) : (
              <>
                A closer look
                <br />
                at your workflow.
              </>
            )}
          </h2>
          <p>
            {selection === 0
              ? "A starter, a form library, and a worker for the jobs behind the interface."
              : selection === 1
                ? "Document retrieval and event processing, on infrastructure you control."
                : "A few focused tools for reviewing APIs and building better interfaces."}
          </p>
          <Link
            className="editorial-feature-link"
            href={`/collections/${collections[selection].slug}`}
          >
            Explore this collection
            <Icon name="arrow" size={17} />
          </Link>
          <div
            className="editorial-feature-tabs"
            aria-label="Featured collections"
          >
            {[
              "Application starters",
              "Self-hosted tools",
              "Developer workflow",
            ].map((label, i) => (
              <button
                className={selection === i ? "active" : ""}
                key={label}
                aria-label={label}
                aria-pressed={selection === i}
                onClick={() => setSelection(i)}
              >
                <span>0{i + 1}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="editorial-preview">
          <span className="editorial-preview-label">
            {p.name.toUpperCase()} / SAMPLE INTERFACE
          </span>
          <ProjectVisual project={p} large />
          <div className="editorial-preview-meta">
            <span>{p.language}</span>
            <span>{p.license} example</span>
            <span>{p.topic}</span>
          </div>
        </div>
      </section>
      <Link className="live-inspector-promo" href="/inspect">
        <div>
          <span className="live-service-label">
            <i />
            PUBLIC GITHUB DATA
          </span>
          <Icon name="external" size={16} />
        </div>
        <span className="inspector-promo-mark">
          <Icon name="git" size={35} />
        </span>
        <h2>
          Have a repository <br />
          in mind?
        </h2>
        <p>
          Inspect its language, license, and activity using real GitHub
          metadata.
        </p>
        <span className="inspector-promo-link">
          Open the inspector
          <Icon name="arrow" size={16} />
        </span>
        <span className="inspector-promo-caption">
          READ ONLY · NO TOKEN NEEDED
        </span>
      </Link>
    </div>
  );
}
