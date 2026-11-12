"use client";
import Link from "next/link";
import { useSourceReferences, sourceKey } from "@/lib/source-references";
import type { PublicRepository } from "@/lib/github-input";
import { useWorkspace } from "./workspace";
import { Icon } from "./icon";
import { CollectionPicker } from "./research-actions";
export function SaveSource({
  repository,
  label,
  collections = false,
}: {
  repository: PublicRepository;
  label?: string;
  collections?: boolean;
}) {
  const { references, saveReference } = useSourceReferences();
  const { notify } = useWorkspace();
  const saved = references.some((source) => source.id === repository.id);
  return (
    <>
      <button
        type="button"
        className="dir-save"
        aria-label={
          (saved ? "Saved " : "Save ") + (label || repository.fullName)
        }
        disabled={saved}
        onClick={() => {
          if (!saveReference(repository))
            notify(
              "Your library holds up to 500 sources. Remove a source before adding another.",
            );
        }}
      >
        <Icon name={saved ? "check" : "bookmark"} size={16} />
        {saved ? "Saved" : "Save"}
      </button>
      {saved && collections && (
        <>
          <CollectionPicker projectId={sourceKey(repository)} />
          <Link className="plain-button" href="/saved">
            Open in library
          </Link>
        </>
      )}
    </>
  );
}
