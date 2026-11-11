"use client";
import Link from "next/link";
import { useStored } from "@/lib/browser-store";
export function AnalyticsChoice() {
  const [choice, setChoice] = useStored("drp-analytics-consent", "");
  function decline() {
    setChoice("denied");
    try {
      for (const key of Object.keys(sessionStorage))
        if (key.startsWith("devshare-visit:")) sessionStorage.removeItem(key);
    } catch {}
  }
  if (choice)
    return (
      <button className="plain-button" onClick={() => setChoice("")}>
        Analytics preferences
      </button>
    );
  return (
    <div
      className="analytics-consent"
      role="region"
      aria-label="Analytics choice"
    >
      <p>
        Allow basic project analytics? Help maintainers understand project
        visits and repository clicks.{" "}
        <Link href="/privacy#analytics">How this works</Link>
      </p>
      <div className="account-actions">
        <button className="btn" onClick={() => setChoice("granted")}>
          Allow analytics
        </button>
        <button className="btn" onClick={decline}>
          No analytics
        </button>
      </div>
    </div>
  );
}
