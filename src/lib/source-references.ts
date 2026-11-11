"use client";
import { useStored } from "./browser-store";
import { parseSourceSnapshots, type PublicRepository } from "./github-input";
export function sourceKey(p: PublicRepository) {
  return `github:${p.id}`;
}
export function useSourceReferences() {
  const [raw, setRaw] = useStored("drp-source-references", "[]");
  const references = parseSourceSnapshots(raw);
  return {
    references,
    saveReference: (p: PublicRepository) =>
      setRaw(
        JSON.stringify(
          [p, ...references.filter((v) => v.id !== p.id)].slice(0, 30),
        ),
      ),
    removeReference: (id: number) =>
      setRaw(JSON.stringify(references.filter((v) => v.id !== id))),
  };
}
