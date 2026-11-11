export const topics = [
  "Developer tools",
  "AI & ML",
  "SaaS starters",
  "UI libraries",
  "Infrastructure",
  "Data & APIs",
] as const;
export type Project = {
  id: string;
  owner: string;
  name: string;
  tagline: string;
  description: string;
  topic: string;
  language: string;
  license: string;
  color: string;
  mark: string;
  updated: string;
  stars: number;
  features: string[];
  command: string;
  files: string[];
};
// Fictional product-preview fixtures, never verified publications.
export const projects: Project[] = [
  {
    id: "formwork",
    owner: "studio-example",
    name: "Formwork",
    tagline: "Forms that fit your product.",
    description:
      "Accessible form primitives with schema validation, conditional fields, and a small API. Bring your own styles and keep control of the markup.",
    topic: "UI libraries",
    language: "TypeScript",
    license: "MIT",
    color: "violet",
    mark: "F",
    updated: "2026-11-09",
    stars: 2840,
    features: [
      "Schema-based validation",
      "Keyboard and screen reader support",
      "Composable field primitives",
    ],
    command: "npm install @example/formwork",
    files: [
      "src/fields/",
      "src/validation/",
      "examples/checkout/",
      "README.md",
    ],
  },
  {
    id: "relaykit",
    owner: "example-labs",
    name: "Relaykit",
    tagline: "Background jobs, without the ceremony.",
    description:
      "A lightweight job runner for Node.js applications. Schedule work, retry failed tasks, and inspect each run from a local dashboard.",
    topic: "Infrastructure",
    language: "TypeScript",
    license: "Apache-2.0",
    color: "orange",
    mark: "r",
    updated: "2026-11-08",
    stars: 1920,
    features: [
      "Configurable retry policies",
      "Scheduled and queued jobs",
      "Local run inspector",
    ],
    command: "npm install @example/relaykit",
    files: ["packages/worker/", "packages/queue/", "examples/", "README.md"],
  },
  {
    id: "indexroom",
    owner: "sample-tools",
    name: "Indexroom",
    tagline: "Search your documents on your terms.",
    description:
      "A document search starter with local embeddings, source citations, and a replaceable model adapter. Designed for small internal knowledge bases.",
    topic: "AI & ML",
    language: "Python",
    license: "MIT",
    color: "teal",
    mark: "i",
    updated: "2026-11-10",
    stars: 3680,
    features: [
      "Local embedding pipeline",
      "Citations with source excerpts",
      "Provider-independent model adapter",
    ],
    command: "pip install example-indexroom",
    files: [
      "indexroom/ingest/",
      "indexroom/retrieval/",
      "examples/",
      "README.md",
    ],
  },
  {
    id: "dockyard",
    owner: "demo-collective",
    name: "Dockyard",
    tagline: "A considered starting point for SaaS.",
    description:
      "An application starter with workspace navigation, billing interfaces, and an account model. Choose your own authentication and payment providers.",
    topic: "SaaS starters",
    language: "TypeScript",
    license: "MIT",
    color: "blue",
    mark: "d",
    updated: "2026-11-07",
    stars: 1540,
    features: [
      "Workspace-oriented architecture",
      "Provider adapters",
      "Responsive application components",
    ],
    command: "npx example-dockyard create",
    files: ["apps/web/", "packages/ui/", "packages/auth/", "README.md"],
  },
  {
    id: "patchwork",
    owner: "studio-example",
    name: "Patchwork",
    tagline: "Review API changes before they ship.",
    description:
      "Compare OpenAPI specifications, identify breaking changes, and produce a readable release summary. Runs locally or in your existing CI pipeline.",
    topic: "Developer tools",
    language: "Go",
    license: "Apache-2.0",
    color: "rose",
    mark: "p",
    updated: "2026-11-06",
    stars: 960,
    features: [
      "Breaking-change detection",
      "Readable schema diffs",
      "CI-friendly exit codes",
    ],
    command: "go install example.com/patchwork@latest",
    files: ["cmd/patchwork/", "internal/diff/", "fixtures/", "README.md"],
  },
  {
    id: "tributary",
    owner: "example-labs",
    name: "Tributary",
    tagline: "Turn event streams into useful tables.",
    description:
      "A small toolkit for consuming, validating, and replaying application events. Use SQL transforms to build queryable views from your existing streams.",
    topic: "Data & APIs",
    language: "Rust",
    license: "MIT",
    color: "sand",
    mark: "t",
    updated: "2026-11-05",
    stars: 780,
    features: [
      "Typed event validation",
      "Replayable transformations",
      "SQL-based materialized views",
    ],
    command: "cargo add example-tributary",
    files: ["crates/core/", "crates/sql/", "examples/", "README.md"],
  },
];
export function searchProjects(query = "", topic = "") {
  const q = query.trim().toLowerCase();
  return projects.filter(
    (p) =>
      (!topic || p.topic === topic) &&
      `${p.name} ${p.description} ${p.language} ${p.tagline}`
        .toLowerCase()
        .includes(q),
  );
}
export function topicSlug(t: string) {
  return t.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-");
}
export function projectPath(p: Project) {
  return `/projects/${p.owner}/${p.id}`;
}
export const collections = [
  {
    slug: "shipping-a-saas",
    name: "Shipping a SaaS",
    description:
      "A starting point, a form library, and background jobs for the work behind the interface.",
    ids: ["dockyard", "formwork", "relaykit"],
    color: "sand",
    label: "THE APPLICATION SHELF",
  },
  {
    slug: "your-own-infrastructure",
    name: "Your own infrastructure",
    description:
      "Tools for running search, jobs, and data pipelines on infrastructure you control.",
    ids: ["indexroom", "relaykit", "tributary"],
    color: "teal",
    label: "RUN IT YOURSELF",
  },
  {
    slug: "a-better-developer-workflow",
    name: "A better developer workflow",
    description:
      "Tools for reviewing APIs, building interfaces, and keeping jobs observable.",
    ids: ["patchwork", "formwork", "relaykit"],
    color: "violet",
    label: "THE DEVELOPER TOOLBOX",
  },
];
