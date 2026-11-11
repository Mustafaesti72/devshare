import Link from "next/link";
export const metadata = {
  title: "Terms of use",
  robots: { index: false, follow: true },
};
export default function Terms() {
  return (
    <main id="main" className="directory account-page">
      <h1>Terms of use</h1>
      <p>Updated November 11, 2026.</p>
      <h2>Using DevShare</h2>
      <p>
        DevShare helps developers discover public repositories and describe
        their own projects. Keep profile information accurate and submit
        repositories you control. Descriptions and profile text must be
        relevant, lawful and respectful.
      </p>
      <h2>Publishing</h2>
      <p>
        Repository ownership is checked against your GitHub identity or a Gist
        challenge. Submissions enter editorial review. Editors can decline or
        hide spam, misleading descriptions and inappropriate content. By
        submitting text or project images, you permit DevShare to display them
        with your project.
      </p>
      <h2>Repository licenses</h2>
      <p>
        The upstream repository license governs use of its code. Directory
        inclusion is a source reference. Review the original documentation and
        license before using a dependency.
      </p>
      <h2>Support and earnings</h2>
      <p>
        Maintainer sponsorship links lead to GitHub. DevShare currently offers
        no paid subscriptions or creator payouts. Revenue estimates are examples
        for reviewing the proposed model.
      </p>
      <h2>Your account</h2>
      <p>
        Sign out on shared devices. You can edit your public profile, revoke
        active sessions and delete your account from settings.
      </p>
      <p>
        <Link href="/privacy">Read the privacy notice</Link> ·{" "}
        <a href="https://github.com/Mustafaesti72/devshare/issues">
          Project support
        </a>
      </p>
    </main>
  );
}
