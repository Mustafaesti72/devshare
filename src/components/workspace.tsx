"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useStored } from "@/lib/browser-store";

import { AccountMenu } from "./account-menu";
import { CommandMenu } from "./command-menu";
import { Icon } from "./icon";

type State = {
  saved: string[];
  toggleSave: (id: string) => void;
  compared: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  notify: (message: string) => void;
};
const Workspace = createContext<State>({
  saved: [],
  toggleSave: () => {},
  compared: [],
  toggleCompare: () => {},
  clearCompare: () => {},
  notify: () => {},
});
export function useWorkspace() {
  return useContext(Workspace);
}
function stringList(value: string) {
  try {
    const v = JSON.parse(value);
    return Array.isArray(v)
      ? v.filter((x: unknown): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}
export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [savedRaw, writeSaved] = useStored("drp-saved", "[]");
  const [comparedRaw, writeCompared] = useStored("drp-compare", "[]");
  const saved = stringList(savedRaw);
  const compared = stringList(comparedRaw).slice(0, 3);
  const [toast, setToast] = useState("");
  function setSaved(next: string[]) {
    writeSaved(JSON.stringify(next));
  }
  function setCompared(next: string[]) {
    writeCompared(JSON.stringify(next));
  }
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);
  function toggleSave(id: string) {
    setSaved(
      saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id],
    );
  }
  function toggleCompare(id: string) {
    if (compared.includes(id)) {
      setCompared(compared.filter((x) => x !== id));
      return;
    }
    if (compared.length === 3) {
      setToast("Compare up to 3 projects. Remove one to add another.");
      return;
    }
    setCompared([...compared, id]);
  }
  return (
    <Workspace.Provider
      value={{
        saved,
        toggleSave,
        compared,
        toggleCompare,
        clearCompare: () => setCompared([]),
        notify: setToast,
      }}
    >
      {children}
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" />
          {toast}
        </div>
      )}
      {compared.length > 0 && (
        <div className="compare-dock">
          <div className="dock-icon">
            <Icon name="compare" />
          </div>
          <span>
            <b>
              {compared.length} project{compared.length > 1 ? "s" : ""}
            </b>{" "}
            selected
          </span>
          <button className="plain-button" onClick={() => setCompared([])}>
            Clear
          </button>
          <Link className="btn primary" href="/compare">
            Compare <Icon name="arrow" size={15} />
          </Link>
        </div>
      )}
    </Workspace.Provider>
  );
}
const navigation = [
  { href: "/", label: "Discover" },
  { href: "/saved", label: "Library" },
  { href: "/collections", label: "Collections" },
  { href: "/inspect", label: "Inspect" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [appearance, setAppearance] = useStored("drp-theme", "light");
  const dark = appearance === "dark";
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  function active(href: string) {
    if (href === "/") return path === "/" || path.startsWith("/directory/");
    if (href === "/collections")
      return path.startsWith("/collections") || path.startsWith("/library/");
    return path === href;
  }
  return (
    <div className="site-shell">
      <header className="feed-nav shared-nav">
        <div>
          <Link className="feed-brand" aria-label="DevShare home" href="/">
            <b aria-hidden="true">d</b>DevShare
          </Link>
          <nav aria-label="Main navigation">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <CommandMenu />
          <AccountMenu />
          <button
            className="icon-button"
            onClick={() => setAppearance(dark ? "light" : "dark")}
            aria-label={dark ? "Use light appearance" : "Use dark appearance"}
          >
            <Icon name={dark ? "sun" : "moon"} size={17} />
          </button>
          <Link className="feed-submit" href="/for-developers">
            Submit project
          </Link>
        </div>
      </header>
      {children}
      <footer className="app-footer simple-footer">
        <span>DevShare</span>
        <div>
          <Link href="/blog">Guides</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/pricing">Plans</Link>
          <Link href="/earnings">Creator earnings</Link>
          <Link href="/dashboard">Your dashboard</Link>
          <Link href="/explore?sample=1">Sample catalog</Link>
        </div>
      </footer>
    </div>
  );
}
