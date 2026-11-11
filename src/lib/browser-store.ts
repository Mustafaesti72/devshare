"use client";
import { useCallback, useSyncExternalStore } from "react";
import {
  workspaceKeys,
  emptyValue,
  mergeWorkspace,
  normalizeWorkspace,
} from "./workspace-data.mjs";

let accountScope: string | null | undefined;
let ready = false;
let loading = false;
let timer: ReturnType<typeof setTimeout> | undefined;
let active = false;
let failure = false;
const pending = new Map<string, string>();
const memory = new Map<string, string>();
const listeners = new Set<() => void>();
const conflicts = new Map<string, string>();
const bases = new Map<string, string>();
let statusSnapshot = "";
const emit = () => listeners.forEach((listener) => listener());
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function rawRead(key: string) {
  try {
    return memory.get(key) ?? localStorage.getItem(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}
function persist(key: string, value: string) {
  memory.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {}
}
function scopedKey(key: string) {
  if (key === "drp-theme" || key === "drp-analytics-consent") return key;
  if (accountScope === undefined) return undefined;
  return accountScope ? `devshare:${accountScope}:${key}` : key;
}
function cachedValue(key: string) {
  return rawRead(scopedKey(key)!) ?? emptyValue(key);
}
function baseKey(key: string) {
  return scopedKey(key)! + ":sync-base";
}
function dirtyKeys() {
  return workspaceKeys.filter(
    (key) => bases.has(key) && cachedValue(key) !== bases.get(key),
  );
}
function status() {
  statusSnapshot = JSON.stringify({
    signedIn: !!accountScope,
    loading: loading || !ready,
    working: active,
    pending: dirtyKeys().length,
    error: failure,
    conflicts: [...conflicts.keys()],
  });
  emit();
}
function schedule(delay = 600) {
  if (!accountScope || !ready) return;
  clearTimeout(timer);
  timer = setTimeout(() => void flush(), delay);
}
async function flush() {
  if (active || !accountScope || !ready) return;
  const user = accountScope;
  active = true;
  failure = false;
  status();
  try {
    for (const key of dirtyKeys()) {
      if (conflicts.has(key)) continue;
      const sent = cachedValue(key),
        base = bases.get(key)!;
      const response = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, base, value: sent }),
      });
      if (accountScope !== user) return;
      if (!response.ok && response.status !== 409)
        throw new Error("Sync failed");
      const result = await response.json();
      if (typeof result.value !== "string")
        throw new Error("Invalid sync response");
      if (result.conflict) {
        conflicts.set(key, result.value);
        continue;
      }
      const local = cachedValue(key);
      try {
        const rebased = mergeWorkspace(key, sent, local, result.value);
        bases.set(key, result.value);
        persist(baseKey(key), result.value);
        persist(scopedKey(key)!, rebased);
      } catch {
        bases.set(key, sent);
        persist(baseKey(key), sent);
        conflicts.set(key, result.value);
      }
    }
  } catch {
    failure = true;
  } finally {
    active = false;
    status();
    if (accountScope === user && dirtyKeys().some((key) => !conflicts.has(key)))
      schedule(failure ? 5000 : 600);
  }
}
async function hydrate() {
  if (!accountScope || loading || active) return;
  const user = accountScope;
  loading = true;
  status();
  try {
    const response = await fetch("/api/workspace", { cache: "no-store" });
    if (!response.ok) throw new Error("Sync unavailable");
    const { values } = await response.json();
    if (accountScope !== user) return;
    for (const key of workspaceKeys) {
      const remote = normalizeWorkspace(key, values[key] ?? emptyValue(key));
      const local = rawRead(scopedKey(key)!);
      const base = rawRead(baseKey(key)) ?? emptyValue(key);
      if (conflicts.has(key)) {
        conflicts.set(key, remote);
        continue;
      }
      if (local === null) {
        bases.set(key, remote);
        persist(baseKey(key), remote);
        persist(scopedKey(key)!, remote);
        continue;
      }
      try {
        const merged = mergeWorkspace(key, base, local, remote);
        bases.set(key, remote);
        persist(baseKey(key), remote);
        persist(scopedKey(key)!, merged);
      } catch {
        bases.set(key, base);
        conflicts.set(key, remote);
      }
    }
    failure = false;
    ready = true;
  } catch {
    failure = true;
  } finally {
    loading = false;
    status();
    if (ready) schedule();
  }
}
export function setAccountScope(id: string | null) {
  if (accountScope === id) return;
  accountScope = id;
  ready = !id;
  bases.clear();
  conflicts.clear();
  failure = false;
  for (const [key, value] of pending) {
    const target = scopedKey(key);
    if (target) persist(target, value);
  }
  pending.clear();
  status();
  if (id) void hydrate();
}
export function retryWorkspaceSync() {
  if (ready) schedule(0);
  else void hydrate();
}
export function resolveWorkspaceConflict(key: string, useLocal: boolean) {
  const remote = conflicts.get(key);
  if (remote === undefined) return;
  bases.set(key, remote);
  persist(baseKey(key), remote);
  if (!useLocal) persist(scopedKey(key)!, remote);
  conflicts.delete(key);
  status();
  schedule(0);
}
export function useWorkspaceSync() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => statusSnapshot,
    () => "",
  );
  return snapshot
    ? (JSON.parse(snapshot) as {
        signedIn: boolean;
        loading: boolean;
        working: boolean;
        pending: number;
        error: boolean;
        conflicts: string[];
      })
    : null;
}
function readStored(key: string, fallback: string) {
  const target = scopedKey(key);
  if (!target) return pending.get(key) ?? fallback;
  return rawRead(target) ?? fallback;
}
export function useStored(key: string, fallback: string) {
  const get = useCallback(() => readStored(key, fallback), [key, fallback]);
  const server = useCallback(() => fallback, [fallback]);
  const value = useSyncExternalStore(subscribe, get, server);
  function write(next: string) {
    const target = scopedKey(key);
    if (target) persist(target, next);
    else pending.set(key, next);
    status();
    if (workspaceKeys.includes(key)) schedule();
  }
  return [value, write] as const;
}
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key) memory.delete(event.key);
    else memory.clear();
    emit();
    if (accountScope && !active) void hydrate();
  });
  window.addEventListener("online", () => {
    void hydrate();
  });
  window.addEventListener("focus", () => {
    void hydrate();
  });
  setInterval(() => {
    if (document.visibilityState === "visible") void hydrate();
  }, 30000);
}

export function clearAccountCache(id: string) {
  const prefix = "devshare:" + id + ":";
  for (const key of memory.keys())
    if (key.startsWith(prefix)) memory.delete(key);
  try {
    for (const key of Object.keys(localStorage))
      if (key.startsWith(prefix)) localStorage.removeItem(key);
  } catch {}
  emit();
}
