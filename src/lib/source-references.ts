"use client";
import { useStored } from "./browser-store";
import {
  parseSourceSnapshots,
  storeSourceSnapshot,
  type PublicRepository,
} from "./github-input";
export function sourceKey(p: PublicRepository) {
  return `github:${p.id}`;
}
export function useSourceReferences() {
  const [raw, setRaw] = useStored("drp-source-references", "[]");
  const references = parseSourceSnapshots(raw);
  return {
    references,
    saveReference: (p: PublicRepository) => {
      try {
        setRaw((current) => storeSourceSnapshot(current, p));
        return true;
      } catch {
        return false;
      }
    },
    removeReference: (id: number) =>
      setRaw((current) =>
        JSON.stringify(
          parseSourceSnapshots(current).filter((v) => v.id !== id),
        ),
      ),
  };
}
