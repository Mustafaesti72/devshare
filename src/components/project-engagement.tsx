"use client";
import { useEffect, useRef } from "react";
import { useStored } from "@/lib/browser-store";
import { AnalyticsChoice } from "./analytics-choice";
function visitor() {
  const key = "devshare-visit:" + new Date().toISOString().slice(0, 7);
  try {
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}
function referral() {
  if (!document.referrer) return "Direct";
  try {
    const url = new URL(document.referrer),
      host = url.hostname.replace(/^www\./, "");
    if (url.origin === location.origin) return "Internal";
    if (/(^|\.)google\.[a-z.]+$/.test(host)) return "Google";
    if (host === "bing.com") return "Bing";
    if (host === "duckduckgo.com") return "DuckDuckGo";
    if (host === "github.com") return "GitHub";
    if (host === "news.ycombinator.com") return "Hacker News";
    if (host === "reddit.com" || host.endsWith(".reddit.com")) return "Reddit";
  } catch {}
  return "Other";
}
export function ProjectEngagement({
  token,
  repository,
}: {
  token: string;
  repository: string;
}) {
  const sent = useRef(false),
    actor = useRef("");
  const [consent] = useStored("drp-analytics-consent", "");
  function send(kind: string) {
    if (!token || consent !== "granted") return;
    if (!actor.current) actor.current = visitor();
    void fetch("/api/engagement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        actor: actor.current,
        kind,
        source: referral(),
      }),
      keepalive: true,
    }).catch(() => {});
  }
  useEffect(() => {
    function visible() {
      if (
        consent !== "granted" ||
        sent.current ||
        document.visibilityState !== "visible"
      )
        return;
      sent.current = true;
      if (!actor.current) actor.current = visitor();
      void fetch("/api/engagement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          actor: actor.current,
          kind: "view",
          source: referral(),
        }),
        keepalive: true,
      }).catch(() => {});
    }
    visible();
    document.addEventListener("visibilitychange", visible);
    return () => document.removeEventListener("visibilitychange", visible);
  }, [token, consent]);
  return (
    <div>
      <a
        className="btn primary"
        href={repository}
        target="_blank"
        rel="noreferrer"
        onClick={() => send("outbound")}
      >
        View repository ↗
      </a>
      <AnalyticsChoice />
    </div>
  );
}
