"use client";
import { CollectionPicker, ResearchEditor } from "./research-actions";
import { sourceKey } from "@/lib/source-references";
import { useState, useRef, useEffect } from "react";
import {
  parseSourceSnapshots,
  type PublicRepository,
} from "@/lib/github-input";
import { useStored } from "@/lib/browser-store";
import { useWorkspace } from "./workspace";
import { Icon } from "./icon";
export function GithubInspector({
  initialRepository = "",
}: {
  initialRepository?: string;
}) {
  const [input, setInput] = useState(initialRepository);
  const [repository, setRepository] = useState<PublicRepository | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [raw, setRaw] = useStored("drp-source-references", "[]");
  const [copied, setCopied] = useState(false);
  const { notify } = useWorkspace();
  const controller = useRef<AbortController | null>(null);
  const references = parseSourceSnapshots(raw);
  useEffect(() => () => controller.current?.abort(), []);
  async function inspect(value = input) {
    controller.current?.abort();
    const next = new AbortController();
    controller.current = next;
    setInput(value);
    setLoading(true);
    setError("");
    setRepository(null);
    try {
      const response = await fetch(
        `/api/github?repo=${encodeURIComponent(value)}`,
        { signal: next.signal },
      );
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "The repository could not be loaded.");
        return;
      }
      setRepository(data.repository);
    } catch (e) {
      if (!next.signal.aborted)
        setError(
          "Couldn’t reach the lookup service. Check your connection and try again.",
        );
      void e;
    } finally {
      if (!next.signal.aborted) setLoading(false);
    }
  }
  function save() {
    if (!repository) return;
    setRaw(
      JSON.stringify(
        [repository, ...references.filter((p) => p.id !== repository.id)].slice(
          0,
          30,
        ),
      ),
    );
    notify(
      "Source reference saved on this device. It is not a published listing.",
    );
  }
  const isSaved = repository && references.some((p) => p.id === repository.id);
  async function copy() {
    if (!repository) return;
    try {
      await navigator.clipboard.writeText(
        `git clone ${repository.sourceUrl}.git`,
      );
      setCopied(true);
    } catch {
      notify("Clipboard unavailable. Copy the displayed command manually.");
    }
  }
  return (
    <main id="main" className="inner-page inspector-page">
      <div className="page-heading">
        <div>
          <div className="section-kicker">GITHUB INSPECTOR · PUBLIC DATA</div>
          <h1>Inspect a repository</h1>
          <p>
            Read public metadata directly from GitHub, then keep a reference for
            later.
          </p>
        </div>
        <span className="live-service-label">
          <i />
          Read-only connection
        </span>
      </div>
      <section className="inspector-search-panel">
        <div className="inspector-search-copy">
          <span className="inspector-git-mark">
            <Icon name="git" size={25} />
          </span>
          <div>
            <h2>Which repository are you looking into?</h2>
            <p>Paste a GitHub URL or enter an owner/repository name.</p>
          </div>
        </div>
        <form
          className="repo-lookup-form"
          onSubmit={(e) => {
            e.preventDefault();
            setCopied(false);
            void inspect();
          }}
        >
          <label className="sr-only" htmlFor="github-repository">
            GitHub repository URL
          </label>
          <div>
            <span>github.com /</span>
            <input
              id="github-repository"
              required
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="owner / repository"
              maxLength={250}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner" />
                Reading GitHub…
              </>
            ) : (
              <>
                Inspect repository
                <Icon name="arrow" size={16} />
              </>
            )}
          </button>
        </form>
        <div className="lookup-examples">
          <span>Try a public repository</span>
          {["octocat/Hello-World", "vercel/next.js", "withastro/astro"].map(
            (value) => (
              <button
                key={value}
                disabled={loading}
                onClick={() => {
                  setCopied(false);
                  void inspect(value);
                }}
              >
                {value}
                <Icon name="external" size={11} />
              </button>
            ),
          )}
        </div>
        <div className="inspector-privacy">
          <Icon name="shield" size={14} />
          <span>
            No sign-in or access token. No repository is imported, published, or
            claimed.
          </span>
        </div>
      </section>
      {error && (
        <div className="lookup-error" role="alert">
          <Icon name="shield" />
          <div>
            <h3>The lookup couldn’t finish.</h3>
            <p>{error}</p>
          </div>
          <button className="btn" onClick={() => void inspect()}>
            Try again
          </button>
        </div>
      )}
      {loading && (
        <section
          className="inspector-loading"
          aria-label="Loading repository"
          aria-busy="true"
        >
          <span />
          <span />
          <div>
            <span />
            <span />
            <span />
          </div>
        </section>
      )}
      {repository && (
        <section className="live-repository-card">
          <div className="live-repo-header">
            <div className="live-repo-monogram">
              {repository.name[0].toUpperCase()}
            </div>
            <div>
              <span>
                {repository.owner} /{" "}
                <b className="live-data-badge">GITHUB DATA</b>
              </span>
              <h2>{repository.name}</h2>
            </div>
            <button
              className={`btn ${isSaved ? "pressed" : ""}`}
              onClick={save}
            >
              <Icon name={isSaved ? "check" : "bookmark"} size={15} />
              {isSaved ? "Update saved reference" : "Save reference"}
            </button>
          </div>
          <p className="live-repo-description">
            {repository.description ||
              "This repository has no description on GitHub."}
          </p>
          <div className="live-repo-topics">
            {repository.topics.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
          <div className="live-repo-metrics">
            {[
              [
                "GitHub stars",
                repository.stars.toLocaleString("en-US"),
                "star",
              ],
              ["Forks", repository.forks.toLocaleString("en-US"), "git"],
              [
                "Open issues & PRs",
                repository.openIssues.toLocaleString("en-US"),
                "code",
              ],
            ].map(([label, value, icon]) => (
              <div key={label}>
                <Icon name={icon as "star"} size={17} />
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="live-repo-bottom">
            <div className="live-repo-facts">
              <div>
                <span>Primary language</span>
                <b>{repository.language || "Not reported"}</b>
              </div>
              <div>
                <span>Detected license</span>
                <b>{repository.license || "Not identified"}</b>
              </div>
              <div>
                <span>Default branch</span>
                <b>{repository.defaultBranch}</b>
              </div>
              <div>
                <span>Last push</span>
                <b>
                  {repository.pushedAt
                    ? new Date(repository.pushedAt).toLocaleDateString(
                        "en-GB",
                        { timeZone: "UTC" },
                      )
                    : "Not reported"}
                </b>
              </div>
              <div>
                <span>Repository state</span>
                <b>
                  {repository.archived
                    ? "Archived"
                    : repository.isFork
                      ? "Public fork"
                      : "Public repository"}
                </b>
              </div>
            </div>
            <div className="source-access">
              <h3>Continue at the source</h3>
              <p>
                Read the README, review the license, and check recent activity
                before using the code.
              </p>
              <a
                href={repository.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="btn primary full"
              >
                View on GitHub
                <Icon name="external" size={15} />
              </a>
              <div className="clone-command">
                <code>git clone {repository.sourceUrl}.git</code>
                <button
                  className="icon-button"
                  aria-label="Copy clone command"
                  onClick={copy}
                >
                  <Icon name={copied ? "check" : "copy"} size={15} />
                </button>
              </div>
            </div>
          </div>
          {isSaved && (
            <>
              <div className="live-repo-research-toolbar">
                <CollectionPicker projectId={sourceKey(repository)} />
                <span>Saved to your research library. Add notes below.</span>
              </div>
              <ResearchEditor
                key={sourceKey(repository)}
                projectId={sourceKey(repository)}
              />
            </>
          )}
          <div className="live-repo-foot">
            <span>
              Read from GitHub:{" "}
              {new Date(repository.fetchedAt).toLocaleString("en-GB", {
                timeZone: "UTC",
              })}{" "}
              UTC
            </span>
            <span>Ownership not verified · No creator affiliation</span>
          </div>
        </section>
      )}
      {references.length > 0 && (
        <section className="source-reference-library">
          <div className="catalog-heading">
            <h2>
              Saved source references<span>{references.length}</span>
            </h2>
            <span className="quiet">STORED ON THIS DEVICE</span>
          </div>
          {references.map((p) => (
            <article key={p.id}>
              <span className="source-reference-mark">
                <Icon name="git" />
              </span>
              <div>
                <h3>{p.fullName}</h3>
                <p>
                  {p.language || "Language not reported"} ·{" "}
                  {p.license || "License not identified"}
                </p>
              </div>
              <button
                className="btn small"
                disabled={loading}
                onClick={() => void inspect(p.fullName)}
              >
                Inspect again
                <Icon name="arrow" size={13} />
              </button>
              <button
                className="icon-button"
                aria-label={`Remove ${p.fullName} reference`}
                onClick={() => {
                  setRaw(
                    JSON.stringify(references.filter((x) => x.id !== p.id)),
                  );
                  notify("Source reference removed from this browser.");
                }}
              >
                <Icon name="close" size={15} />
              </button>
            </article>
          ))}
        </section>
      )}
      <div className="inspector-service-note">
        <Icon name="clock" size={15} />
        <p>
          Unauthenticated GitHub requests have a shared rate limit. Lookups are
          cached for five minutes on this server.{" "}
          <a
            href="https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api"
            target="_blank"
            rel="noreferrer"
          >
            GitHub API limits
          </a>
        </p>
      </div>
    </main>
  );
}
