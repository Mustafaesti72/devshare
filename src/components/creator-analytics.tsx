import Link from "next/link";
import type { Analytics } from "@/lib/engagement.mjs";
export function CreatorAnalytics({
  data,
  days,
}: {
  data: Analytics;
  days: number;
}) {
  const peak = Math.max(
    1,
    ...data.daily.map((row) => Math.max(row.views, row.outbound)),
  );
  return (
    <section className="creator-analytics" aria-labelledby="analytics-heading">
      <header className="account-heading">
        <h2 id="analytics-heading">Project activity</h2>
        <nav className="analytics-periods" aria-label="Activity period">
          {[1, 7, 30].map((period) => (
            <Link
              key={period}
              href={"/dashboard?period=" + period}
              aria-current={period === days ? "page" : undefined}
            >
              {period === 1 ? "Today" : period + " days"}
            </Link>
          ))}
        </nav>
      </header>
      <div className="analytics-metrics">
        {[
          ["Visits", data.period.views],
          ["GitHub clicks", data.period.outbound],
          ["Followers", data.followers],
          ["All-time visits", data.allTime.views],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{Number(value).toLocaleString("en-US")}</strong>
          </div>
        ))}
      </div>
      <figure className="analytics-chart">
        <figcaption>Daily activity · UTC</figcaption>
        <div
          className="analytics-bars"
          role="img"
          aria-label={
            data.period.views +
            " recorded visits and " +
            data.period.outbound +
            " repository clicks over " +
            days +
            " days"
          }
        >
          {data.daily.map((row) => (
            <div
              key={row.day}
              title={
                row.day +
                " · " +
                row.views +
                " visits · " +
                row.outbound +
                " GitHub clicks"
              }
            >
              <i style={{ height: Math.max(1, (row.views / peak) * 110) }} />
              <b style={{ height: Math.max(1, (row.outbound / peak) * 110) }} />
            </div>
          ))}
        </div>
        <small>Visits · GitHub clicks</small>
      </figure>
      <details>
        <summary>Daily counts</summary>
        <div className="analytics-table">
          <table>
            <thead>
              <tr>
                <th>Date · UTC</th>
                <th>Visits</th>
                <th>GitHub clicks</th>
              </tr>
            </thead>
            <tbody>
              {data.daily.map((row) => (
                <tr key={row.day}>
                  <td>{row.day}</td>
                  <td>{row.views}</td>
                  <td>{row.outbound}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      {data.projects.length > 0 && (
        <div className="analytics-table">
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Visits</th>
                <th>Estimated visitors</th>
                <th>GitHub clicks</th>
                <th>Current saves</th>
              </tr>
            </thead>
            <tbody>
              {data.projects.map((project) => (
                <tr key={project.id}>
                  <td>{project.full_name}</td>
                  <td>{project.views}</td>
                  <td>{project.visitors}</td>
                  <td>{project.outbound}</td>
                  <td>{project.saves}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="account-note">
        Counts include visitors who allow analytics. Visits and clicks are
        deduplicated per project, browser session and UTC day. Visitor estimates
        use project-scoped, rotating identifiers.
      </p>
      {data.sources.length > 0 && (
        <div>
          <h3>Referrer categories</h3>
          <ul>
            {data.sources.map((source) => (
              <li key={source.source}>
                {source.source} · {source.visits}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
