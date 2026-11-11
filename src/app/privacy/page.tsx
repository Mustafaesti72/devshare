import Link from "next/link";
export const metadata = {
  title: "Privacy",
  robots: { index: false, follow: true },
};
export default function Privacy() {
  return (
    <main id="main" className="directory account-page">
      <h1>Privacy</h1>
      <p>Updated November 11, 2026.</p>
      <h2>Account data</h2>
      <p>
        GitHub sign in gives DevShare your numeric GitHub account ID, username,
        public name, avatar and bio. These identify your account and create your
        public maintainer profile. Profile edits are stored in PostgreSQL on
        Railway.
      </p>
      <h2>Sessions and submissions</h2>
      <p>
        An HTTP-only cookie keeps you signed in for up to 30 days. Session
        tokens are hashed in the database. OAuth state expires after ten
        minutes. GitHub access tokens are used during sign in and are not saved.
        Repository submissions store the source repository, owner ID,
        description, submission time and moderation status.
      </p>
      <h2>Browser data and images</h2>
      <p>
        Signed-in research notes, saves, collections and followed maintainers
        are stored in PostgreSQL and cached separately for each account in your
        browser. Anonymous research and appearance preferences stay on your
        device. Repository catalog images and project cover uploads are stored
        in a private Railway object bucket and served through DevShare. GitHub
        supplies account avatars.
      </p>
      <h2 id="analytics">Optional project analytics</h2>
      <p>
        Project pages ask before recording analytics. If you allow them, a
        random browser-session identifier helps count visits and repository
        clicks. The server stores a project-specific hash that rotates monthly,
        the UTC date and a broad referrer category. Full referrer URLs and raw
        IP addresses are not stored in these analytics. Per-visitor records
        expire after 35 days; daily totals remain. Maintainers see aggregated
        counts and approximate visitor totals. You can decline or change this
        preference on a project page.
      </p>
      <p>
        Abuse prevention separately uses short-lived keyed hashes for request
        limits. Reports are private to moderators and retain the reporter,
        target, reason and resolution.
      </p>
      <h2>Deletion and backups</h2>
      <p>
        You can edit your profile or delete your account from profile settings.
        Deletion removes your profile, sessions, synced library and submissions
        from the live database, and queues project cover files for removal.
        Railway backups expire according to the configured retention schedule.
      </p>
      <h2>Service providers</h2>
      <p>
        Railway hosts the application, PostgreSQL and object storage. GitHub
        handles identity verification and public repository metadata. These
        services may process connection and operational logs.
      </p>
      <p>
        <Link href="/profile">Manage your profile</Link> ·{" "}
        <a href="https://github.com/Mustafaesti72/devshare/issues">
          Project support
        </a>
      </p>
    </main>
  );
}
