import { parseRepository } from "./github-input.ts";
export type Launch = {
  id: number;
  full_name: string;
  summary: string;
  published_at?: number | null;
  submitted: number;
};
function xml(value: string) {
  return value
    .toWellFormed()
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "")
    .replace(
      /[<>&"']/g,
      (char) =>
        ({
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
          '"': "&quot;",
          "'": "&apos;",
        })[char]!,
    );
}
export function launchFeed(rows: Launch[], origin: string) {
  const base = new URL(origin);
  const valid = rows.filter(
    (row) =>
      Number.isSafeInteger(row.id) &&
      row.id > 0 &&
      !!parseRepository(row.full_name) &&
      !row.full_name.includes(":") &&
      Number.isFinite(new Date(row.published_at || row.submitted).getTime()),
  );
  valid.sort(
    (a, b) =>
      (b.published_at || b.submitted) - (a.published_at || a.submitted) ||
      a.full_name.localeCompare(b.full_name),
  );
  const items = valid
    .slice(0, 50)
    .map((row) => {
      const url = new URL("/showcase/" + row.full_name, base).href;
      return (
        "<item><title>" +
        xml(row.full_name) +
        "</title><link>" +
        xml(url) +
        '</link><guid isPermaLink="false">devshare:github:' +
        row.id +
        "</guid><description>" +
        xml(row.summary) +
        "</description><pubDate>" +
        new Date(row.published_at || row.submitted).toUTCString() +
        "</pubDate></item>"
      );
    })
    .join("");
  return (
    '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>DevShare maintainer launches</title><link>' +
    xml(new URL("/launches", base).href) +
    '</link><description>Reviewed developer projects with verified repository ownership.</description><language>en</language><atom:link href="' +
    xml(new URL("/feed.xml", base).href) +
    '" rel="self" type="application/rss+xml"/>' +
    items +
    "</channel></rss>"
  );
}
