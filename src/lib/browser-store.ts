"use client";
import { useCallback, useSyncExternalStore } from "react";
let accountScope: string | null | undefined;
const pending = new Map<string, string>();
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key) memory.delete(event.key);
    else memory.clear();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
const memory = new Map<string, string>();
function scopedKey(key: string) {
  if (key === "drp-theme") return key;
  if (accountScope === undefined) return undefined;
  return accountScope ? `devshare:${accountScope}:${key}` : key;
}
function persist(key: string, value: string) {
  memory.set(key, value);
  try { localStorage.setItem(key, value); } catch {}
}
export function setAccountScope(id: string | null) {
  accountScope = id;
  for (const [key,value] of pending) {
    const target=scopedKey(key);
    if(target) persist(target,value);
  }
  pending.clear();
  listeners.forEach(listener=>listener());
}
function readStored(key: string, fallback: string) {
  const target = scopedKey(key);
  if (!target) return pending.get(key) ?? fallback;
  try {
    return memory.get(target) ?? localStorage.getItem(target) ?? fallback;
  } catch {
    return memory.get(target) ?? fallback;
  }
}
export function useStored(key: string, fallback: string) {
  const get = useCallback(() => readStored(key, fallback), [key, fallback]);
  const server = useCallback(() => fallback, [fallback]);
  const value = useSyncExternalStore(subscribe, get, server);
  function write(next: string) {
    const target = scopedKey(key);
    if (target) persist(target,next);
    else pending.set(key,next);
    listeners.forEach((listener) => listener());
  }
  return [value, write] as const;
}
