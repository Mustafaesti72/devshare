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
- Creator dashboard, public profiles, verified repository submissions, cover uploads and operator moderation.
- Responsive layout, light/dark themes, focus management, native modal dialogs, reduced-motion support, and explicit noindex for preview data.

## Important boundaries

The six catalog projects and their illustrated interfaces, maintainers, metrics, and licenses are fictional. The separate GitHub inspector reads real public metadata and labels it as such. A public source reference is not a creator publication, ownership verification, license grant, or security assessment.

Signed-in research data syncs to PostgreSQL with an account-scoped browser cache. Anonymous data stays in localStorage. GitHub public metadata is cached in process memory for five minutes. The read-only proxy has a shared per-process upstream request budget and concurrency limit; production use needs distributed rate limiting and observability. It rejects arbitrary hosts, credentials, extra URL paths and redirects, and applies an upstream timeout. No token or secret is needed or collected.

Subscriptions, AI analysis and payouts remain unconnected. Repository ownership verification, durable submission storage and operator moderation are available. No money is billed or accrued.

Architecture: docs/FOUNDATION.md. Iteration record: docs/WORKBENCH.md.

## Public directory and submissions

The homepage contains 52 dated GitHub snapshots. The inspector fetches current metadata. Source briefs identify the upstream project and link to its README. Explore, category pages and the most-starred list use these real repositories and approved maintainer publications.

On /for-developers a maintainer can request a 15-minute challenge for a personal public repository. The browser keeps an HTTP-only challenge cookie. The maintainer publishes the phrase in devshare.txt in a GitHub Gist. The server checks the Gist owner's numeric GitHub ID against the repository owner and consumes the challenge in the same transaction that records the submission.

Use Node 24 and a persistent filesystem. The local SQLite database defaults to .data/submissions.sqlite. Set DEVSHARE_DATA_DIR to select a different storage directory. From the project directory, run node scripts/review.mjs to read pending submissions, node scripts/review.mjs approved ID after editorial review, or node scripts/review.mjs hidden ID to withdraw a listing. Approval adds the submitted description and source link to the homepage. This release uses personal repository verification and local operator moderation. Organization repository permissions and live payments require further work.

## Railway deployment

Use Node 24. The Dockerfile builds the app and .railway/railway.ts checks /api/health before accepting traffic. Mount one persistent volume at /data, set DEVSHARE_DATA_DIR=/data, PORT=3000, APP_URL to the public HTTPS origin and ALLOW_INDEXING=true. Set APP_URL before the build because metadata and sitemap routes are prerendered. Use one service replica with SQLite. Local .data files, environment secrets and node_modules are excluded from uploads.

Submissions require editorial approval. From a Railway service shell, run node scripts/review.mjs to list pending submissions and node scripts/review.mjs approved ID to publish a reviewed listing. Back up the persistent SQLite files using a SQLite-aware backup process before moving storage.

The public directory contains real upstream repository snapshots. The separate demo catalog contains fictional examples. Signed-in reader libraries sync across devices. Payments are inactive. Six editorial guides are available at /blog.

## Production storage

Railway Postgres stores repository ownership challenges, submissions and moderation records. DATABASE_URL uses the private Postgres connection. Startup initializes the schema under an advisory lock and imports the previous SQLite records once, in a transaction. The previous SQLite file stays on /data for recovery. Local development without DATABASE_URL continues to use SQLite.

Railway devshare-assets stores the 52 catalog PNGs under owners/. The application reads them through /api/media/[name] with a catalog allowlist, cache headers and conditional requests. Bucket credentials stay on the server. Run npm run assets:sync to upload and byte-verify the catalog images. Verified repository owners can upload cover images from their dashboard. Cover changes return the project to editorial review.

Run node scripts/check-storage.mjs inside the deployed service to test PostgreSQL concurrency and moderation in an isolated temporary schema, and to verify a bucket image. The temporary schema is removed after the check. Run node scripts/review.mjs inside the service to moderate real submissions.

## Accounts

GitHub OAuth uses state and PKCE (S256), an exact callback URL and public identity access. GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET belong in Railway server variables. The callback exchanges the authorization code, reads the GitHub identity and creates a random session. Provider access tokens are not persisted. Sessions are stored hashed in PostgreSQL and delivered as secure HTTP-only cookies, with 30-day expiry and a ten-device limit.

Users can edit their public profile, submit repositories they own, view review status, sign out on one or all devices and delete their account. Deleting an account removes live profile, sessions, submissions and moderation records for its repositories. Signed-in research data syncs to PostgreSQL. Public member pages use stable UUIDs. Profiles with approved projects can be indexed; empty profiles remain noindex.

## Library sync and moderation

/api/workspace stores account-scoped saves, repository references, notes, collections and follows. Updates merge against the last cloud value under a PostgreSQL transaction. Independent changes merge. Overlapping edits return a conflict and the client asks which version to keep. Offline edits stay in the account's browser cache and retry when the service is reachable.

Set ADMIN_GITHUB_IDS to the numeric GitHub IDs allowed to use /moderation. A review checks the submission revision to prevent publishing a version changed during review. Published projects appear at /showcase/owner/repo, on member profiles and in the sitemap. Hidden listings have no public project page.

Project covers accept still PNG, JPEG or WebP files under 4 MB and 20 megapixels. Sharp converts them to bounded WebP images. Each cover is stored privately in S3-compatible Railway storage. Pending covers are visible to the owner and moderators. Replacement and deletion create durable cleanup entries. Account deletion cascades through private library data and queues cover cleanup.

## Discovery, reports and activity

The directory merges recorded GitHub metadata with approved maintainer publications. Search supports category, language and license; the star ranking explicitly uses dated snapshots. Unspecified licenses are shown as requiring source review.

Signed-in members can privately report projects or profiles. Moderators resolve reports and review profiles from /moderation. Profile hiding also hides its published and pending projects. Profile restoration does not automatically republish those projects. Review notes and reviewer IDs are stored in audit tables, and stale profile revisions are rejected.

Published project pages ask for analytics consent before creating a browser-session identifier or sending an event. Signed page tokens expire after one hour. Receipts prevent token replay and per-project, per-day hashed identifiers deduplicate counts. Dashboards offer today, 7-day and 30-day periods, repository clicks, approximate visitors, current saves and follower counts. No revenue is inferred. Fine-grained records expire after 35 days; daily totals remain. Rate limits use short-lived keyed hashes without storing raw IPs. The background worker prunes records and retries image cleanup every minute.

Run DATABASE_URL=... node --experimental-strip-types scripts/check-mvp.mjs against a PostgreSQL test connection. It creates and verifies its own random schema, exercises actual queries, and drops that schema on completion. It never needs production credentials or S3. scripts/check-storage.mjs separately tests the production adapter in an isolated schema and its own temporary bucket keys.

GOOGLE_SITE_VERIFICATION supplies the public Search Console HTML-tag token at build time. Set it before rebuilding. The sitemap includes real catalog projects, reviewed community projects, populated public profiles, four categories, the star ranking, guides and reading lists. Live payment collection and developer payouts remain disabled.
