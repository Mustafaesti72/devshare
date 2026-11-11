"use client";
import { useState } from "react";
export function PublishForm({signedIn=false}:{signedIn?:boolean}) {
  const [repo, setRepo] = useState(""),
    [phrase, setPhrase] = useState(""),
    [gist, setGist] = useState(""),
    [summary, setSummary] = useState(""),
    [done, setDone] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: signedIn ? "account-submit" : phrase ? "verify" : "start",
          repo,
          gist,
          summary,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error);
        return;
      }
      if (d.phrase) setPhrase(d.phrase);
      else setDone(d.name);
    } catch {
      setError("Connection failed. Please retry.");
    } finally {
      setBusy(false);
    }
  }
  return done ? (
    <section className="pub-box">
      <h2>Submitted for review</h2>
      <p>
        {done} passed repository ownership verification. An editor can now
        review your description for publication.
      </p>
    </section>
  ) : (
    <form className="pub-box" onSubmit={send}>
      <label>
        Personal public repository
        <input
          required
          value={repo}
          disabled={!!phrase}
          onChange={(e) => setRepo(e.target.value)}
          placeholder="owner/repository"
        />
      </label>
      {(phrase || signedIn) && (
        <>
          {!signedIn && <><p>
            Create a public Gist in your repository owner account. Name the file{" "}
            <code>devshare.txt</code> and paste this one-time phrase. It expires
            in 15 minutes.
          </p>
          <pre>{phrase}</pre>
          <a href="https://gist.github.com/" target="_blank" rel="noreferrer">
            Open GitHub Gist
          </a>
          <label>
            Gist URL
            <input
              required
              type="url"
              value={gist}
              onChange={(e) => setGist(e.target.value)}
            />
          </label>
          </>}
          <label>
            What can someone build with your project?
            <textarea
              required
              minLength={40}
              maxLength={1000}
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </label>
        </>
      )}
      {error && <p role="alert">{error}</p>}
      <button className="btn primary" disabled={busy}>
        {busy
          ? "Checking…"
          : signedIn
            ? "Submit for review"
            : phrase
            ? "Verify and submit for review"
            : "Start ownership verification"}
      </button>
      {phrase && (
        <button
          type="button"
          className="plain-button"
          disabled={busy}
          onClick={() => {
            setPhrase("");
            setError("");
          }}
        >
          Start again
        </button>
      )}
    </form>
  );
}
