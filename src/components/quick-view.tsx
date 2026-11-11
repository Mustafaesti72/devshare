"use client";
import Link from "next/link";
import { type Project, projectPath } from "@/lib/catalog";
import { Modal } from "./modal";
import { Icon } from "./icon";
import { ProjectVisual } from "./project-visual";
import { useWorkspace } from "./workspace";
import { CollectionPicker } from "./research-actions";
export function QuickView({
  project: p,
  open,
  onClose,
}: {
  project: Project;
  open: boolean;
  onClose: () => void;
}) {
  const { saved, toggleSave } = useWorkspace();
  return (
    <Modal open={open} onClose={onClose} title={p.name} wide>
      <div className="quick-view-layout">
        <ProjectVisual project={p} large />
        <div className="quick-view-copy">
          <span className="tiny-badge">SAMPLE PROJECT</span>
          <h3>{p.tagline}</h3>
          <p>{p.description}</p>
          <div className="quick-facts">
            <span>{p.language}</span>
            <span>{p.license}</span>
            <span>{p.topic}</span>
          </div>
          <ul>
            {p.features.map((f) => (
              <li key={f}>
                <Icon name="check" size={15} />
                {f}
              </li>
            ))}
          </ul>
          <div className="quick-view-actions">
            <button className="btn" onClick={() => toggleSave(p.id)}>
              <Icon name="bookmark" size={15} />
              {saved.includes(p.id) ? "Saved" : "Save"}
            </button>
            <CollectionPicker projectId={p.id} />
          </div>
          <Link
            href={projectPath(p)}
            className="btn primary full"
            onClick={onClose}
          >
            Open project <Icon name="arrow" size={15} />
          </Link>
        </div>
      </div>
    </Modal>
  );
}
