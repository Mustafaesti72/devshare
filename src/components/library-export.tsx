"use client";
import { useState } from "react";
import { Modal } from "./modal";
import {
  libraryJson,
  libraryMarkdown,
  type ExportWorkspace,
  type LibraryItem,
} from "@/lib/library-tools";
export function LibraryExport({
  workspace,
  items,
  ready,
}: {
  workspace: ExportWorkspace;
  items: LibraryItem[];
  ready: boolean;
}) {
  const [open, setOpen] = useState(false),
    [notice, setNotice] = useState("");
  function download(kind: "json" | "markdown") {
    try {
      const now = new Date(),
        content =
          kind === "json"
            ? libraryJson(workspace, now)
            : libraryMarkdown(
                items,
                workspace.notes,
                workspace.collections,
                location.origin,
                now,
              );
      const url = URL.createObjectURL(
        new Blob([content], {
          type:
            kind === "json"
              ? "application/json;charset=utf-8"
              : "text/markdown;charset=utf-8",
        }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download =
        "devshare-library-" +
        now.toISOString().slice(0, 10) +
        (kind === "json" ? ".json" : ".md");
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice(
        kind === "json" ? "JSON export prepared." : "Markdown export prepared.",
      );
    } catch {
      setNotice("The export could not be prepared. Please try again.");
    }
  }
  return (
    <>
      <button
        className="btn"
        disabled={!ready}
        onClick={() => {
          setNotice("");
          setOpen(true);
        }}
      >
        Export library
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Export your library"
      >
        <p>
          Files include your private notes and collection names. They are
          created in your browser.
        </p>
        <div className="library-export-options">
          <section>
            <h3>Full device library · JSON</h3>
            <p>
              All saved source snapshots, project IDs, notes, collections and
              follows on this device. Current filters do not limit this file.
            </p>
            <button className="btn" onClick={() => download("json")}>
              Download JSON
            </button>
          </section>
          <section>
            <h3>Current view · Markdown</h3>
            <p>
              {items.length} matching{" "}
              {items.length === 1 ? "project" : "projects"} with source links,
              decision status, collection names and notes.
            </p>
            <button
              className="btn"
              disabled={!items.length}
              onClick={() => download("markdown")}
            >
              Download Markdown
            </button>
          </section>
        </div>
        {notice && <p role="status">{notice}</p>}
      </Modal>
    </>
  );
}
