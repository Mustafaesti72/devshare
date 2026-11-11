"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import repositories from "@/lib/directory.json";
import { Modal } from "./modal";
import { Icon } from "./icon";
type Publication = { id: number; full_name: string; summary: string };
export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [published, setPublished] = useState<Publication[] | null>(null);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    fetch("/api/discovery", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!controller.signal.aborted)
          setPublished(Array.isArray(data?.projects) ? data.projects : []);
      })
      .catch(() => {
        if (!controller.signal.aborted) setPublished([]);
      });
    return () => controller.abort();
  }, [open]);
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const actions = [
    ...repositories.map((p) => ({
      name: p.fullName,
      detail: p.description,
      href: `/directory/${p.owner}/${p.name}`,
      icon: "git" as const,
    })),
    {
      name: "Submit a repository",
      detail: "Verify ownership and request publication",
      href: "/for-developers",
      icon: "plus" as const,
    },
    {
      name: "GitHub inspector",
      detail: "Read real public repository metadata",
      href: "/inspect",
      icon: "git" as const,
    },
    {
      name: "Research library",
      detail: "Saved projects, notes, and decisions",
      href: "/saved",
      icon: "bookmark" as const,
    },
    {
      name: "Collections",
      detail: "Your collections and curated sets",
      href: "/collections",
      icon: "folder" as const,
    },
    {
      name: "Developer guides",
      detail: "Practical engineering reading",
      href: "/blog",
      icon: "code" as const,
    },
    {
      name: "Your dashboard",
      detail: "Your profile, submissions and account access",
      href: "/dashboard",
      icon: "chart" as const,
    },
    ...(published || []).map((project) => ({
      name: project.full_name,
      detail: project.summary,
      href: "/showcase/" + project.full_name,
      icon: "git" as const,
    })),
  ].filter((a) =>
    `${a.name} ${a.detail}`.toLowerCase().includes(query.toLowerCase()),
  );
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  return (
    <>
      <button
        aria-label="Search workspace"
        className="global-search-button"
        onClick={() => {
          setOpen(true);
          setQuery("");
          setActive(0);
        }}
      >
        <Icon name="search" size={15} />
        <span>Search workspace</span>
        <kbd>⌘ K</kbd>
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Find a project or jump to a page"
      >
        <div className="command-search">
          <Icon name="search" />
          <input
            ref={input}
            autoFocus
            data-autofocus
            value={query}
            placeholder="Search projects, tools, pages…"
            aria-label="Search workspace"
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive(Math.max(0, Math.min(active + 1, actions.length - 1)));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive(Math.max(active - 1, 0));
              }
              if (e.key === "Enter" && actions[active]) {
                e.preventDefault();
                setOpen(false);
                router.push(actions[active].href);
              }
            }}
          />
        </div>
        <div className="command-results" aria-label="Search results">
          {actions.length ? (
            actions.map((a, i) => (
              <Link
                key={a.href}
                href={a.href}
                className={i === active ? "is-active" : ""}
                onClick={() => setOpen(false)}
                onMouseEnter={() => setActive(i)}
              >
                <span className="command-result-icon">
                  <Icon name={a.icon} />
                </span>
                <span>
                  <b>{a.name}</b>
                  <small>{a.detail}</small>
                </span>
                <Icon name="arrow" size={14} />
              </Link>
            ))
          ) : (
            <div className="command-empty">
              {published === null
                ? "Loading project results…"
                : "No results. Try a project name or GitHub."}
            </div>
          )}
        </div>
        <div className="command-footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> to navigate <kbd>↵</kbd> to open
          </span>
          <span>
            <kbd>esc</kbd> to close
          </span>
        </div>
      </Modal>
    </>
  );
}
