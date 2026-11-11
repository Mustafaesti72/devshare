"use client";
import { useState } from "react";
import { allocate, type Receipts } from "@/lib/revenue";

const money = (cents: number) => (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
const fields = { gross: "Paid subscriptions", refunds: "Refunds", tax: "Tax collected", fees: "Processing fees" } as const;
export function PoolCalculator() {
  const [amounts, setAmounts] = useState({ gross: "1000", refunds: "50", tax: "100", fees: "30" });
  const [share, setShare] = useState(10);
  const keys = Object.keys(fields) as (keyof Receipts)[];
  const valid = keys.every(k => /^\d{1,8}(\.\d{1,2})?$/.test(amounts[k]));
  const cents = Object.fromEntries(keys.map(k => [k, Math.round(Number(amounts[k]) * 100)])) as Receipts;
  const result = valid ? allocate(cents, [{ creator: "you", units: share }, { creator: "others", units: 100 - share }]) : null;
  return <section className="pool-sheet" aria-labelledby="pool-heading">
    <header><span>Monthly worksheet · USD</span><h2 id="pool-heading">Estimate a creator share</h2><p>Change the example receipts and your share of eligible activity.</p></header>
    <div className="pool-columns"><div className="pool-fields">{keys.map(k => <label key={k}>{fields[k]}<input inputMode="decimal" value={amounts[k]} onChange={e => setAmounts({ ...amounts, [k]: e.target.value })}/></label>)}
    <label className="pool-slider">Your share of activity <b>{share}%</b><input type="range" min="0" max="100" value={share} onChange={e => setShare(Number(e.target.value))}/></label></div>
    <div className="pool-receipt" aria-live="polite">{result ? <><span>Your example share</span><strong>{money(result.allocations.find(r => r.creator === "you")!.cents)}</strong>
    <dl><div><dt>Net receipts</dt><dd>{money(result.net)}</dd></div><div><dt>Creator pool · 50%</dt><dd>{money(result.pool)}</dd></div><div><dt>Platform share</dt><dd>{money(result.retained)}</dd></div></dl></> : <p>Enter a positive amount or zero with up to two decimal places in each field.</p>}</div></div>
  </section>;
}
