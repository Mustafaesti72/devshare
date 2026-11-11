"use client";
import Link from "next/link";
import { useState } from "react";
import { ProjectVisual } from "./project-visual";
import { QuickView } from "./quick-view";
import { CollectionPicker } from "./research-actions";
import { type Project, projectPath } from "@/lib/catalog";
import { Icon } from "./icon";
import { useWorkspace } from "./workspace";
export function ProjectMark({
  project,
  large = false,
}: {
  project: Project;
  large?: boolean;
}) {
  return (
    <span
      className={`project-mark ${project.color} ${large ? "large" : ""}`}
      aria-hidden="true"
    >
      {project.mark}
      <i />
    </span>
  );
}
export function ProjectCard({
  project: p,
  list = false,
}: {
  project: Project;
  list?: boolean;
}) {
  const { saved, toggleSave, compared, toggleCompare } = useWorkspace();
  const isSaved = saved.includes(p.id);
  const [quick, setQuick] = useState(false);
  return (
    <article className={`project-card ${list ? "row-card" : ""}`}>
      {!list && (
        <div className="project-card-preview">
          <Link
            href={projectPath(p)}
            aria-label={`Open ${p.name} project preview`}
          >
            <ProjectVisual project={p} />
          </Link>
          <button
            className="quick-view-trigger"
            onClick={() => setQuick(true)}
            aria-label={`Quick view ${p.name}`}
          >
            <Icon name="external" size={13} />
            Quick view
          </button>
        </div>
      )}
      <div className="project-card-top">
        <Link href={projectPath(p)} className="project-identity">
          <ProjectMark project={p} />
          <div>
            <h3>{p.name}</h3>
            <span>{p.owner}</span>
          </div>
        </Link>
        <button
          className={`icon-button save-button ${isSaved ? "selected" : ""}`}
          aria-label={`${isSaved ? "Unsave" : "Save"} ${p.name}`}
          aria-pressed={isSaved}
          onClick={() => toggleSave(p.id)}
        >
          <Icon name="bookmark" size={17} />
        </button>
      </div>
      <Link className="project-description" href={projectPath(p)}>
        <h4>{p.tagline}</h4>
        <p>{p.description}</p>
      </Link>
      <div className="project-tags">
        <Link href={`/explore?topic=${encodeURIComponent(p.topic)}`}>
          {p.topic}
        </Link>
        <span>{p.license}</span>
      </div>
      <div className="card-research-tools">
        <CollectionPicker projectId={p.id} compact />
        <button className="plain-button" onClick={() => setQuick(true)}>
          Quick view
        </button>
      </div>
      <div className="project-card-footer">
        <div>
          <span className={`language-dot lang-${p.language.toLowerCase()}`} />
          <span>{p.language}</span>
        </div>
        <span title="Illustrative GitHub stars">
          <Icon name="star" size={13} />
          {(p.stars / 1000).toFixed(1)}k
        </span>
        <button
          className={`compare-toggle ${compared.includes(p.id) ? "selected" : ""}`}
          aria-pressed={compared.includes(p.id)}
          onClick={() => toggleCompare(p.id)}
        >
          <Icon name={compared.includes(p.id) ? "check" : "plus"} size={13} />
          Compare
        </button>
      </div>
      <QuickView project={p} open={quick} onClose={() => setQuick(false)} />
    </article>
  );
}
