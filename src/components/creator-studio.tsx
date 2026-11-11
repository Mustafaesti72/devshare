"use client";
import Link from "next/link";
import { useState } from "react";
import { projects, topics, projectPath } from "@/lib/catalog";
import { ProjectMark } from "./project-card";
import { Icon } from "./icon";
import { useWorkspace } from "./workspace";
export function CreatorStudio() {
  const [range, setRange] = useState("7");
  const [view, setView] = useState("overview");
  const { notify } = useWorkspace();
  const series =
    range === "7"
      ? [120, 164, 138, 220, 172, 246, 188]
      : [214, 267, 312, 241, 390, 285, 421, 307, 452, 328, 498, 379, 361, 371];
  const total = series.reduce((sum, v) => sum + v, 0);
  const chartMax = Math.ceil(Math.max(...series) / 100) * 100;
  const tableData =
    range === "7"
      ? [
          [824, 42, 138],
          [424, 19, 76],
        ]
      : [
          [3140, 143, 520],
          [1686, 75, 272],
        ];
  function download() {
    const blob = new Blob(
      [
        `Demo data only. Not verified activity.\nproject,views,saves,outbound\n${["Formwork", "Patchwork"].map((name, i) => [name, ...tableData[i]].join(",")).join("\n")}\n`,
      ],
      { type: "text/csv;charset=utf-8;" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "demo-creator-analytics.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify("Sample analytics exported. This file contains demo data.");
  }
  return (
    <main id="main" className="inner-page studio-page">
      <div className="page-heading">
        <div>
          <div className="section-kicker">CREATOR STUDIO · DEMO WORKSPACE</div>
          <h1>A closer look at your work.</h1>
          <p>See the discovery journey from a project page to its source.</p>
        </div>
        <Link className="btn primary" href="/for-developers">
          <Icon name="plus" size={15} />
          Add project
        </Link>
      </div>
      <div className="studio-toolbar">
        <div className="catalog-tabs">
          {["overview", "projects", "earnings"].map((t) => (
            <button
              key={t}
              className={view === t ? "active" : ""}
              aria-pressed={view === t}
              onClick={() => setView(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="studio-range">
          <label className="sr-only" htmlFor="range">
            Analytics date range
          </label>
          <select
            id="range"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
          <button className="btn small" onClick={download}>
            <Icon name="external" size={13} />
            Export sample CSV
          </button>
        </div>
      </div>
      {view === "earnings" ? (
        <div className="earnings-state">
          <span className="empty-state-icon">
            <Icon name="shield" size={27} />
          </span>
          <div className="section-kicker">REVENUE SHARING · NOT ACTIVE</div>
          <h2>Earnings will need a real revenue pool.</h2>
          <p>
            No money is accruing in this preview. Payouts require a validated
            business model, an eligible payment partner, identity checks, and
            fraud review.
          </p>
          <div className="earnings-checklist">
            <span>
              <Icon name="clock" size={16} />
              Net revenue definition
            </span>
            <span>
              <Icon name="clock" size={16} />
              Country and identity eligibility
            </span>
            <span>
              <Icon name="clock" size={16} />
              Monthly reconciliation and disputes
            </span>
          </div>
          <Link className="btn" href="/earnings">
            Explore sponsorships and estimate a share
          </Link>
        </div>
      ) : (
        <>
          {view === "overview" && (
            <>
              <div className="metrics-grid">
                {[
                  [
                    "Project views",
                    total.toLocaleString("en-US"),
                    "Page visits in the sample period",
                    "compass",
                  ],
                  [
                    "Project saves",
                    range === "7" ? "61" : "218",
                    "Illustrative save events",
                    "bookmark",
                  ],
                  [
                    "Source visits",
                    range === "7" ? "214" : "792",
                    "Illustrative outbound clicks",
                    "external",
                  ],
                  [
                    "Published projects",
                    "2",
                    "Example creator catalog",
                    "code",
                  ],
                ].map(([title, value, note, icon]) => (
                  <article className="metric-card" key={title}>
                    <div>
                      <span>{title}</span>
                      <Icon name={icon as "code"} size={16} />
                    </div>
                    <strong>{value}</strong>
                    <p>{note}</p>
                    <span className="metric-demo">DEMO</span>
                  </article>
                ))}
              </div>
              <div className="analytics-layout">
                <section className="analytics-chart">
                  <div className="panel-title">
                    <div>
                      <h2>Discovery over time</h2>
                      <p>Illustrative project views, not verified traffic.</p>
                    </div>
                    <span className="chart-legend">
                      <i />
                      Project views
                    </span>
                  </div>
                  <div
                    className="bar-chart"
                    role="img"
                    aria-label={`Sample chart with ${series.length} bars. All values are illustrative.`}
                  >
                    <div className="chart-y">
                      {[1, 0.75, 0.5, 0.25, 0].map((ratio) => (
                        <span key={ratio}>{chartMax * ratio}</span>
                      ))}
                    </div>
                    <div className="chart-bars">
                      {series.map((v, i) => (
                        <div key={i} className="bar-slot">
                          <div
                            style={{ height: `${(v / chartMax) * 100}%` }}
                            title={`Sample interval ${i + 1}: ${v} views`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="chart-x">
                    <span>Start of sample period</span>
                    <span>End of sample period</span>
                  </div>
                </section>
                <section className="traffic-panel">
                  <div className="panel-title">
                    <div>
                      <h2>Where people found you</h2>
                      <p>Sample traffic sources.</p>
                    </div>
                  </div>
                  {[
                    ["Directory", "46%", 46],
                    ["Direct", "28%", 28],
                    ["Search", "18%", 18],
                    ["Other", "8%", 8],
                  ].map(([name, label, v]) => (
                    <div className="traffic-row" key={name}>
                      <div>
                        <span>{name}</span>
                        <b>{label}</b>
                      </div>
                      <div className="traffic-track">
                        <i style={{ width: `${v}%` }} />
                      </div>
                    </div>
                  ))}
                </section>
              </div>
            </>
          )}
          <section className="project-performance">
            <div className="panel-title">
              <div>
                <h2>Your projects</h2>
                <p>Example listings belonging to studio-example.</p>
              </div>
              <span className="tiny-badge">SAMPLE DATA</span>
            </div>
            <div className="performance-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Views</th>
                    <th>Saves</th>
                    <th>Source visits</th>
                    <th>Status</th>
                    <th>
                      <span className="sr-only">Open project</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[projects[0], projects[4]].map((p, i) => (
                    <tr key={p.id}>
                      <td>
                        <Link href={projectPath(p)}>
                          <ProjectMark project={p} />
                          <span>
                            <b>{p.name}</b>
                            <small>{p.topic}</small>
                          </span>
                        </Link>
                      </td>
                      <td>{tableData[i][0].toLocaleString("en-US")}</td>
                      <td>{tableData[i][1]}</td>
                      <td>{tableData[i][2]}</td>
                      <td>
                        <span className="status-pill">Demo listing</span>
                      </td>
                      <td>
                        <Link
                          href={projectPath(p)}
                          aria-label={`Open ${p.name}`}
                        >
                          <Icon name="external" size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
      <div className="notice-inline">
        <Icon name="shield" size={17} />
        <p>
          All analytics in this workspace are sample data. Views are not
          revenue, and this preview creates no payment entitlement.
        </p>
      </div>
    </main>
  );
}
export function CreatorOnboarding() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState("formwork");
  const [name, setName] = useState("Formwork");
  const [description, setDescription] = useState(projects[0].description);
  const [topic, setTopic] = useState<string>("UI libraries");
  const [complete, setComplete] = useState(false);
  const { notify } = useWorkspace();
  const repo = projects.find((p) => p.id === selected)!;
  function select(id: string) {
    const p = projects.find((p) => p.id === id)!;
    setSelected(id);
    setName(p.name);
    setDescription(p.description);
    setTopic(p.topic);
  }
  return (
    <main id="main" className="inner-page onboarding-page">
      <div className="page-heading">
        <div>
          <div className="section-kicker">FOR DEVELOPERS</div>
          <h1>Give your project some context.</h1>
          <p>
            Try the publishing flow with a sample repository. Your GitHub
            account stays untouched.
          </p>
        </div>
        <Link href="/dashboard" className="btn">
          Creator studio <Icon name="arrow" size={15} />
        </Link>
      </div>
      <div className="onboarding-layout">
        <aside className="onboarding-guide">
          <div className="section-kicker">PUBLISH A PROJECT</div>
          {[
            ["Connect GitHub", "Confirm who owns the work."],
            ["Choose a repository", "Start with a public project."],
            ["Prepare the listing", "Explain who it’s useful for."],
            ["Review", "Check the details before publishing."],
          ].map(([title, text], i) => (
            <div
              className={`onboarding-step ${step === i ? "current" : ""} ${step > i ? "done" : ""}`}
              key={title}
            >
              <span>
                {step > i ? (
                  <Icon name="check" size={14} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              <div>
                <b>{title}</b>
                <p>{text}</p>
              </div>
            </div>
          ))}
          <div className="creator-policy">
            <Icon name="shield" size={20} />
            <h3>Your source stays yours.</h3>
            <p>
              Real imports will preserve your repository link and license.
              Publishing will require verified ownership.
            </p>
          </div>
        </aside>
        <section className="onboarding-panel" key={step}>
          {complete ? (
            <div className="onboarding-complete">
              <span className="empty-state-icon">
                <Icon name="check" size={27} />
              </span>
              <h2>Your preview is ready.</h2>
              <p>
                You completed the sample publishing flow. Nothing has been
                imported or published to a server.
              </p>
              <Link className="btn primary" href={projectPath(repo)}>
                View sample project <Icon name="arrow" size={15} />
              </Link>
              <button
                className="plain-button"
                onClick={() => {
                  setStep(0);
                  setComplete(false);
                }}
              >
                Start over
              </button>
            </div>
          ) : (
            <>
              <div className="step-heading">
                <span className="tiny-badge">SANDBOX</span>
                <span>STEP {step + 1} OF 4</span>
              </div>
              {step === 0 ? (
                <>
                  <div className="connect-symbol">
                    <Icon name="git" size={27} />
                  </div>
                  <h2>Start with the source.</h2>
                  <p className="onboarding-description">
                    A connected account will let us verify ownership and list
                    your public repositories. For now, try the flow with a
                    fictional GitHub account.
                  </p>
                  <div className="permission-summary">
                    <h3>For a real connection</h3>
                    <span>
                      <Icon name="check" size={15} />
                      Read public repository metadata
                    </span>
                    <span>
                      <Icon name="check" size={15} />
                      Verify the repository owner
                    </span>
                    <span>
                      <Icon name="shield" size={15} />
                      No permission to push code
                    </span>
                  </div>
                  <button
                    className="btn primary"
                    onClick={() => {
                      setStep(1);
                      notify(
                        "Sample account selected. No GitHub connection was made.",
                      );
                    }}
                  >
                    Continue with sample account <Icon name="arrow" size={15} />
                  </button>
                  <p className="onboarding-help">
                    GitHub OAuth is not configured. No credentials are
                    requested.
                  </p>
                </>
              ) : step === 1 ? (
                <>
                  <h2>Choose the work you want to share.</h2>
                  <p className="onboarding-description">
                    These repositories are fictional examples for this preview.
                  </p>
                  <div
                    className="repo-picker"
                    role="radiogroup"
                    aria-label="Sample repository"
                  >
                    {[projects[0], projects[4]].map((p) => (
                      <button
                        role="radio"
                        aria-checked={selected === p.id}
                        key={p.id}
                        className={selected === p.id ? "selected" : ""}
                        onClick={() => select(p.id)}
                      >
                        <ProjectMark project={p} />
                        <div>
                          <b>
                            {p.owner}/{p.id}
                          </b>
                          <span>
                            {p.language} · {p.license} · Sample public
                            repository
                          </span>
                        </div>
                        <span className="radio-indicator">
                          {selected === p.id && <i />}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : step === 2 ? (
                <>
                  <h2>Make it easy to understand.</h2>
                  <p className="onboarding-description">
                    Tell a developer what the project does before they open the
                    source.
                  </p>
                  <form
                    id="listing-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setStep(3);
                    }}
                    className="listing-form"
                  >
                    <label htmlFor="project-name">
                      Project name
                      <input
                        id="project-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        maxLength={60}
                      />
                    </label>
                    <label htmlFor="project-description">
                      Original description
                      <textarea
                        id="project-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        minLength={40}
                        maxLength={500}
                        rows={5}
                      />
                      <span className="field-hint">
                        {description.length}/500 · At least 40 characters
                      </span>
                    </label>
                    <label htmlFor="project-category">
                      Category
                      <select
                        id="project-category"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                      >
                        {topics.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </label>
                  </form>
                </>
              ) : (
                <>
                  <h2>Take one last look.</h2>
                  <p className="onboarding-description">
                    This is a local preview. Completing this step will not
                    publish a real project.
                  </p>
                  <div className="listing-preview">
                    <div>
                      <ProjectMark project={repo} />
                      <span>
                        <b>{name}</b>
                        <small>
                          {repo.owner}/{repo.id}
                        </small>
                      </span>
                      <span className="tiny-badge">DEMO</span>
                    </div>
                    <p>{description}</p>
                    <div className="project-tags">
                      <span>{topic}</span>
                      <span>{repo.language}</span>
                      <span>{repo.license}</span>
                    </div>
                  </div>
                  <div className="review-checks">
                    <span>
                      <Icon name="check" size={15} />
                      Original description added
                    </span>
                    <span>
                      <Icon name="check" size={15} />
                      Source and license displayed
                    </span>
                    <span>
                      <Icon name="clock" size={15} />
                      Real ownership verification not performed
                    </span>
                  </div>
                </>
              )}
              {step > 0 && (
                <div className="onboarding-navigation">
                  <button className="btn" onClick={() => setStep(step - 1)}>
                    Back
                  </button>
                  {step === 2 ? (
                    <button
                      className="btn primary"
                      type="submit"
                      form="listing-form"
                    >
                      Review listing <Icon name="arrow" size={15} />
                    </button>
                  ) : (
                    <button
                      className="btn primary"
                      onClick={() =>
                        step === 3 ? setComplete(true) : setStep(step + 1)
                      }
                    >
                      {step === 3 ? "Complete demo" : "Continue"}
                      <Icon name="arrow" size={15} />
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
