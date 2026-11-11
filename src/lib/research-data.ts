export type ResearchStatus = "considering" | "shortlisted" | "using";
export type ResearchNote = { text: string; status: ResearchStatus };
export type PersonalCollection = {
  id: string;
  name: string;
  description: string;
  color: string;
  projectIds: string[];
  archived: boolean;
};
const allowed = new Set(["considering", "shortlisted", "using"]);
export function parseCollections(raw: string): PersonalCollection[] {
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value
      .filter(
        (c) =>
          c &&
          typeof c.id === "string" &&
          typeof c.name === "string" &&
          Array.isArray(c.projectIds),
      )
      .slice(0, 100)
      .map((c) => ({
        id: c.id.slice(0, 80),
        name: c.name.slice(0, 80),
        description:
          typeof c.description === "string" ? c.description.slice(0, 400) : "",
        color: ["teal", "sand", "violet"].includes(c.color) ? c.color : "teal",
        projectIds: [
          ...new Set(
            c.projectIds.filter((x: unknown) => typeof x === "string"),
          ),
        ] as string[],
        archived: c.archived === true,
      }));
  } catch {
    return [];
  }
}
export function parseNotes(raw: string): Record<string, ResearchNote> {
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 500)
        .filter(
          ([, v]) =>
            v &&
            typeof v === "object" &&
            typeof (v as ResearchNote).text === "string",
        )
        .map(([id, v]) => {
          const n = v as ResearchNote;
          return [
            id,
            {
              text: n.text.slice(0, 3000),
              status: allowed.has(n.status) ? n.status : "considering",
            },
          ];
        }),
    );
  } catch {
    return {};
  }
}
