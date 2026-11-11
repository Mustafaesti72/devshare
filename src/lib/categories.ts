export const categories = [
  {
    slug: "testing",
    name: "Testing",
    description:
      "Browse browser automation, API testing, component testing and accessibility tools.",
  },
  {
    slug: "data",
    name: "Data",
    description:
      "Discover databases, dataframes, columnar formats and data transformation tools.",
  },
  {
    slug: "tooling",
    name: "Tooling",
    description:
      "Find developer tools for terminals, code quality, automation and local workflows.",
  },
  {
    slug: "web",
    name: "Web",
    description:
      "Explore frameworks, routing, HTTP libraries and building blocks for web applications.",
  },
] as const;
export const categoryNames: readonly string[] = categories.map(
  (category) => category.name,
);
