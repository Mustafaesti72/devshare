"use client";
import Link from "next/link";
import { ProjectVisual } from "./project-visual";
import { ResearchEditor, CollectionPicker } from "./research-actions";
import { useState } from "react";
import { type Project, projects } from "@/lib/catalog";
import { useWorkspace } from "./workspace";
import { Icon } from "./icon";
import { ProjectCard } from "./project-card";
export function ProjectDetail({ project: p }: { project: Project }) {
  const { saved, toggleSave, compared, toggleCompare, notify } = useWorkspace();
  const [tab, setTab] = useState("overview");
  const [report, setReport] = useState(false);
  const [reason, setReason] = useState("Incorrect license");
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify("Project link copied.");
    } catch {
      notify("Clipboard unavailable. Copy the address from your browser.");
    }
  }
  return (
    <main id="main" className="inner-page project-detail">
      <Link href="/explore" className="back-link">
        <Icon name="arrow" size={14} style={{ transform: "rotate(180deg)" }} />{" "}
        All projects
      </Link>
      <header className="sample-cover">
        <div>
          <Link href={`/developers/${p.owner}`}>{p.owner}</Link>
          <h1>{p.name}</h1>
          <p>{p.tagline}</p>
          <div className="sample-cover-actions">
            <button className="btn" onClick={() => toggleSave(p.id)}>
              <Icon name="bookmark" size={15} />
              {saved.includes(p.id) ? "Saved" : "Save project"}
            </button>
            <CollectionPicker projectId={p.id} />
            <button
              className="btn"
              onClick={copy}
              aria-label="Copy project link"
            >
              <Icon name="copy" size={15} />
            </button>
          </div>
        </div>
        <ProjectVisual project={p} large />
      </header>
      <div className="detail-stats">
        <span>
          <Icon name="star" size={15} />
          <b>{p.stars.toLocaleString("en-US")}</b> sample stars
        </span>
        <span>
          <span className={`language-dot lang-${p.language.toLowerCase()}`} />
          {p.language}
        </span>
        <span>
          <Icon name="shield" size={15} />
          {p.license}
        </span>
        <span>
          <Icon name="clock" size={15} />
          Sample update: {p.updated}
        </span>
      </div>
      <div className="detail-layout">
        <section>
          <div className="detail-tabs" aria-label="Project sections">
            {["overview", "structure", "notes"].map((t) => (
              <button
                className={tab === t ? "active" : ""}
                aria-pressed={tab === t}
                onClick={() => setTab(t)}
                key={t}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="readme-panel">
            {tab === "overview" ? (
              <>
                <span className="document-label">
                  <Icon name="code" size={15} /> README.md{" "}
                  <span>PRODUCT PREVIEW</span>
                </span>
                <h2>Project overview</h2>
                <p className="readme-lead">{p.description}</p>
                <h3>What’s included</h3>
                <ul className="feature-list">
                  {p.features.map((f) => (
                    <li key={f}>
                      <Icon name="check" size={16} />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="sample-origin">
                  This sample illustrates a creator listing.{" "}
                  <Link href="/">Explore real repositories</Link>
                </p>
              </>
            ) : tab === "structure" ? (
              <>
                <span className="document-label">
                  <Icon name="folder" size={15} /> Repository structure
                </span>
                <h2>A quick look inside</h2>
                <p>Illustrative file layout for this sample project.</p>
                <div className="file-tree">
                  {p.files.map((f) => (
                    <div key={f}>
                      <Icon
                        name={f.endsWith("/") ? "folder" : "code"}
                        size={16}
                      />
                      <code>{f}</code>
                      <span>sample</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <span className="document-label">
                  <Icon name="shield" size={15} /> Listing notes
                </span>
                <h2>About this example</h2>
                <p>
                  {p.name} is fictional. The maintainer, license, stars, update
                  date, files, and installation command are sample content.
                </p>
                <h3>Ownership and source</h3>
                <p>
                  Real publishing will require a connected GitHub account and
                  verified repository ownership. This listing has no source
                  repository or verified creator.
                </p>
              </>
            )}
          </div>
        </section>
        <aside className="project-sidebar">
          <div className="detail-side-card">
            <h3>Project information</h3>
            <dl>
              <div>
                <dt>Category</dt>
                <dd>{p.topic}</dd>
              </div>
              <div>
                <dt>License example</dt>
                <dd>{p.license}</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>Fictional fixture</dd>
              </div>
              <div>
                <dt>Listing status</dt>
                <dd>
                  <span className="status-dot" /> Demo
                </dd>
              </div>
            </dl>
            <button className="btn full" onClick={() => toggleCompare(p.id)}>
              <Icon name="compare" size={16} />
              {compared.includes(p.id)
                ? "Remove from comparison"
                : "Add to comparison"}
            </button>
          </div>
          <Link
            className="creator-profile-card"
            href={`/developers/${p.owner}`}
          >
            <span className={`creator-avatar ${p.color}`}>
              {p.owner[0].toUpperCase()}
            </span>
            <span>
              <b>{p.owner}</b>
              <small>Sample maintainer profile</small>
            </span>
            <Icon name="chevron" size={14} />
          </Link>
          <button className="report-link" onClick={() => setReport(!report)}>
            Report a listing issue
          </button>
          {report && (
            <form
              className="report-form"
              onSubmit={(e) => {
                e.preventDefault();
                notify(
                  "Demo report completed. Nothing was sent to moderation.",
                );
                setReport(false);
              }}
            >
              <label htmlFor="report-reason">Issue type</label>
              <select
                id="report-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option>Incorrect license</option>
                <option>Ownership concern</option>
                <option>Unsafe content</option>
                <option>Other</option>
              </select>
              <p>Preview form. Reports are not submitted.</p>
              <button className="btn small" type="submit">
                Test report flow
              </button>
            </form>
          )}
        </aside>
      </div>
      <ResearchEditor projectId={p.id} />
      <section className="related-section">
        <div className="catalog-heading">
          <h2>Keep exploring</h2>
          <Link href="/explore">
            All projects <Icon name="arrow" size={14} />
          </Link>
        </div>
        <div className="projects-grid three-col">
          {projects
            .filter((x) => x.id !== p.id)
            .slice(0, 3)
            .map((x) => (
              <ProjectCard key={x.id} project={x} />
            ))}
        </div>
      </section>
    </main>
  );
}
