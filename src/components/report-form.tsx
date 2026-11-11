"use client";
import Link from "next/link";
import { useState } from "react";
export function ReportForm({ type, target }: { type: string; target: string }) {
  const [category, setCategory] = useState("other"),
    [reason, setReason] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [done, setDone] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, target, category, reason }),
      });
      const result = await response.json();
      if (response.ok) {
        setDone(true);
        setMessage("Your report is queued for review.");
      } else setMessage(result.error);
    } catch {
      setMessage("Connection failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  if (done)
    return (
      <section>
        <p role="status">{message}</p>
        <Link href="/">Return to discovery →</Link>
      </section>
    );
  return (
    <form className="profile-form" onSubmit={submit}>
      <label>
        Reason
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="spam">Spam or misleading information</option>
          <option value="ownership">Ownership or license concern</option>
          <option value="unsafe">Unsafe behavior</option>
          <option value="other">Other</option>
        </select>
      </label>
      <label>
        What should an editor review?
        <textarea
          required
          minLength={20}
          maxLength={2000}
          rows={6}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </label>
      <p className="account-note">
        Include enough detail to locate the issue. Reports are reviewed
        privately by moderators.
      </p>
      {message && <p role="alert">{message}</p>}
      <button className="btn primary" disabled={busy}>
        {busy ? "Sending…" : "Send report"}
      </button>
    </form>
  );
}
