"use client";
import { createContext, useContext } from "react";
import { useStored } from "./browser-store";
import {
  parseCollections,
  parseNotes,
  type ResearchNote,
  type PersonalCollection,
} from "./research-data";
export type {
  ResearchStatus,
  ResearchNote,
  PersonalCollection,
} from "./research-data";
type Research = {
  collections: PersonalCollection[];
  notes: Record<string, ResearchNote>;
  following: string[];
  createCollection: (
    name: string,
    description: string,
    color: string,
    initialIds?: string[],
  ) => string;
  updateCollection: (
    id: string,
    patch: Partial<
      Pick<PersonalCollection, "name" | "description" | "color" | "archived">
    >,
  ) => void;
  toggleItem: (id: string, projectId: string) => void;
  saveNote: (id: string, note: ResearchNote) => void;
  removeProject: (id: string) => void;
  toggleFollow: (handle: string) => void;
};
const Context = createContext<Research | null>(null);
export function ResearchProvider({ children }: { children: React.ReactNode }) {
  const [collectionRaw, setCollections] = useStored("drp-collections", "[]");
  const [noteRaw, setNotes] = useStored("drp-notes", "{}");
  const [followRaw, setFollowing] = useStored("drp-following", "[]");
  const collections = parseCollections(collectionRaw);
  const notes = parseNotes(noteRaw);
  let following: string[] = [];
  try {
    const v = JSON.parse(followRaw);
    if (Array.isArray(v)) following = v.filter((x) => typeof x === "string");
  } catch {}
  function createCollection(
    name: string,
    description: string,
    color: string,
    initialIds: string[] = [],
  ) {
    const id = crypto.randomUUID();
    setCollections(
      JSON.stringify([
        ...collections,
        {
          id,
          name: name.trim().slice(0, 80),
          description: description.trim().slice(0, 400),
          color,
          projectIds: initialIds,
          archived: false,
        },
      ]),
    );
    return id;
  }
  function updateCollection(
    id: string,
    patch: Partial<
      Pick<PersonalCollection, "name" | "description" | "color" | "archived">
    >,
  ) {
    setCollections(
      JSON.stringify(
        collections.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      ),
    );
  }
  function toggleItem(id: string, projectId: string) {
    setCollections(
      JSON.stringify(
        collections.map((c) =>
          c.id === id
            ? {
                ...c,
                projectIds: c.projectIds.includes(projectId)
                  ? c.projectIds.filter((x) => x !== projectId)
                  : [...c.projectIds, projectId],
              }
            : c,
        ),
      ),
    );
  }
  function saveNote(id: string, note: ResearchNote) {
    setNotes(
      JSON.stringify({
        ...notes,
        [id]: { text: note.text.slice(0, 3000), status: note.status },
      }),
    );
  }
  function removeProject(id: string) {
    setCollections(
      JSON.stringify(
        collections.map((collection) => ({
          ...collection,
          projectIds: collection.projectIds.filter(
            (projectId) => projectId !== id,
          ),
        })),
      ),
    );
    setNotes(
      JSON.stringify(
        Object.fromEntries(Object.entries(notes).filter(([key]) => key !== id)),
      ),
    );
  }
  function toggleFollow(handle: string) {
    setFollowing(
      JSON.stringify(
        following.includes(handle)
          ? following.filter((x) => x !== handle)
          : [...following, handle],
      ),
    );
  }
  return (
    <Context.Provider
      value={{
        collections,
        notes,
        following,
        createCollection,
        updateCollection,
        toggleItem,
        saveNote,
        removeProject,
        toggleFollow,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useResearch() {
  const value = useContext(Context);
  if (!value) throw new Error("ResearchProvider required");
  return value;
}
