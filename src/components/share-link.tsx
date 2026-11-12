"use client";
import { useState } from "react";
export function ShareLink({
  href,
  label = "Share project",
}: {
  href: string;
  label?: string;
}) {
  const [copied, setCopied] = useState("");
  const [manual, setManual] = useState<{ href: string; url: string } | null>(
    null,
  );
  async function copy() {
    const url = new URL(href, location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(href);
      setManual(null);
    } catch {
      setManual({ href, url });
    }
  }
  return (
    <span className="share-link">
      <button type="button" className="btn" onClick={() => void copy()}>
        {copied === href ? "Link copied" : label}
      </button>
      {manual?.href === href && (
        <label>
          Copy this link
          <input
            readOnly
            value={manual.url}
            onFocus={(event) => event.currentTarget.select()}
          />
        </label>
      )}
      <span className="sr-only" role="status">
        {copied === href ? "Link copied to clipboard" : ""}
      </span>
    </span>
  );
}
