import type { CSSProperties, ReactNode } from "react";
export type IconName =
  | "compass"
  | "search"
  | "trend"
  | "grid"
  | "list"
  | "bookmark"
  | "folder"
  | "arrow"
  | "external"
  | "plus"
  | "chevron"
  | "check"
  | "close"
  | "code"
  | "star"
  | "git"
  | "sliders"
  | "sun"
  | "moon"
  | "menu"
  | "chart"
  | "compare"
  | "clock"
  | "terminal"
  | "shield"
  | "copy";
const paths: Record<IconName, ReactNode> = {
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m16 8-2.5 5.5L8 16l2.5-5.5Z" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  trend: <path d="m3 17 6-6 4 4 8-10M15 5h6v6" />,
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.1M3 12h.1M3 18h.1" />,
  bookmark: <path d="M6 3h12v18l-6-4-6 4Z" />,
  folder: <path d="M3 6h7l2 3h9v11H3ZM3 6V4h7l2 2h8v3" />,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  external: <path d="M14 3h7v7m0-7L10 14M10 3H4v17h17v-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  check: <path d="m5 12 4 4L19 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  code: <path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18" />,
  star: (
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" />
  ),
  git: (
    <>
      <circle cx="6" cy="5" r="2" />
      <circle cx="18" cy="5" r="2" />
      <circle cx="6" cy="19" r="2" />
      <path d="M6 7v10M18 7c0 7-12 2-12 9" />
    </>
  ),
  sliders: <path d="M3 6h5m4 0h9M3 18h11m4 0h3M10 3v6m6 6v6" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1" />
    </>
  ),
  moon: <path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  chart: <path d="M4 3v17h17M8 15v-4m5 4V7m5 8V4" />,
  compare: (
    <>
      <rect x="3" y="4" width="7" height="16" rx="1" />
      <rect x="14" y="4" width="7" height="16" rx="1" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  terminal: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m6 9 3 3-3 3m6 0h5" />
    </>
  ),
  shield: <path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Zm-4 9 3 3 5-5" />,
  copy: (
    <>
      <rect x="8" y="8" width="12" height="13" rx="2" />
      <path d="M16 8V3H3v13h5" />
    </>
  ),
};
export function Icon({
  name,
  size = 18,
  style,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      {paths[name]}
    </svg>
  );
}
