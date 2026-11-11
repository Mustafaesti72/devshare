"use client";
import Link from "next/link";
import { DiscoveryFeature } from "./discovery-feature";
import { useMemo, useState, useEffect, useRef } from "react";
import { projects, topics, collections, projectPath } from "@/lib/catalog";
import { ProjectCard, ProjectMark } from "./project-card";
import { Icon } from "./icon";
import { useWorkspace } from "./workspace";
type Props = {
  initialQuery?: string;
  initialTopic?: string;
  initialLanguage?: string;
  initialLicense?: string;
  initialSort?: string;
  initialLayout?: string;
  mode?: "discover" | "trending" | "saved" | "category";
};
export function Discovery({
  initialQuery = "",
  initialTopic = "",
  initialLanguage = "",
  initialLicense = "",
  initialSort = "",
  initialLayout = "grid",
  mode = "discover",
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [topic, setTopic] = useState(initialTopic);
  const [language, setLanguage] = useState(initialLanguage);
  const [license, setLicense] = useState(initialLicense);
  const [sort, setSort] = useState(
    initialSort || (mode === "trending" ? "stars" : "featured"),
  );
  const [layout, setLayout] = useState(initialLayout);
  const [tab, setTab] = useState("all");
  const [filters, setFilters] = useState(false);
  const { saved, notify } = useWorkspace();
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    function shortcut(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        e.key === "/" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) &&
        !target.isContentEditable
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  const results = useMemo(() => {
    let list = projects.filter(
      (p) =>
        (mode !== "saved" || saved.includes(p.id)) &&
        (!topic || p.topic === topic) &&
        (!language || p.language === language) &&
        (!license || p.license === license) &&
        `${p.name} ${p.description} ${p.language} ${p.tagline}`
          .toLowerCase()
          .includes(query.toLowerCase().trim()),
    );
    if (sort === "stars" || tab === "popular")
      list = [...list].sort((a, b) => b.stars - a.stars);
    if (sort === "newest" || tab === "recent")
      list = [...list].sort((a, b) => b.updated.localeCompare(a.updated));
    return list;
  }, [query, topic, language, license, sort, tab, mode, saved]);
  function reset() {
    setQuery("");
    setTopic("");
    setLanguage("");
    setLicense("");
    setTab("all");
  }
  const heading =
    mode === "saved"
      ? "Your saved projects"
      : mode === "trending"
        ? "Worth a closer look"
        : mode === "category"
          ? initialTopic
          : "Find what you’ll build with.";
  return (
    <main id="main" className="discovery-page">
      <div className="page-heading">
        <div>
          <div className="section-kicker">
            {mode === "saved"
              ? "YOUR LIBRARY"
              : mode === "category"
                ? "BROWSE A CATEGORY"
                : "THE DEVELOPER’S DIRECTORY"}
          </div>
          <h1>{heading}</h1>
          <p>
            {mode === "saved"
              ? "A shortlist you can return to. Stored on this device."
              : mode === "trending"
                ? "Explore the sample catalog, ordered by illustrative interest."
                : "Useful projects, the people behind them, and a good place to start."}
          </p>
        </div>
        <span className="date-stamp">
          <Icon name="compass" size={15} /> Curated discovery
        </span>
      </div>
      {mode === "discover" && !initialQuery && !initialTopic && (
        <DiscoveryFeature />
      )}
      <div className="discovery-columns">
        <section className="catalog-section" aria-label="Project catalog">
          <div className="catalog-heading">
            <h2>
              {mode === "saved"
                ? "Saved for later"
                : mode === "category"
                  ? "Projects in this category"
                  : "Explore the directory"}
              <span>{results.length}</span>
            </h2>
            <div className="catalog-heading-actions">
              <span className="quiet sample-label">SAMPLE CATALOG</span>
              <button
                className="plain-button"
                onClick={async () => {
                  const url = new URL("/explore", window.location.origin);
                  if (query) url.searchParams.set("q", query);
                  if (topic) url.searchParams.set("topic", topic);
                  if (language) url.searchParams.set("lang", language);
                  if (license) url.searchParams.set("license", license);
                  url.searchParams.set("sort", sort);
                  url.searchParams.set("view", layout);
                  try {
                    await navigator.clipboard.writeText(url.href);
                    notify("Search link copied with the current filters.");
                  } catch {
                    notify(
                      "Clipboard unavailable. Use the search form to recreate these filters.",
                    );
                  }
                }}
              >
                <Icon name="external" size={13} />
                Copy search
              </button>
            </div>
          </div>
          <div className="search-toolbar">
            <div className="search-field">
              <Icon name="search" size={18} />
              <label className="sr-only" htmlFor="project-search">
                Search projects
              </label>
              <input
                ref={searchRef}
                id="project-search"
                value={query}
                onChange={(e) => setQuery(e.target.value.slice(0, 200))}
                placeholder="Search by name, stack, or what you need…"
                maxLength={200}
              />
              {query ? (
                <button
                  className="icon-button"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                >
                  <Icon name="close" size={14} />
                </button>
              ) : (
                <kbd>/</kbd>
              )}
            </div>
            <button
              className={`btn filter-button ${filters ? "pressed" : ""}`}
              aria-expanded={filters}
              onClick={() => setFilters(!filters)}
            >
              <Icon name="sliders" size={16} />
              Filters{(language || license) && <span className="filter-dot" />}
            </button>
          </div>
          {filters && (
            <div className="expanded-filters">
              <label>
                Language
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="">Any language</option>
                  {["TypeScript", "Python", "Go", "Rust"].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </label>
              <label>
                License
                <select
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                >
                  <option value="">Any license</option>
                  <option>MIT</option>
                  <option>Apache-2.0</option>
                </select>
              </label>
              <button className="plain-button" onClick={reset}>
                Reset filters
              </button>
            </div>
          )}
          <div className="category-chips" aria-label="Filter by category">
            <button
              className={!topic ? "active" : ""}
              aria-pressed={!topic}
              onClick={() => setTopic("")}
            >
              All projects
            </button>
            {topics.map((t) => (
              <button
                className={topic === t ? "active" : ""}
                aria-pressed={topic === t}
                key={t}
                onClick={() => setTopic(topic === t ? "" : t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="catalog-controls">
            <div className="catalog-tabs" aria-label="Project order">
              {[
                ["all", "Featured"],
                ["popular", "Popular"],
                ["recent", "Recently added"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  className={tab === id ? "active" : ""}
                  aria-pressed={tab === id}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="view-controls">
              <label className="sr-only" htmlFor="sort">
                Sort projects
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setTab("all");
                }}
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="stars">Stars</option>
              </select>
              <div className="view-toggle">
                <button
                  className={layout === "grid" ? "active" : ""}
                  onClick={() => setLayout("grid")}
                  aria-label="Grid view"
                  aria-pressed={layout === "grid"}
                >
                  <Icon name="grid" size={14} />
                </button>
                <button
                  className={layout === "list" ? "active" : ""}
                  onClick={() => setLayout("list")}
                  aria-label="List view"
                  aria-pressed={layout === "list"}
                >
                  <Icon name="list" size={15} />
                </button>
              </div>
            </div>
          </div>
          <div
            className={`projects-grid ${layout === "list" ? "list-layout" : ""}`}
            aria-live="polite"
          >
            {results.map((p) => (
              <ProjectCard key={p.id} project={p} list={layout === "list"} />
            ))}
          </div>
          {!results.length && (
            <div className="empty-state">
              <span className="empty-state-icon">
                <Icon
                  name={mode === "saved" ? "bookmark" : "search"}
                  size={25}
                />
              </span>
              <h3>
                {mode === "saved" && !query && !topic
                  ? "Keep a few projects close."
                  : "No projects match those filters."}
              </h3>
              <p>
                {mode === "saved"
                  ? "Use the bookmark on a project card to add it to this library."
                  : "Try another keyword or remove a filter to see more projects."}
              </p>
              {mode === "saved" ? (
                <Link className="btn primary" href="/">
                  Browse projects
                </Link>
              ) : (
                <button className="btn" onClick={reset}>
                  Clear filters
                </button>
              )}
            </div>
          )}
          <div className="catalog-end">
            <span />{" "}
            {results.length > 0
              ? "You’re all caught up with the preview catalog."
              : "Try another keyword to see more projects."}{" "}
            <span />
          </div>
          <div className="source-note">
            <Icon name="shield" size={15} />
            <p>
              All projects here are fictional examples. Metrics, repository
              structures, and licenses illustrate the interface.
            </p>
          </div>
        </section>
        <aside className="discovery-rail">
          <section className="rail-section">
            <div className="rail-title">
              <h2>The short list</h2>
              <span>EDITOR’S DESK</span>
            </div>
            <p className="rail-description">
              A few starting points from the sample catalog.
            </p>
            {[projects[2], projects[0], projects[4]].map((p, i) => (
              <Link className="shortlist-item" key={p.id} href={projectPath(p)}>
                <span className="list-number">0{i + 1}</span>
                <ProjectMark project={p} />
                <div>
                  <b>{p.name}</b>
                  <span>{p.topic}</span>
                </div>
                <Icon name="chevron" size={13} />
              </Link>
            ))}
          </section>
          <section className="rail-section collections-rail">
            <div className="rail-title">
              <h2>Collected with intent</h2>
              <Link href="/collections" aria-label="View all collections">
                <Icon name="arrow" size={15} />
              </Link>
            </div>
            {collections.slice(1).map((c) => (
              <Link
                key={c.slug}
                href={`/collections/${c.slug}`}
                className={`mini-collection ${c.color}`}
              >
                <div className="mini-collection-art" aria-hidden="true">
                  <Icon
                    name={c.color === "teal" ? "terminal" : "code"}
                    size={30}
                  />
                  <div />
                  <div />
                </div>
                <h3>{c.name}</h3>
                <p>
                  {c.ids.length} projects <Icon name="arrow" size={14} />
                </p>
              </Link>
            ))}
          </section>
          <section className="rail-note">
            <span className="small-logomark">d.</span>
            <h3>The code is only part of it.</h3>
            <p>
              A useful description, a clear license, and the right context make
              a project easier to choose.
            </p>
            <Link href="/for-developers">
              A note for creators <Icon name="arrow" size={13} />
            </Link>
          </section>
        </aside>
      </div>
    </main>
  );
}
