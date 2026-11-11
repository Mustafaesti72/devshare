"use client";
import { useState } from "react";
import Link from "next/link";
import { type PublicRepository } from "@/lib/github-input";
import { useResearch } from "@/lib/research";
import { sourceKey, useSourceReferences } from "@/lib/source-references";
import { Icon } from "./icon";
import { CollectionPicker, ResearchEditor } from "./research-actions";
import { Modal } from "./modal";
export function SourceReferenceCard({
  repository: p,
}: {
  repository: PublicRepository;
}) {
  const [edit, setEdit] = useState(false);
  const { notes, removeProject } = useResearch();
  const { removeReference } = useSourceReferences();
  const [removing, setRemoving] = useState(false);
  const key = sourceKey(p);
  const note = notes[key];
  return (
    <article className="source-research-card">
      <div className="source-research-card-head">
        <span className="source-reference-mark">
          <Icon name="git" size={20} />
        </span>
        <div>
          <span className="live-data-badge">REAL GITHUB SOURCE</span>
          <h3>{p.fullName}</h3>
        </div>
        <span className={`decision-label ${note?.status || "considering"}`}>
          {(note?.status || "considering").replace("using", "Using this")}
        </span>
      </div>
      <p>
        {p.description || "No description provided by the source repository."}
      </p>
      <div className="source-research-facts">
        <span>{p.language || "Language not reported"}</span>
        <span>{p.license || "License not identified"}</span>
        <span>
          <Icon name="star" size={12} />
          {typeof p.stars === "number"
            ? p.stars.toLocaleString("en-US")
            : "Not reported"}
        </span>
      </div>
      {note?.text && <blockquote>{note.text}</blockquote>}
      <div className="source-research-actions">
        <button className="btn small" onClick={() => setEdit(true)}>
          <Icon name="code" size={14} />
          {note?.text ? "Edit note" : "Add note"}
        </button>
        <CollectionPicker projectId={key} />
        <button className="plain-button" onClick={() => setRemoving(true)}>
          Remove from library
        </button>
        <Link
          className="plain-button"
          href={`/inspect?repo=${encodeURIComponent(p.fullName)}`}
        >
          Inspect again
          <Icon name="arrow" size={14} />
        </Link>
        <a
          className="icon-button"
          aria-label={`Open ${p.fullName} on GitHub`}
          href={p.sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          <Icon name="external" size={15} />
        </a>
      </div>
      <span className="source-snapshot-note">
        Metadata snapshot ·{" "}
        {new Date(p.fetchedAt).toLocaleDateString("en-GB", { timeZone: "UTC" })}{" "}
        · Ownership not verified
      </span>
      <Modal
        open={removing}
        onClose={() => setRemoving(false)}
        title={"Remove " + p.fullName + "?"}
      >
        <p>
          This removes the project, its notes and its collection entries from
          your private library.
        </p>
        <div className="account-actions">
          <button className="btn" onClick={() => setRemoving(false)}>
            Cancel
          </button>
          <button
            className="btn primary"
            onClick={() => {
              removeProject(key);
              removeReference(p.id);
              setRemoving(false);
            }}
          >
            Remove project
          </button>
        </div>
      </Modal>
      <Modal
        open={edit}
        onClose={() => setEdit(false)}
        title={`Research · ${p.fullName}`}
      >
        <ResearchEditor key={key} projectId={key} />
      </Modal>
    </article>
  );
}
