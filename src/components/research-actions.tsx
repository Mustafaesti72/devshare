"use client";
import { useState } from "react";
import { useResearch, type ResearchStatus } from "@/lib/research";
import { useWorkspace } from "./workspace";
import { Modal } from "./modal";
import { Icon } from "./icon";
export function CollectionPicker({
  projectId,
  compact = false,
}: {
  projectId: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { collections, toggleItem, createCollection } = useResearch();
  const { notify } = useWorkspace();
  const active = collections.filter((c) => !c.archived);
  return (
    <>
      <button
        className={compact ? "icon-button" : "btn"}
        aria-label="Add to collection"
        onClick={() => setOpen(true)}
      >
        <Icon name="folder" size={compact ? 16 : 15} />
        {!compact && "Add to collection"}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Organize this project"
      >
        <p className="modal-intro">Choose one or more collections.</p>
        <div className="collection-pick-list">
          {active.map((c) => (
            <button
              className={c.projectIds.includes(projectId) ? "selected" : ""}
              aria-pressed={c.projectIds.includes(projectId)}
              onClick={() => toggleItem(c.id, projectId)}
              key={c.id}
            >
              <span className={`folder-chip ${c.color}`}>
                <Icon name="folder" />
              </span>
              <span>
                <b>{c.name}</b>
                <small>{c.projectIds.length} projects</small>
              </span>
              <span className="pick-check">
                {c.projectIds.includes(projectId) && (
                  <Icon name="check" size={15} />
                )}
              </span>
            </button>
          ))}
          {!active.length && (
            <p className="subtle-note">Create your first collection below.</p>
          )}
        </div>
        <form
          className="inline-create-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            createCollection(name, "", "teal", [projectId]);
            setName("");
            notify("Collection created with this project.");
          }}
        >
          <label className="sr-only" htmlFor={`new-collection-${projectId}`}>
            New collection name
          </label>
          <input
            id={`new-collection-${projectId}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New collection name"
            required
            maxLength={80}
          />
          <button className="btn primary" type="submit">
            <Icon name="plus" size={14} />
            Create
          </button>
        </form>
      </Modal>
    </>
  );
}
export function ResearchEditor({ projectId }: { projectId: string }) {
  const { notes, saveNote } = useResearch();
  const initial = notes[projectId] || {
    text: "",
    status: "considering" as ResearchStatus,
  };
  const [text, setText] = useState(initial.text);
  const [status, setStatus] = useState<ResearchStatus>(initial.status);
  const { notify } = useWorkspace();
  const changed = text !== initial.text || status !== initial.status;
  return (
    <section className="research-editor">
      <div className="panel-title">
        <div>
          <h3>Your research notes</h3>
          <p>Saved to your private library.</p>
        </div>
        <Icon name="bookmark" size={17} />
      </div>
      <label htmlFor={`decision-${projectId}`}>
        Decision
        <select
          id={`decision-${projectId}`}
          value={status}
          onChange={(e) => setStatus(e.target.value as ResearchStatus)}
        >
          <option value="considering">Considering</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="using">Using this</option>
        </select>
      </label>
      <label htmlFor={`note-${projectId}`}>
        Notes
        <textarea
          id={`note-${projectId}`}
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={3000}
          placeholder="Setup requirements, tradeoffs, questions for the maintainer…"
        />
      </label>
      <div className="note-editor-footer">
        <span>{text.length}/3000</span>
        <button
          className="btn primary small"
          disabled={!changed}
          onClick={() => {
            saveNote(projectId, { text, status });
            notify("Research note saved.");
          }}
        >
          Save note
        </button>
      </div>
    </section>
  );
}
export function FollowCreator({ handle }: { handle: string }) {
  const { following, toggleFollow } = useResearch();
  const active = following.includes(handle);
  return (
    <button
      className={`btn ${active ? "pressed" : ""}`}
      aria-pressed={active}
      onClick={() => toggleFollow(handle)}
    >
      <Icon name={active ? "check" : "plus"} size={15} />
      {active ? "Following" : "Follow creator"}
    </button>
  );
}
