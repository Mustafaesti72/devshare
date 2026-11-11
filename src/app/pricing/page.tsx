import Link from "next/link";
import { Icon } from "@/components/icon";
export const metadata = { title: "Plans and roadmap" };
export default function Plans() {
  return (
    <main id="main" className="inner-page plans-page">
      <div className="section-kicker">PLANS & ROADMAP</div>
      <h1>Useful tools for choosing well.</h1>
      <p className="page-intro">
        Public discovery will stay free. Paid plans will focus on research tools
        and team workflows. Pricing is still being tested.
      </p>
      <div className="pricing-grid">
        {[
          {
            name: "Explorer",
            label: "PUBLIC DISCOVERY",
            price: "Free",
            note: "The foundation",
            features: [
              "Public project pages",
              "Keyword and category search",
              "Saved project library",
              "Curated collections",
            ],
            cta: "Explore the preview",
            href: "/",
            state: "Preview available",
          },
          {
            name: "Pro",
            label: "FOR INDIVIDUAL DEVELOPERS",
            price: "Planned",
            note: "Price to be validated",
            features: [
              "Semantic project search",
              "Source-linked AI summaries",
              "Repository comparisons",
              "Private collections and alerts",
            ],
            cta: "See comparison preview",
            href: "/compare",
            state: "Not yet available",
          },
          {
            name: "Teams",
            label: "FOR PEOPLE BUILDING TOGETHER",
            price: "Later",
            note: "After individual workflows",
            features: [
              "Shared research workspace",
              "Team shortlists",
              "Usage and access controls",
              "Centralized billing",
            ],
            cta: "Explore collections",
            href: "/collections",
            state: "Future roadmap",
          },
        ].map((plan, i) => (
          <article
            className={`pricing-card ${i === 1 ? "emphasized" : ""}`}
            key={plan.name}
          >
            <div className="section-kicker">{plan.label}</div>
            <h2>{plan.name}</h2>
            <strong>{plan.price}</strong>
            <p>{plan.note}</p>
            <span className="status-pill">{plan.state}</span>
            <ul>
              {plan.features.map((f) => (
                <li key={f}>
                  <Icon name="check" size={15} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={plan.href}
              className={`btn full ${i === 1 ? "primary" : ""}`}
            >
              {plan.cta}
              <Icon name="arrow" size={14} />
            </Link>
          </article>
        ))}
      </div>
      <div className="pricing-bottom">
        <section>
          <div className="section-kicker">CREATOR REVENUE SHARING</div>
          <h2>A pool with clear rules.</h2>
          <p>
            The intended model shares eligible net revenue with verified
            creators. The allocation formula, reserves, eligibility, and payment
            partners still need validation. Page views alone will not create a
            fixed payment.
          </p>
          <Link className="back-link" href="/earnings">
            Explore the creator earnings model{" "}
            <Icon name="arrow" size={14} />
          </Link>
        </section>
        <section className="faq-list">
          <details>
            <summary>Can I use the source for free?</summary>
            <p>
              Directory listings link to the original repository. Its license
              determines what you can do with the source.
            </p>
          </details>
          <details>
            <summary>Is anything being billed now?</summary>
            <p>
              No. This preview has no checkout, subscription, or payout
              connection.
            </p>
          </details>
          <details>
            <summary>Are AI summaries available?</summary>
            <p>
              No AI provider is connected. The current comparison screen shows
              structured sample metadata.
            </p>
          </details>
          <details>
            <summary>Where are my saved projects stored?</summary>
            <p>
              In this browser’s local storage. Saves are not synced to an
              account or another device.
            </p>
          </details>
        </section>
      </div>
    </main>
  );
}
