"use client";
import { useState } from "react";
import { useSourceReferences, sourceKey } from "@/lib/source-references";
import { SourceReferenceCard } from "./source-reference-card";
import bundles from "@/lib/bundles.json";
import { useStored } from "@/lib/browser-store";
import Link from "next/link";
import { useResearch, type PersonalCollection } from "@/lib/research";
import { projects, projectPath } from "@/lib/catalog";
import { useWorkspace } from "./workspace";
import { Icon } from "./icon";
import { Modal } from "./modal";
import { ProjectCard, ProjectMark } from "./project-card";
import { ProjectVisual } from "./project-visual";
import { ResearchEditor } from "./research-actions";
export function CollectionWorkspace() {
  const { collections, createCollection, updateCollection } = useResearch();
  const [tab, setTab] = useState("mine");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("teal");
  const { notify } = useWorkspace();
  const list = collections.filter((c) =>
    tab === "archived" ? c.archived : !c.archived,
  );
  function form(c?: PersonalCollection) {
    setEditing(c?.id || null);
    setName(c?.name || "");
    setDescription(c?.description || "");
    setColor(c?.color || "teal");
    setModal(true);
  }
  return (
    <main id="main" className="inner-page collection-workspace">
      <div className="page-heading">
        <div>
          <h1>Collections</h1>
          <p>Group projects by what you’re building.</p>
        </div>
        <button className="btn primary" onClick={() => form()}>
          <Icon name="plus" size={16} />
          New collection
        </button>
      </div>
      <div className="library-summary">
        <span>
          <Icon name="folder" />
          {collections.filter((c) => !c.archived).length} personal collections
        </span>
        <span>
          <Icon name="code" />
          {
            new Set(
              collections
                .filter((c) => !c.archived)
                .flatMap((c) => c.projectIds),
            ).size
          }{" "}
          collected projects
        </span>
        <span>
          <Icon name="shield" />
          Private library
        </span>
      </div>
      <div className="library-tabs">
        {[
          ["mine", "My collections"],
          ["curated", "Reading lists"],
          ["archived", "Archived"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
          >
            {label}
            {id === "mine" && (
              <span>{collections.filter((c) => !c.archived).length}</span>
            )}
          </button>
        ))}
      </div>
      {tab === "curated" ? (
        <div className="collection-grid">
          {bundles.map((c) => (
            <Link
              key={c.slug}
              href={"/bundles/" + c.slug}
              className="collection-card personal-card"
            >
              <div className="collection-body">
                <h2>{c.name}</h2>
                <p>{c.description}</p>
                <span>{c.repos.length} repositories</span>
              </div>
            </Link>
          ))}
        </div>
      ) : list.length ? (
        <div className="collection-grid personal-collection-grid">
          {list.map((c) => (
            <article
              className={`collection-card personal-card ${c.color}`}
              key={c.id}
            >
              <Link
                href={`/library/${c.id}`}
                className="personal-collection-cover"
              >
                <span className="collection-index">PERSONAL COLLECTION</span>
                <div className="collection-marks">
                  {c.projectIds.length ? (
                    c.projectIds.slice(0, 3).map((id) => {
                      const p = projects.find((p) => p.id === id);
                      return p ? (
                        <ProjectMark project={p} large key={id} />
                      ) : null;
                    })
                  ) : (
                    <Icon name="folder" size={55} />
                  )}
                </div>
                <span className="collection-art-caption">
                  {c.projectIds.length} PROJECTS
                </span>
              </Link>
              <div className="collection-body">
                <Link href={`/library/${c.id}`}>
                  <h2>{c.name}</h2>
                </Link>
                <p>
                  {c.description ||
                    "Add a description to explain what you’re collecting."}
                </p>
                <div className="personal-collection-actions">
                  <button className="plain-button" onClick={() => form(c)}>
                    Edit collection
                  </button>
                  <button
                    className="icon-button"
                    aria-label={
                      c.archived ? `Restore ${c.name}` : `Archive ${c.name}`
                    }
                    onClick={() => {
                      updateCollection(c.id, { archived: !c.archived });
                      notify(
                        c.archived
                          ? "Collection restored."
                          : "Collection archived. You can restore it from Archived.",
                      );
                    }}
                  >
                    <Icon name={c.archived ? "plus" : "folder"} size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
          {tab === "mine" && (
            <button className="new-collection-tile" onClick={() => form()}>
              <Icon name="plus" size={25} />
              <span>Create another collection</span>
            </button>
          )}
        </div>
      ) : (
        <div className="collection-onboarding">
          <div className="collection-onboarding-art" aria-hidden="true">
            <span />
            <span />
            <span>
              <Icon name="folder" size={50} />
            </span>
          </div>
          <h2>
            {tab === "archived"
              ? "No archived collections."
              : "Start with what you’re building."}
          </h2>
          <p>
            {tab === "archived"
              ? "Archived collections can be restored here. Projects and notes are kept."
              : "A new app, an infrastructure decision, a weekend experiment. Give it a collection and gather the projects you want to try."}
          </p>
          {tab !== "archived" && (
            <>
              <button className="btn primary" onClick={() => form()}>
                <Icon name="plus" size={15} />
                Create your first collection
              </button>
              <div className="collection-starters">
                {[
                  "Next app shortlist",
                  "Tools to try",
                  "Infrastructure research",
                ].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setName(n);
                      setEditing(null);
                      setDescription("");
                      setColor("teal");
                      setModal(true);
                    }}
                  >
                    {n}
                    <Icon name="plus" size={12} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? "Edit collection" : "Create a collection"}
      >
        <form
          className="collection-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            if (editing)
              updateCollection(editing, {
                name: name.trim(),
                description: description.trim(),
                color,
              });
            else createCollection(name, description, color);
            setModal(false);
            setTab("mine");
            notify(
              editing
                ? "Collection updated."
                : "Collection created. Open it to add projects.",
            );
          }}
        >
          <label htmlFor="collection-name">
            Collection name
            <input
              id="collection-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              required
              autoFocus
              data-autofocus
              placeholder="e.g. Customer portal shortlist"
            />
          </label>
          <label htmlFor="collection-description">
            Description <span>optional</span>
            <textarea
              id="collection-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={400}
              placeholder="What are you researching? What matters for this decision?"
            />
          </label>
          <fieldset>
            <legend>Cover color</legend>
            <div className="color-choices">
              {["teal", "sand", "violet"].map((c) => (
                <button
                  type="button"
                  className={`color-choice ${c} ${color === c ? "selected" : ""}`}
                  aria-label={`${c} cover`}
                  aria-pressed={color === c}
                  key={c}
                  onClick={() => setColor(c)}
                >
                  {color === c && <Icon name="check" size={18} />}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="modal-form-footer">
            <span>
              <Icon name="shield" size={13} />
              Saved to your private library
            </span>
            <button className="btn primary" type="submit">
              {editing ? "Save changes" : "Create collection"}
              <Icon name="arrow" size={15} />
            </button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
export function PersonalCollectionPage({ id }: { id: string }) {
  const { collections, toggleItem } = useResearch();
  const { references } = useSourceReferences();
  const collection = collections.find((c) => c.id === id);
  const [picker, setPicker] = useState(false);
  const [query, setQuery] = useState("");
  if (!collection)
    return (
      <main id="main" className="inner-page">
        <Link href="/collections" className="back-link">
          All collections
        </Link>
        <div className="empty-state">
          <Icon name="folder" size={30} />
          <h1>Collection not found.</h1>
          <p>Sign in to the account you used to create this collection.</p>
        </div>
      </main>
    );
  const items = projects.filter((p) => collection.projectIds.includes(p.id));
  const sourceItems = references.filter((p) =>
    collection.projectIds.includes(sourceKey(p)),
  );
  const count = items.length + sourceItems.length;
  return (
    <main id="main" className="inner-page">
      <Link href="/collections" className="back-link">
        <Icon name="arrow" size={15} style={{ transform: "rotate(180deg)" }} />
        All collections
      </Link>
      <div className={`personal-collection-header ${collection.color}`}>
        <div>
          <span className="section-kicker">
            PERSONAL COLLECTION · ON THIS DEVICE
          </span>
          <h1>{collection.name}</h1>
          <p>
            {collection.description || "A collection of projects to look into."}
          </p>
          <span>
            {count} projects{collection.archived ? " · Archived" : ""}
          </span>
        </div>
        <Icon name="folder" size={75} />
      </div>
      <div className="catalog-heading">
        <h2>
          In this collection <span>{count}</span>
        </h2>
        <button className="btn" onClick={() => setPicker(true)}>
          <Icon name="plus" size={15} />
          Manage projects
        </button>
      </div>
      {count ? (
        <div className="projects-grid three-col">
          {items.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
          {sourceItems.map((p) => (
            <SourceReferenceCard key={p.id} repository={p} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>Put a few options on the table.</h2>
          <p>Add projects from the catalog and compare the approaches.</p>
          <button className="btn primary" onClick={() => setPicker(true)}>
            Choose projects
          </button>
        </div>
      )}
      <Modal
        open={picker}
        onClose={() => setPicker(false)}
        title="Manage collection projects"
      >
        <div className="command-search">
          <Icon name="search" />
          <input
            placeholder="Filter projects…"
            aria-label="Filter collection projects"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="collection-pick-list">
          {projects
            .filter((p) =>
              `${p.name} ${p.tagline}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .map((p) => (
              <button
                key={p.id}
                className={
                  collection.projectIds.includes(p.id) ? "selected" : ""
                }
                aria-pressed={collection.projectIds.includes(p.id)}
                onClick={() => toggleItem(id, p.id)}
              >
                <ProjectMark project={p} />
                <span>
                  <b>{p.name}</b>
                  <small>{p.tagline}</small>
                </span>
                <span className="pick-check">
                  {collection.projectIds.includes(p.id) && (
                    <Icon name="check" size={14} />
                  )}
                </span>
              </button>
            ))}
        </div>
        {references.length > 0 && (
          <div className="collection-pick-list live-source-picks">
            <span className="section-kicker">YOUR GITHUB SOURCES</span>
            {references
              .filter((p) =>
                p.fullName.toLowerCase().includes(query.toLowerCase()),
              )
              .map((p) => (
                <button
                  key={p.id}
                  className={
                    collection.projectIds.includes(sourceKey(p))
                      ? "selected"
                      : ""
                  }
                  aria-pressed={collection.projectIds.includes(sourceKey(p))}
                  onClick={() => toggleItem(id, sourceKey(p))}
                >
                  <span className="source-reference-mark">
                    <Icon name="git" size={17} />
                  </span>
                  <span>
                    <b>{p.fullName}</b>
                    <small>Real GitHub metadata snapshot</small>
                  </span>
                  <span className="pick-check">
                    {collection.projectIds.includes(sourceKey(p)) && (
                      <Icon name="check" size={14} />
                    )}
                  </span>
                </button>
              ))}
          </div>
        )}
        <div className="modal-form-footer">
          <span>{count} projects selected</span>
          <button className="btn primary" onClick={() => setPicker(false)}>
            Done
          </button>
        </div>
      </Modal>
    </main>
  );
}
export function ResearchLibrary() {
  const { saved, toggleSave } = useWorkspace();
  const { references } = useSourceReferences();
  const { notes, collections } = useResearch();
  const [query, setQuery] = useState("");
  const [view, setView] = useStored("drp-library-view", "list");
  const [status, setStatus] = useState("");
  const [noteId, setNoteId] = useState<string | null>(null);
  const list = projects.filter(
    (p) =>
      saved.includes(p.id) &&
      `${p.name} ${p.description}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!status || (notes[p.id]?.status || "considering") === status),
  );
  const sourceList = references.filter(
    (p) =>
      `${p.fullName} ${p.description}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!status || (notes[sourceKey(p)]?.status || "considering") === status),
  );
  return (
    <main id="main" className="inner-page research-library">
      <div className="page-heading">
        <div>
          <h1>My library</h1>
          <p>Saved projects, your notes, and where each option stands.</p>
        </div>
        <Link href="/" className="btn primary">
          <Icon name="plus" size={15} />
          Find projects
        </Link>
      </div>
      <div className="library-filterbar">
        <div className="search-field">
          <Icon name="search" size={17} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your saved projects"
            aria-label="Search saved projects"
          />
        </div>
        <select
          aria-label="Filter by decision"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All decisions</option>
          <option value="considering">Considering</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="using">Using this</option>
        </select>
        <div className="segmented-control">
          <button
            className={view === "list" ? "active" : ""}
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <Icon name="list" size={15} />
            List
          </button>
          <button
            className={view === "board" ? "active" : ""}
            aria-pressed={view === "board"}
            onClick={() => setView("board")}
          >
            <Icon name="grid" size={15} />
            Board
          </button>
        </div>
      </div>
      {list.length || sourceList.length ? (
        view === "board" ? (
          <div className="research-board">
            {[
              ["considering", "Considering"],
              ["shortlisted", "Shortlisted"],
              ["using", "Using this"],
            ].map(([id, label]) => (
              <section key={id}>
                <h2>
                  <span className={`decision-dot ${id}`} />
                  {label}
                  <span>
                    {list.filter(
                      (p) => (notes[p.id]?.status || "considering") === id,
                    ).length +
                      sourceList.filter(
                        (p) =>
                          (notes[sourceKey(p)]?.status || "considering") === id,
                      ).length}
                  </span>
                </h2>
                {list
                  .filter((p) => (notes[p.id]?.status || "considering") === id)
                  .map((p) => (
                    <article className="research-board-card" key={p.id}>
                      <Link href={projectPath(p)}>
                        <ProjectMark project={p} />
                        <h3>{p.name}</h3>
                      </Link>
                      <p>{p.tagline}</p>
                      {notes[p.id]?.text && (
                        <blockquote>{notes[p.id].text}</blockquote>
                      )}
                      <button
                        className="plain-button"
                        onClick={() => setNoteId(p.id)}
                      >
                        {notes[p.id]?.text
                          ? "Edit research note"
                          : "Add research note"}
                        <Icon name="plus" size={12} />
                      </button>
                    </article>
                  ))}
                {sourceList
                  .filter(
                    (p) =>
                      (notes[sourceKey(p)]?.status || "considering") === id,
                  )
                  .map((p) => (
                    <SourceReferenceCard key={p.id} repository={p} />
                  ))}
              </section>
            ))}
          </div>
        ) : (
          <div className="saved-research-list">
            {list.map((p) => (
              <article key={p.id}>
                <Link
                  href={projectPath(p)}
                  className="saved-visual"
                  aria-label={`Open ${p.name} project`}
                >
                  <ProjectVisual project={p} />
                </Link>
                <div className="saved-research-content">
                  <div>
                    <Link href={projectPath(p)}>
                      <h2>{p.name}</h2>
                    </Link>
                    <span
                      className={`decision-label ${notes[p.id]?.status || "considering"}`}
                    >
                      {(notes[p.id]?.status || "considering").replace(
                        "using",
                        "Using this",
                      )}
                    </span>
                  </div>
                  <p>{p.tagline}</p>
                  {notes[p.id]?.text ? (
                    <blockquote>{notes[p.id].text}</blockquote>
                  ) : (
                    <span className="no-note">No research notes yet.</span>
                  )}
                  <div className="saved-research-actions">
                    <button
                      className="plain-button"
                      onClick={() => setNoteId(p.id)}
                    >
                      <Icon name="code" size={14} />
                      {notes[p.id]?.text ? "Edit note" : "Add note"}
                    </button>
                    <span>
                      {
                        collections.filter(
                          (c) => !c.archived && c.projectIds.includes(p.id),
                        ).length
                      }{" "}
                      collections
                    </span>
                    <button
                      className="icon-button"
                      aria-label={`Unsave ${p.name}`}
                      onClick={() => toggleSave(p.id)}
                    >
                      <Icon name="bookmark" size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )
      ) : (
        <div className="empty-state">
          <span className="empty-state-icon">
            <Icon name="bookmark" size={25} />
          </span>
          <h2>
            {saved.length + references.length
              ? "No saved projects match."
              : "Start a shortlist worth returning to."}
          </h2>
          <p>
            Save projects from the directory, then add notes and a decision
            status here.
          </p>
          <Link className="btn primary" href="/">
            Browse projects
            <Icon name="arrow" size={15} />
          </Link>
        </div>
      )}
      {view !== "board" && sourceList.length > 0 && (
        <section className="real-source-library">
          <div className="catalog-heading">
            <h2>
              GitHub source references<span>{sourceList.length}</span>
            </h2>
            <Link href="/inspect" className="plain-button">
              Inspect another repository
            </Link>
          </div>
          <div className="real-source-grid">
            {sourceList.map((p) => (
              <SourceReferenceCard key={p.id} repository={p} />
            ))}
          </div>
        </section>
      )}
      <Modal
        open={!!noteId}
        onClose={() => setNoteId(null)}
        title={`Research · ${projects.find((p) => p.id === noteId)?.name || "Project"}`}
      >
        {noteId && <ResearchEditor key={noteId} projectId={noteId} />}
      </Modal>
    </main>
  );
}
