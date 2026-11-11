"use client";
import Link from "next/link";
import { projects, projectPath, type Project } from "@/lib/catalog";
import { useWorkspace } from "./workspace";
import { ProjectMark } from "./project-card";
import { Icon } from "./icon";
const rows: [string, (p: Project) => string][] = [
  ["Category", (p) => p.topic],
  ["Language", (p) => p.language],
  ["License example", (p) => p.license],
  ["Purpose", (p) => p.description],
  ["Included", (p) => p.features.join(" · ")],
  ["Sample update", (p) => p.updated],
  ["Source verification", () => "Not verified · Fictional sample"],
];
export function Comparison() {
  const { compared, toggleCompare, clearCompare } = useWorkspace();
  const list = projects.filter((p) => compared.includes(p.id));
  return (
    <main id="main" className="inner-page">
      <div className="page-heading">
        <div>
          <div className="section-kicker">SIDE BY SIDE</div>
          <h1>Make a considered choice.</h1>
          <p>Compare the details that matter for your project.</p>
        </div>
        {list.length > 0 && (
          <button className="btn" onClick={clearCompare}>
            Clear selection
          </button>
        )}
      </div>
      {!list.length ? (
        <div className="empty-state">
          <span className="empty-state-icon">
            <Icon name="compare" size={25} />
          </span>
          <h2>Start with a shortlist.</h2>
          <p>Select “Compare” on up to three project cards.</p>
          <Link className="btn primary" href="/explore">
            Browse projects
          </Link>
        </div>
      ) : (
        <>
          <div className="comparison-scroll">
            <table className="comparison-table">
              <caption className="sr-only">Sample project comparison</caption>
              <thead>
                <tr>
                  <th scope="col">
                    PROJECT OVERVIEW<span>Sample data</span>
                  </th>
                  {list.map((p) => (
                    <th scope="col" key={p.id}>
                      <button
                        className="icon-button compare-remove"
                        aria-label={`Remove ${p.name} from comparison`}
                        onClick={() => toggleCompare(p.id)}
                      >
                        <Icon name="close" size={14} />
                      </button>
                      <ProjectMark project={p} />
                      <Link href={projectPath(p)}>{p.name}</Link>
                      <small>{p.tagline}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, get]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    {list.map((p) => (
                      <td key={p.id}>{get(p)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="notice-inline">
            <Icon name="shield" size={18} />
            <p>
              This comparison uses the sample catalog. It is a structured
              summary, not an AI analysis or a security assessment.
            </p>
          </div>
          {list.length < 3 && (
            <Link className="btn" href="/explore">
              <Icon name="plus" size={15} />
              Add another project
            </Link>
          )}
        </>
      )}
    </main>
  );
}
