# Creator revenue

The directory displays GitHub Sponsors usernames from repository-owned funding files. The snapshot in src/lib/funding.json records the source for every listing. A repository may specify several recipients. Opening one of these links takes the reader to GitHub. DevShare has no record of that user's payments.

## Monthly rehearsal

Run npm run revenue:rehearse -- /path/to/month.json with Node 24. Use synthetic reader and creator identifiers. Store fixtures outside the public directory. Example input:

```json
{
  "month": "2026-10",
  "currency": "USD",
  "receipts": { "gross": 100000, "refunds": 5000, "tax": 10000, "fees": 3000 },
  "events": [
    { "actor": "reader-1", "creator": "maker-a", "day": "2026-10-01", "verified": true, "flagged": false }
  ]
}
```

Amounts are integer cents. This example yields 82,000 cents net and a 41,000-cent creator pool. A reader can count once per creator per UTC day. Actor and creator identifiers must use the same identity namespace. The rehearsal consumes already-classified fixture records. Browser saves and page views do not feed it. The largest fractional remainders receive leftover cents, with creator ID as the tie-break. The platform retains the odd cent when positive net receipts are odd.

Each month has one reproducible summary in DEVSHARE_DATA_DIR/rehearsals.sqlite (default .data). Repeating the same monthly totals is safe. A different result for a closed month exits with an error. Use a separate data directory for alternate scenarios. Summaries contain creator IDs and aggregate units. Keep the original input privately if an independent replay is needed.

## Before accepting money

Choose the operator and supported markets, confirm provider eligibility and settle the commercial terms. Production receipts need authenticated provider events, refund and dispute reconciliation, and an agreed reserve policy. Creator payouts require onboarding, eligibility decisions, abuse controls, a payable ledger and transfer reconciliation. The rehearsal does not create payables.
