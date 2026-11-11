"use client";
import {
  useWorkspaceSync,
  retryWorkspaceSync,
  resolveWorkspaceConflict,
} from "@/lib/browser-store";
const names: Record<string, string> = {
  "drp-saved": "saved projects",
  "drp-source-references": "repository references",
  "drp-collections": "collections",
  "drp-notes": "notes",
  "drp-following": "followed maintainers",
};
export function SyncStatus() {
  const sync = useWorkspaceSync();
  if (!sync?.signedIn) return null;
  return (
    <section className="workspace-sync" aria-label="Library sync">
      <span role="status">
        {sync.conflicts.length
          ? "Review overlapping edits"
          : sync.error
            ? "Changes saved on this device. Cloud sync will retry."
            : sync.loading
              ? "Loading your library…"
              : sync.working || sync.pending
                ? "Saving your library…"
                : "Library synced"}
      </span>
      {sync.error && (
        <button className="plain-button" onClick={retryWorkspaceSync}>
          Retry sync
        </button>
      )}
      {sync.conflicts.map((key) => (
        <div key={key}>
          <p>
            Your {names[key]} changed on another device. Choose which version to
            keep.
          </p>
          <button
            className="btn"
            onClick={() => resolveWorkspaceConflict(key, true)}
          >
            Keep this device’s version
          </button>{" "}
          <button
            className="btn"
            onClick={() => resolveWorkspaceConflict(key, false)}
          >
            Use cloud version
          </button>
        </div>
      ))}
    </section>
  );
}
