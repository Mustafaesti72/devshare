"use client";
import Link from "next/link";
import Image from "next/image";
import { useWorkspace } from "./workspace";
import { Modal } from "./modal";

import { useState } from "react";
import funding from "@/lib/funding.json";
import records from "@/lib/directory.json";
import { Icon } from "./icon";
import { useSourceReferences, sourceKey } from "@/lib/source-references";
import { CollectionPicker, ResearchEditor } from "./research-actions";
import { parseSourceSnapshots } from "@/lib/github-input";
import type { PublicRepository } from "@/lib/github-input";

const guide: Record<string, [string, string, string, string]> = {
  playwright: [
    "Playwright",
    "Testing",
    "Run end-to-end tests across browser engines.",
    "Use Playwright to exercise browser workflows such as sign-in, form submission and navigation.",
  ],
  vitest: [
    "Vitest",
    "Testing",
    "Test JavaScript and TypeScript projects with Vite.",
    "Start with unit tests in an existing Vite project and share the same module resolution as the application.",
  ],
  pytest: [
    "pytest",
    "Testing",
    "Write Python tests with fixtures and parametrization.",
    "Use fixtures to share setup between Python tests and parametrization to exercise multiple inputs.",
  ],
  "react-testing-library": [
    "React Testing Library",
    "Testing",
    "Test React components through user interactions.",
    "Query the rendered interface by role or label when testing component behavior.",
  ],
  k6: [
    "k6",
    "Testing",
    "Run scripted load tests for services.",
    "Use controlled traffic against a service you operate to measure response times under load.",
  ],
  storybook: [
    "Storybook",
    "Web",
    "Develop and inspect UI components in isolation.",
    "Create stories for loading, empty and populated states so each component can be reviewed independently.",
  ],
  polars: [
    "Polars",
    "Data",
    "Transform and query tabular data.",
    "Build a dataframe pipeline when you need to filter, aggregate or join structured datasets.",
  ],
  svelte: [
    "Svelte",
    "Web",
    "Build reactive web interfaces with a compiler.",
    "Use components to organize interactions and let the compiler generate the browser updates.",
  ],
  fd: [
    "fd",
    "Tooling",
    "Find files and directories from the command line.",
    "Use fd to locate paths by name or extension before passing them to other command-line tools.",
  ],
  jq: [
    "jq",
    "Data",
    "Filter and transform JSON in a shell pipeline.",
    "Inspect API responses or extract selected fields from structured command output.",
  ],
  task: [
    "Task",
    "Tooling",
    "Define repeatable development tasks in YAML.",
    "Put common build and test commands in a Taskfile so contributors can run them consistently.",
  ],
  fastapi: [
    "FastAPI",
    "Web",
    "Build Python APIs using type annotations.",
    "Define typed request models and review generated API documentation as you develop endpoints.",
  ],
  appium: [
    "Appium",
    "Testing",
    "Automate tests for mobile applications.",
    "Cross-platform automation framework for all kinds of apps, built on top of the W3C WebDriver protocol",
  ],
  Maestro: [
    "Maestro",
    "Testing",
    "Describe mobile UI test flows in YAML.",
    "Painless E2E Automation for Mobile and Web",
  ],
  Detox: [
    "Detox",
    "Testing",
    "Exercise React Native screens on simulators and devices.",
    "Gray box end-to-end testing and automation framework for mobile apps",
  ],
  "axe-core": [
    "axe-core",
    "Testing",
    "Check rendered pages for accessibility issues.",
    "Accessibility engine for automated Web UI testing",
  ],
  pa11y: [
    "Pa11y",
    "Testing",
    "Run accessibility checks from the command line.",
    "Pa11y is your automated accessibility testing pal",
  ],
  hypothesis: [
    "Hypothesis",
    "Testing",
    "Generate and shrink inputs for Python property tests.",
    "The property-based testing library for Python",
  ],
  "fast-check": [
    "fast-check",
    "Testing",
    "Check properties against generated JavaScript inputs.",
    "Property based testing framework for JavaScript (like QuickCheck) written in TypeScript",
  ],
  msw: [
    "Mock Service Worker",
    "Testing",
    "Mock HTTP requests during development and tests.",
    "The industry standard for API mocking in JavaScript.",
  ],
  wiremock: [
    "WireMock",
    "Testing",
    "Simulate HTTP services for integration tests.",
    "A tool for mocking HTTP services",
  ],
  newman: [
    "Newman",
    "Testing",
    "Run Postman collections from the command line.",
    "Newman is a command-line collection runner for Postman",
  ],
  "rest-assured": [
    "REST Assured",
    "Testing",
    "Test REST APIs using Java assertions.",
    "Java DSL for easy testing of REST services",
  ],
  "testcontainers-java": [
    "Testcontainers for Java",
    "Testing",
    "Start temporary service containers for Java tests.",
    "Testcontainers is a Java library that supports JUnit tests, providing lightweight, throwaway instances of common databases, Selenium web browsers, or anything else that can run in a Docker container.",
  ],
  jest: [
    "Jest",
    "Testing",
    "Run JavaScript tests with mocks and assertions.",
    "Delightful JavaScript Testing.",
  ],
  mocha: [
    "Mocha",
    "Testing",
    "Organize asynchronous JavaScript test suites.",
    "\u2615\ufe0f Classic, reliable, trusted test framework for Node.js and the browser",
  ],
  "junit-framework": [
    "JUnit",
    "Testing",
    "Write and run tests on the JVM.",
    "\u2705 The programmer-friendly testing framework for Java and the JVM",
  ],
  mockito: [
    "Mockito",
    "Testing",
    "Replace Java dependencies with test doubles.",
    "Most popular Mocking framework for unit tests written in Java",
  ],
  "rspec-core": [
    "RSpec Core",
    "Testing",
    "Describe Ruby behavior with executable examples.",
    "RSpec runner and formatters",
  ],
  "cucumber-js": [
    "Cucumber.js",
    "Testing",
    "Connect Gherkin scenarios to JavaScript step definitions.",
    "Cucumber for JavaScript",
  ],
  robotframework: [
    "Robot Framework",
    "Testing",
    "Build keyword-driven acceptance test suites.",
    "Generic automation framework for acceptance testing and RPA",
  ],
  locust: [
    "Locust",
    "Testing",
    "Model user traffic in Python for controlled load tests.",
    "Write scalable load tests in plain Python \ud83d\ude97\ud83d\udca8",
  ],
  pest: [
    "Pest",
    "Testing",
    "Write expressive PHP test cases.",
    "The elegant testing framework for PHP developers and AI agents.",
  ],
  "user-event": [
    "user-event",
    "Testing",
    "Simulate user interactions in component tests.",
    "\ud83d\udc15 Simulate user events",
  ],
  hono: [
    "Hono",
    "Web",
    "Build HTTP applications using Web Standard APIs.",
    "Web framework built on Web Standards",
  ],
  "react-router": [
    "React Router",
    "Web",
    "Route requests and navigation in React applications.",
    "Declarative routing for React",
  ],
  httpx: [
    "HTTPX",
    "Web",
    "Make synchronous and asynchronous HTTP requests in Python.",
    "A next generation HTTP client for Python. \ud83e\udd8b",
  ],
  flask: [
    "Flask",
    "Web",
    "Build a Python web application around routes and views.",
    "The Python micro framework for building web applications.",
  ],
  pandas: [
    "pandas",
    "Data",
    "Analyze and reshape tabular data in Python.",
    "Flexible and powerful data analysis / manipulation library for Python, providing labeled data structures similar to R data.frame objects, statistical functions, and much more",
  ],
  sqlite: [
    "SQLite",
    "Data",
    "Embed a relational database in an application.",
    "Official Git mirror of the SQLite source tree",
  ],
  arrow: [
    "Apache Arrow",
    "Data",
    "Exchange columnar data between analytical systems.",
    "Apache Arrow is the universal columnar format and multi-language toolbox for fast data interchange and in-memory analytics",
  ],
  cli: [
    "GitHub CLI",
    "Tooling",
    "Work with GitHub repositories and pull requests in a terminal.",
    "GitHub\u2019s official command line tool",
  ],
  bubbletea: [
    "Bubble Tea",
    "Tooling",
    "Build interactive terminal interfaces in Go.",
    "A powerful little TUI framework \ud83c\udfd7",
  ],
  bat: [
    "bat",
    "Tooling",
    "Read files in a terminal with syntax highlighting.",
    "A cat(1) clone with wings.",
  ],
  duckdb: [
    "DuckDB",
    "Data",
    "Run analytical SQL against local files.",
    "DuckDB runs inside your process. Start with it when you want to query CSV or Parquet files without operating a separate database server.",
  ],
  ruff: [
    "Ruff",
    "Tooling",
    "Lint and format Python in a single toolchain.",
    "Read the rule list before migrating an existing codebase. Select a small rule set first so formatting changes and behavior changes stay easy to review.",
  ],
  mise: [
    "mise",
    "Tooling",
    "Keep development tools and tasks in one project configuration.",
    "Use mise when a repository needs reproducible tool versions across several languages. Check which tools your team already manages elsewhere.",
  ],
  biome: [
    "Biome",
    "Tooling",
    "Format and check a JavaScript or TypeScript project.",
    "Review language support and lint rules against your existing configuration before replacing a formatter or linter.",
  ],
  query: [
    "TanStack Query",
    "Web",
    "Manage asynchronous server state in a frontend.",
    "Useful when several views depend on the same remote data. Review query keys, invalidation and cache lifetime before building your first integration.",
  ],
  astro: [
    "Astro",
    "Web",
    "Build a content site with interactive components where needed.",
    "Start with a content-heavy page. Choose a rendering mode and deployment adapter based on which parts of the site need fresh server data.",
  ],
  nushell: [
    "Nushell",
    "Tooling",
    "Work with structured records in the shell.",
    "Use a pipeline to filter and transform records. Check existing shell scripts for syntax differences before switching your daily environment.",
  ],
  ripgrep: [
    "ripgrep",
    "Tooling",
    "Search source trees from the command line.",
    "Useful for reviewing a large checkout. Its default ignore behavior keeps generated files out of most searches. Check hidden and ignored files when completeness matters.",
  ],
};
const path = (p: PublicRepository) => `/directory/${p.owner}/${p.name}`;
function Save({ p, label }: { p: PublicRepository; label?: string }) {
  const { references, saveReference } = useSourceReferences();
  const { notify } = useWorkspace();
  const saved = references.some((s) => s.id === p.id);
  return (
    <button
      className="dir-save"
      aria-label={`${saved ? "Saved" : "Save"} ${label || guide[p.name]?.[0] || p.name}`}
      disabled={saved}
      onClick={() => {
        if (!saveReference(p))
          notify(
            "Your library holds up to 500 sources. Remove a source before adding another.",
          );
      }}
    >
      <Icon name={saved ? "check" : "bookmark"} size={16} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
type Publication = {
  id: number;
  full_name: string;
  summary: string;
  category?: string;
  repository?: PublicRepository;
  has_image?: boolean;
};
export function Directory({
  published,
  initialQuery = "",
  initialGroup = "All",
  initialSort = "editor",
  initialLanguage = "",
  initialLicense = "",
  heading = "Open source index",
  intro = "",
}: {
  published: Publication[];
  initialQuery?: string;
  initialGroup?: string;
  initialSort?: string;
  initialLanguage?: string;
  initialLicense?: string;
  heading?: string;
  intro?: string;
}) {
  const [query, setQuery] = useState(initialQuery),
    [group, setGroup] = useState(initialGroup),
    [sort, setSort] = useState(initialSort);
  const [language, setLanguage] = useState(initialLanguage),
    [license, setLicense] = useState(initialLicense);
  const [selected, setSelected] = useState<number[]>([]),
    [compare, setCompare] = useState(false);
  const publicationById = new Map(published.map((row) => [row.id, row]));
  const snapshots = published.flatMap((row) =>
    parseSourceSnapshots(JSON.stringify([row.repository])),
  );
  const imported = new Set(snapshots.map((repo) => repo.id));
  const repositories: PublicRepository[] = [
    ...snapshots,
    ...records.filter((repo) => !imported.has(repo.id)),
  ];
  const ids = new Set(repositories.map((repo) => repo.id));
  const title = (repo: PublicRepository) =>
    publicationById.get(repo.id)?.full_name ||
    guide[repo.name]?.[0] ||
    repo.fullName;
  const category = (repo: PublicRepository) =>
    publicationById.get(repo.id)?.category ||
    guide[repo.name]?.[1] ||
    "Tooling";
  const description = (repo: PublicRepository) =>
    publicationById.get(repo.id)?.summary ||
    guide[repo.name]?.[2] ||
    repo.description;
  const href = (repo: PublicRepository) =>
    publicationById.has(repo.id)
      ? "/showcase/" + publicationById.get(repo.id)!.full_name
      : path(repo);
  const matches = (
    name: string,
    summary: string,
    tag: string,
    lang: string | null,
    spdx: string | null,
  ) =>
    (group === "All" || tag === group) &&
    (!language || lang === language) &&
    (!license || (spdx || "unreported") === license) &&
    (name + " " + summary + " " + (lang || ""))
      .toLowerCase()
      .includes(query.trim().toLowerCase());
  const rows = repositories.filter((repo) =>
    matches(
      repo.fullName,
      description(repo),
      category(repo),
      repo.language,
      repo.license,
    ),
  );
  const legacy = published.filter(
    (row) =>
      !ids.has(row.id) &&
      matches(
        row.full_name,
        row.summary,
        row.category || "Tooling",
        null,
        null,
      ),
  );
  if (sort === "stars") rows.sort((a, b) => b.stars - a.stars);
  if (sort === "updated")
    rows.sort((a, b) => (b.pushedAt || "").localeCompare(a.pushedAt || ""));
  const picks = repositories.filter((repo) => selected.includes(repo.id));
  const { references } = useSourceReferences();
  const total = new Set([
    ...repositories.map((repo) => repo.id),
    ...legacy.map((repo) => repo.id),
  ]).size;
  const resultCount = rows.length + legacy.length;
  const languages = [
    ...new Set(
      repositories
        .map((repo) => repo.language)
        .filter((value): value is string => !!value),
    ),
  ].sort();
  const licenses = [
    ...new Set(repositories.map((repo) => repo.license || "unreported")),
  ].sort();
  function toggle(id: number) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : current.length < 3
          ? [...current, id]
          : current,
    );
  }
  return (
    <main id="main" className="launch-feed">
      <div className="feed-frame">
        <header className="feed-heading">
          <div>
            <h1>{heading}</h1>
            <p>{intro || total + " public repositories"}</p>
          </div>
          <Link href="/inspect">
            Inspect a GitHub URL <Icon name="arrow" size={15} />
          </Link>
        </header>
        <div className="feed-layout">
          <section id="repositories" aria-label="Project feed">
            <form className="feed-search-form" method="get" action="/explore">
              <input type="hidden" name="group" value={group} />
              <div className="feed-toolbar">
                <label>
                  <Icon name="search" size={17} />
                  <input
                    name="q"
                    aria-label="Search open source index"
                    placeholder="Search the directory"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </label>
                <select
                  name="sort"
                  aria-label="Order repositories"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="editor">Editor’s order</option>
                  <option value="stars">Most stars</option>
                  <option value="updated">Latest push</option>
                </select>
                <button className="btn" type="submit">
                  Search
                </button>
              </div>
              <details className="feed-filters">
                <summary>Language and license</summary>
                <div>
                  <label>
                    Language
                    <select
                      name="lang"
                      value={language}
                      onChange={(event) => setLanguage(event.target.value)}
                    >
                      <option value="">All languages</option>
                      {languages.map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    License
                    <select
                      name="license"
                      value={license}
                      onChange={(event) => setLicense(event.target.value)}
                    >
                      <option value="">All licenses</option>
                      {licenses.map((value) => (
                        <option key={value} value={value}>
                          {value === "unreported" || value === "NOASSERTION"
                            ? "Unspecified license"
                            : value}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </details>
            </form>
            <nav className="feed-tabs" aria-label="Repository categories">
              {["All", "Testing", "Data", "Tooling", "Web"].map((value) => (
                <button
                  key={value}
                  aria-pressed={value === group}
                  onClick={() => setGroup(value)}
                >
                  {value === "All" ? "All projects" : value}
                </button>
              ))}
              <span>{resultCount} results</span>
            </nav>
            {legacy.map((row) => (
              <article className="feed-item" key={row.id}>
                <span className="source-reference-mark">
                  <Icon name="git" size={24} />
                </span>
                <div className="feed-item-copy">
                  <Link href={"/showcase/" + row.full_name}>
                    <h2>{row.full_name}</h2>
                    <p>{row.summary}</p>
                  </Link>
                  <span>Maintainer publication</span>
                </div>
                <Link
                  className="plain-button"
                  href={"/inspect?repo=" + encodeURIComponent(row.full_name)}
                >
                  Inspect source
                </Link>
              </article>
            ))}
            {rows.map((repo) => (
              <article className="feed-item" key={repo.id}>
                <Link href={href(repo)} aria-label={title(repo)}>
                  {records.some((item) => item.id === repo.id) ? (
                    <Image
                      src={"/api/media/" + repo.name + ".png"}
                      width={54}
                      height={54}
                      alt=""
                      unoptimized
                    />
                  ) : (
                    <span className="source-reference-mark">
                      <Icon name="git" size={24} />
                    </span>
                  )}
                </Link>
                <div className="feed-item-copy">
                  <Link href={href(repo)}>
                    <h2>{title(repo)}</h2>
                    <p>{description(repo)}</p>
                  </Link>
                  <div className="feed-tags">
                    <Link href={"/topics/" + category(repo).toLowerCase()}>
                      {category(repo)}
                    </Link>
                    <span>{repo.language || "Language unreported"}</span>
                    <span>
                      {repo.license === "NOASSERTION"
                        ? "Review license"
                        : repo.license || "Review license"}
                    </span>
                    <button
                      aria-pressed={selected.includes(repo.id)}
                      disabled={
                        !selected.includes(repo.id) && selected.length === 3
                      }
                      aria-label={"Compare " + title(repo)}
                      onClick={() => toggle(repo.id)}
                    >
                      <Icon
                        name={selected.includes(repo.id) ? "check" : "plus"}
                        size={13}
                      />
                      Compare
                    </button>
                  </div>
                </div>
                <div className="feed-item-actions">
                  <span
                    title={repo.stars.toLocaleString("en-US") + " GitHub stars"}
                  >
                    <Icon name="star" size={14} />
                    {Intl.NumberFormat("en", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(repo.stars)}
                  </span>
                  <Save p={repo} label={title(repo)} />
                </div>
              </article>
            ))}
            {!resultCount && (
              <div className="feed-empty">
                No matching projects.{" "}
                <button
                  className="plain-button"
                  onClick={() => {
                    setQuery("");
                    setGroup("All");
                    setLanguage("");
                    setLicense("");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>
        </div>
        <nav className="directory-reading" aria-label="More ways to discover">
          <Link href="/trending">Most starred repositories</Link>
          <Link href="/blog">Developer guides</Link>
          {["testing", "data", "tooling", "web"].map((value) => (
            <Link key={value} href={"/topics/" + value}>
              {value[0].toUpperCase() + value.slice(1)}
            </Link>
          ))}
        </nav>
        {selected.length > 0 && (
          <div className="source-compare-bar">
            <span>{selected.length} of 3 selected</span>
            <button className="plain-button" onClick={() => setSelected([])}>
              Clear
            </button>
            <button
              className="btn primary"
              disabled={selected.length < 2}
              onClick={() => setCompare(true)}
            >
              Compare repositories
            </button>
          </div>
        )}
        <Modal
          open={compare}
          onClose={() => setCompare(false)}
          title="Repository comparison"
        >
          <div className="source-compare-grid">
            {picks.map((repo) => (
              <section key={repo.id}>
                <h3>
                  <Link href={href(repo)}>{title(repo)}</Link>
                </h3>
                <p>{description(repo)}</p>
                <dl>
                  {[
                    ["Language", repo.language || "Unreported"],
                    ["License", repo.license || "Review repository"],
                    ["GitHub stars", repo.stars.toLocaleString("en-US")],
                    ["Last push", repo.pushedAt?.slice(0, 10) || "Unreported"],
                    ["Snapshot", repo.fetchedAt.slice(0, 10)],
                  ].map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <a href={repo.sourceUrl} target="_blank" rel="noreferrer">
                  Read source ↗
                </a>
                <Save p={repo} label={title(repo)} />
                {references.some((item) => item.id === repo.id) && (
                  <CollectionPicker projectId={sourceKey(repo)} />
                )}
              </section>
            ))}
          </div>
        </Modal>
      </div>
    </main>
  );
}

export function SourceBrief({ p }: { p: PublicRepository }) {
  const sponsors = (
    funding as Record<string, { handles: string[]; source: string }>
  )[p.fullName];
  const g = guide[p.name];
  const { references } = useSourceReferences();
  const saved = references.some((s) => s.id === p.id);
  return (
    <main id="main" className="directory brief">
      <Link className="back-link" href="/">
        All repositories
      </Link>
      <header className="brief-head">
        <span>{p.fullName}</span>
        <h1>{g[0]}</h1>
        <p>{g[2]}</p>
        <div>
          <a href={p.sourceUrl} target="_blank" rel="noreferrer">
            View on GitHub <Icon name="external" size={15} />
          </a>
          <Save p={p} />
          <Link href={"/report?repo=" + encodeURIComponent(p.fullName)}>
            Report project
          </Link>
          {saved && <CollectionPicker projectId={sourceKey(p)} />}
        </div>
      </header>
      <div className="brief-grid">
        <section>
          <h2>When to use it</h2>
          <p>{g[3]}</p>
          <h2>From the repository</h2>
          <blockquote>{p.description}</blockquote>
          <a href={p.sourceUrl + "#readme"}>Read the maintainer’s README</a>
          {sponsors && (
            <section className="funding-links">
              <h2>Support the maintainers</h2>
              <p>
                This repository lists the following GitHub Sponsors accounts.
              </p>
              <ul>
                {sponsors.handles.map((handle) => (
                  <li key={handle}>
                    <a href={`https://github.com/sponsors/${handle}`}>
                      Sponsor @{handle} ↗
                    </a>
                  </li>
                ))}
              </ul>
              <a href={sponsors.source}>View the repository’s funding file</a>
            </section>
          )}
        </section>
        <aside>
          <h2>Repository facts</h2>
          <dl>
            {[
              ["Language", p.language],
              [
                "License",
                p.license === "NOASSERTION"
                  ? "Review source license"
                  : p.license,
              ],
              ["GitHub stars", p.stars.toLocaleString("en-US")],
              ["Last push", p.pushedAt?.slice(0, 10)],
              ["Snapshot", p.fetchedAt.slice(0, 10)],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v || "Not reported"}</dd>
              </div>
            ))}
          </dl>
          <Link href={`/inspect?repo=${encodeURIComponent(p.fullName)}`}>
            Check current metadata
          </Link>
        </aside>
      </div>
      {saved && <ResearchEditor projectId={sourceKey(p)} />}
    </main>
  );
}
