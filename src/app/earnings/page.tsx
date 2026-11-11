import Link from "next/link";
import funding from "@/lib/funding.json";
import { PoolCalculator } from "@/components/pool-calculator";
import "./style.css";
export const metadata = { title: "Creator earnings" };
export default function Earnings() {
  return <main id="main" className="inner-page creator-guide">
    <header><h1>Creator earnings</h1><p>Readers can sponsor maintainers directly. DevShare’s proposed subscription pool is open for review.</p></header>
    <section className="sponsor-index"><h2>Support a maintainer</h2><p>These repositories name a GitHub Sponsors account in their funding file. Open a project to choose a maintainer. GitHub handles the sponsorship.</p>
    <details><summary>Browse {Object.keys(funding).length} projects with sponsor links</summary><ul>{Object.keys(funding).sort().map(name => <li key={name}><Link href={'/directory/' + name}>{name}</Link></li>)}</ul></details></section>
    <PoolCalculator/>
    <section className="pool-rules"><h2>How the example works</h2><ol><li><strong>Close the month.</strong> Deduct refunds, collected tax and processing fees from subscription receipts. Set aside half of the positive remainder for creators.</li><li><strong>Count eligible activity.</strong> In this model, each verified reader counts once per creator per UTC day. Self-activity and flagged records are excluded.</li><li><strong>Divide the pool.</strong> A creator receives the same fraction of the pool as their fraction of eligible activity. With no eligible activity, the pool stays unallocated.</li></ol><p>This is a proposed allocation rule. Platform subscriptions, balances and payouts are inactive.</p><Link href="/for-developers">Submit your repository →</Link></section>
  </main>;
}
