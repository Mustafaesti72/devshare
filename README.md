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
- GitHub sign-in, editable public profiles, account deletion and device/session controls. Account lookup failures offer a retry without switching private storage to an anonymous scope.
- Personal public repository submissions verified against the signed-in GitHub numeric owner ID. Anonymous maintainers can alternatively prove ownership with a one-time public Gist challenge.
- Private saved sources, notes, collections and maintainer follows, synced across devices with conflict handling and offline retry. Followed maintainers show names, GitHub handles and avatars; hidden or deleted profiles show an unavailable state without a broken link. Libraries hold up to 500 sources; capacity errors preserve existing entries. Collections can select directly from the real directory.
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

scripts/check-mvp.mjs requires a PostgreSQL test connection. It creates and verifies its own random mvp*check*\* schema, exercises publication metadata, analytics deduplication, report resolution, profile moderation, stale revisions, request limits and deletion cascades, then removes that schema. GitHub Actions runs this against a fresh PostgreSQL service.

scripts/check-storage.mjs separately checks sessions, ownership proofs, library concurrency and cover storage in an isolated random schema and its own temporary bucket keys. Run it inside the deployed service when validating storage changes. Neither diagnostic intentionally modifies production records.

## Milestone: launch discovery

Completed acceptance criteria:

- /launches shows reviewed maintainer publications ordered by their first approval date. Resubmissions and later approvals retain that date and do not promote an old project as a new launch. Public discovery includes the latest 100 approved publications.
- Discovery distinguishes maintainer launches from the curated source directory. Keyword searches match all words across repository names, summaries, languages and topics. Category, language and normalized license filters can be combined and removed individually.
- Share this view copies a canonical /explore URL containing the active filters. The GET search form opens the same result set on reload, and clipboard failures expose a selectable link.
- Published project pages can save their existing metadata directly to the private library and add it to a collection without consuming the GitHub inspector budget.
- /feed.xml exposes the latest 50 approved launches as RSS. Repository IDs provide stable feed identifiers across renames. XML content is escaped and invalid control characters are removed. Curated snapshots are not presented as maintainer launches.
- The launches page is included in the sitemap and the homepage advertises the RSS feed. No payment or payout integration is enabled by this milestone.

Discovery and RSS regression tests run with test:unit. The PostgreSQL diagnostic exercises publication ordering after resubmission and RSS visibility through the reviewed-listing adapter.

## Library research and exports

Saved-project searches include private notes, languages, licenses, topics and collection names. Readers can combine decision and collection filters, find projects outside any collection, and order results by name or recorded GitHub stars. The overview counts the entire library while the result label reports the current filtered view.

Export library creates files in the browser. Full device library JSON contains all current source snapshots, saved project IDs, notes, collections and follows regardless of filters. Only explicit library fields are included; account sessions and provider credentials are not read. Current view Markdown contains only matching projects, source links, decision statuses, notes and collection names. Markup is escaped and unsafe or credential-bearing source links are omitted. Exporting does not modify or upload library data.

### Editorial design and motion

The discovery homepage and developer guides adapt two AnimatedWebs free design briefs, [Condensed Editorial](https://animatedwebs.com/templates/editorial-condensed) and [Minimal Scroll-Driven Blog](https://animatedwebs.com/templates/field-notes-daily-scroll-blog), retrieved through the official MCP with an authenticated free account. Their license allows personal and commercial websites; raw prompts are not redistributed here.

The implementation uses local CSS and existing React components. No AnimatedWebs key, external font, video, runtime API call or animation package is required. Headline entrances, spotlight focus/hover states, repository entrances and article reading progress respect `prefers-reduced-motion`. Scroll-driven effects use feature queries with visible static fallbacks. Spotlight data links to the real DuckDB directory entry. Catalog filters, saving and comparison retain their existing behavior.
