# DevShare

A Next.js directory for discovering open source developer tools and publishing verified maintainer projects. The current release is free. Live payments and developer payouts are disabled.

## Development

Use Node 24.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Without DATABASE_URL, the public catalog and repository submission proof flow use local SQLite. GitHub accounts, cloud libraries, moderation and analytics require PostgreSQL. Production secrets belong in Railway variables, never in the repository.

## Features

- 52 real, dated GitHub repository snapshots with source links, language, license and repository facts.
- Search by keyword, category, language and license; compare up to three repositories. The most-starred view uses recorded GitHub counts.
- Six engineering guides, three reading lists and four category pages.
- GitHub sign-in, editable public profiles, account deletion and device/session controls.
- Personal public repository submissions verified against the signed-in GitHub numeric owner ID. Anonymous maintainers can alternatively prove ownership with a one-time public Gist challenge.
- Private saved sources, notes, collections and maintainer follows, synced across devices with conflict handling and offline retry. Libraries hold up to 500 sources; capacity errors preserve existing entries. Collections can select directly from the real directory.
- Project cover upload, replacement and deletion; edit/resubmit and withdrawal controls.
- Editorial review, private reports, profile moderation and recorded reviewer notes. Stale revisions are rejected.
- Consent-based project visits and GitHub click counts, with today, 7-day and 30-day dashboard views. Visitor estimates, saves and followers are aggregate activity, not earnings.

## Production

Railway hosts the Next.js service, PostgreSQL and a private S3-compatible object bucket. The Dockerfile builds the application and the service checks /api/health before accepting traffic. Set APP_URL to the public HTTPS origin and ALLOW_INDEXING=true before building. GOOGLE_SITE_VERIFICATION supplies the public Search Console verification token at build time.

DATABASE_URL must use the private PostgreSQL connection. Startup initializes the schema under an advisory lock. A one-time migration can import older SQLite submissions; the original /data file is retained for recovery. PostgreSQL backups are configured in Railway.

Set S3_ENDPOINT, S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY using Railway references. The 52 catalog images are stored under owners/ and served through /api/media/[name]. Run npm run assets:sync to upload and byte-verify them.

Project covers accept still PNG, JPEG or WebP files under 4 MB and 20 megapixels. Sharp converts them to bounded WebP images. Pending and hidden covers are visible only to their owner and moderators. Replacement and account deletion queue durable object cleanup; a background worker retries every minute.

## Identity and moderation

Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET for the OAuth app. Its callback is APP_URL/api/auth/github/callback. OAuth uses state and S256 PKCE with public identity access. Provider tokens are not persisted. Random sessions are stored as hashes and sent in secure HTTP-only cookies, with 30-day expiry and a ten-device limit.

ADMIN_GITHUB_IDS contains the numeric GitHub IDs allowed to use /moderation. Reviewed projects appear at /showcase/owner/repo and on their maintainer profile. Hiding a profile also hides its pending and published projects. Restoring a profile does not automatically republish projects. Profile edits while hidden request another review.

Deleting an account removes its live profile, sessions, cloud library and submissions, and queues its uploaded covers for removal. Historical backups follow their configured retention schedule.

## Privacy and analytics

Project pages ask before creating a browser-session analytics identifier or sending events. Signed page tokens expire after one hour. Receipts prevent replay and project-specific hashes deduplicate visits and clicks per browser session and UTC day. Hashes rotate monthly. Fine-grained records expire after 35 days; daily aggregate totals remain. Referrers use broad source categories, without full referrer URLs or raw IP addresses.

Request limits use separate, short-lived keyed hashes. Profile and project reports are visible to moderators. Research libraries are private, with an account-scoped local cache. Conflicting edits return a choice rather than silently overwriting text.

## SEO and content

The sitemap includes reviewed community projects, populated public profiles, the real source catalog, categories, guides, reading lists and the star ranking. Pages supply server-rendered content, canonical URLs and social sharing metadata. Source pages include SoftwareSourceCode structured data. Empty profiles and private/search pages remain noindex. Preview environments disable indexing.

Older fictional prototype routes remain unlinked and noindex for compatibility with existing browser data; they do not populate the live discovery feed.

## Checks

```sh
npm run lint
npm run test:unit
npm run build
# Start the local production server first, then:
npm run test:smoke
```

scripts/check-mvp.mjs requires a PostgreSQL test connection. It creates and verifies its own random mvp_check_* schema, exercises publication metadata, analytics deduplication, report resolution, profile moderation, stale revisions, request limits and deletion cascades, then removes that schema. GitHub Actions runs this against a fresh PostgreSQL service.

scripts/check-storage.mjs separately checks sessions, ownership proofs, library concurrency and cover storage in an isolated random schema and its own temporary bucket keys. Run it inside the deployed service when validating storage changes. Neither diagnostic intentionally modifies production records.
