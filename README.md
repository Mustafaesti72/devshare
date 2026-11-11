# DevShare research workbench

A local Next.js App Router application for finding and researching developer projects. DevShare remains a working name.

## Run

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Reuse an existing development server for this checkout.

## Checks

```sh
npm run lint
npm run test:unit
npm run build
# Requires the local server above:
npm run test:smoke
```

## Product functions

- Discovery: original interface previews, project quick views, filters, sorting, grid/list, shareable filter URLs, featured collection switching.
- Command search: Cmd/Ctrl+K, keyboard navigation, project and page results.
- Research library: saved projects, decision status, private notes, list/board views persisted in this browser.
- Personal collections: create/edit, cover colors, add/remove sample projects or real GitHub source snapshots, archive and restore.
- Public GitHub inspector: reads real public repository metadata from api.github.com without authentication, shows source timestamp and genuine missing-data states. Saves source references into the research library and collections.
- Project/creator pages: detailed sample content, collection actions, notes, local creator following.
- Creator studio and publishing sandbox: still demo-only, with no earnings or payment rights.
- Responsive layout, light/dark themes, focus management, native modal dialogs, reduced-motion support, and explicit noindex for preview data.

## Important boundaries

The six catalog projects and their illustrated interfaces, maintainers, metrics, and licenses are fictional. The separate GitHub inspector reads real public metadata and labels it as such. A public source reference is not a creator publication, ownership verification, license grant, or security assessment.

User research data is stored in localStorage on this device. There is no account sync. GitHub public metadata is cached in process memory for five minutes. The read-only proxy has a shared per-process upstream request budget and concurrency limit; production use needs distributed rate limiting and observability. It rejects arbitrary hosts, credentials, extra URL paths and redirects, and applies an upstream timeout. No token or secret is needed or collected.

OAuth account sync, PostgreSQL, subscriptions, AI analysis and payouts remain unconnected. Repository ownership verification, durable submission storage and operator moderation are available. No money is billed or accrued.

Architecture: docs/FOUNDATION.md. Iteration record: docs/WORKBENCH.md.

## Public directory and submissions

The homepage contains 52 dated GitHub snapshots. The inspector fetches current metadata. Source briefs identify the upstream project and link to its README. The sample catalog remains available at /explore.

On /for-developers a maintainer can request a 15-minute challenge for a personal public repository. The browser keeps an HTTP-only challenge cookie. The maintainer publishes the phrase in devshare.txt in a GitHub Gist. The server checks the Gist owner's numeric GitHub ID against the repository owner and consumes the challenge in the same transaction that records the submission.

Use Node 24 and a persistent filesystem. The local SQLite database defaults to .data/submissions.sqlite. Set DEVSHARE_DATA_DIR to select a different storage directory. From the project directory, run node scripts/review.mjs to read pending submissions, node scripts/review.mjs approved ID after editorial review, or node scripts/review.mjs hidden ID to withdraw a listing. Approval adds the submitted description and source link to the homepage. This release uses personal repository verification and local operator moderation. Organization permissions, OAuth account sync and live payments require further work.


## Railway deployment

Use Node 24. The Dockerfile builds the app and  .railway/railway.ts checks /api/health before accepting traffic. Mount one persistent volume at /data, set DEVSHARE_DATA_DIR=/data, PORT=3000, APP_URL to the public HTTPS origin and ALLOW_INDEXING=true. Set APP_URL before the build because metadata and sitemap routes are prerendered. Use one service replica with SQLite. Local .data files, environment secrets and node_modules are excluded from uploads.

Submissions require editorial approval. From a Railway service shell, run node scripts/review.mjs to list pending submissions and node scripts/review.mjs approved ID to publish a reviewed listing. Back up the persistent SQLite files using a SQLite-aware backup process before moving storage.

The public directory contains real upstream repository snapshots. The separate demo catalog contains fictional examples. Reader saves stay in the browser. Payments are inactive. Six editorial guides are available at /blog.


## Production storage

Railway Postgres stores repository ownership challenges, submissions and moderation records. DATABASE_URL uses the private Postgres connection. Startup initializes the schema under an advisory lock and imports the previous SQLite records once, in a transaction. The previous SQLite file stays on /data for recovery. Local development without DATABASE_URL continues to use SQLite.

Railway devshare-assets stores the 52 catalog PNGs under owners/. The application reads them through /api/media/[name] with a catalog allowlist, cache headers and conditional requests. Bucket credentials stay on the server. Run npm run assets:sync to upload and byte-verify the catalog images. User-provided image uploads are not exposed by this release.

Run node scripts/check-storage.mjs inside the deployed service to test PostgreSQL concurrency and moderation in an isolated temporary schema, and to verify a bucket image. The temporary schema is removed after the check. Run node scripts/review.mjs inside the service to moderate real submissions.
