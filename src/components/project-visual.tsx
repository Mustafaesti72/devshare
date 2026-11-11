import { type Project } from "@/lib/catalog";
export function ProjectVisual({
  project: p,
  large = false,
}: {
  project: Project;
  large?: boolean;
}) {
  return (
    <div
      className={`project-visual visual-${p.id} ${large ? "visual-large" : ""}`}
      aria-hidden="true"
    >
      <div className="mini-window">
        <div className="mini-window-bar">
          <i />
          <i />
          <i />
          <span>
            {p.id === "formwork"
              ? "Create your account"
              : p.id === "relaykit"
                ? "Worker / jobs"
                : p.id === "indexroom"
                  ? "Workspace search"
                  : p.id === "dockyard"
                    ? "Acme / overview"
                    : p.id === "patchwork"
                      ? "API / diff review"
                      : "Events / pipeline"}
          </span>
        </div>
        {p.id === "formwork" ? (
          <div className="mini-form">
            <span>Workspace name</span>
            <div>
              Acme Studio <b>✓</b>
            </div>
            <span>Contact email</span>
            <div>hello@acme.example</div>
            <div className="mini-form-button">
              Create workspace <b>↗</b>
            </div>
          </div>
        ) : p.id === "relaykit" ? (
          <div className="mini-jobs">
            {["invoice.created", "email.deliver", "report.generate"].map(
              (v, i) => (
                <div key={v}>
                  <i />
                  <code>{v}</code>
                  <span>{i === 1 ? "running" : "completed"}</span>
                  <small>{i === 1 ? "…" : "124ms"}</small>
                </div>
              ),
            )}
            <div className="mini-job-foot">
              <span>3 workers online</span>
              <b>All systems operational</b>
            </div>
          </div>
        ) : p.id === "indexroom" ? (
          <div className="mini-search-ui">
            <div>
              ⌕ <span>How do we deploy a new service?</span>
            </div>
            <small>3 matching sources</small>
            <article>
              <b>Deployment guide</b>
              <p>Services are deployed from the main branch…</p>
              <span>docs / infrastructure.md</span>
            </article>
            <article>
              <b>Release checklist</b>
              <p>Before a production release, check…</p>
            </article>
          </div>
        ) : p.id === "dockyard" ? (
          <div className="mini-dashboard">
            <aside>
              <i />
              <i />
              <i />
              <i />
            </aside>
            <section>
              <span>Good morning, Alex</span>
              <div className="mini-dashboard-stats">
                <b>
                  1,284<small>ACTIVE USERS</small>
                </b>
                <b>
                  84<small>WORKSPACES</small>
                </b>
              </div>
              <div className="mini-chart">
                {[26, 42, 33, 60, 48, 70, 58, 85, 78, 94].map((v, i) => (
                  <i key={i} style={{ height: `${v}%` }} />
                ))}
              </div>
            </section>
          </div>
        ) : p.id === "patchwork" ? (
          <div className="mini-diff">
            <div>
              <span>api/schema.yaml</span>
              <b>+12 −4</b>
            </div>
            <code>
              <span> paths:</span>
              <em>− /users: string[]</em>
              <strong>+ /users: User[]</strong>
              <span> responses:</span>
              <strong>+ 200: UserResponse</strong>
            </code>
            <small>1 breaking change requires review</small>
          </div>
        ) : (
          <div className="mini-pipeline">
            <div>
              <span>INGEST</span>
              <b>events</b>
              <i>→</i>
              <span>TRANSFORM</span>
              <b>validate</b>
              <i>→</i>
              <span>OUTPUT</span>
              <b>warehouse</b>
            </div>
            <code>
              SELECT event_type, count(*)
              <br />
              FROM application_events
              <br />
              GROUP BY event_type;
            </code>
            <small>Last batch · 2.4k events processed</small>
          </div>
        )}
      </div>
      <span className="visual-caption">INTERFACE STUDY / SAMPLE PROJECT</span>
    </div>
  );
}
