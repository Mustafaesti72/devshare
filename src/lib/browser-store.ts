"use client";
import { useCallback, useSyncExternalStore } from "react";
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
function readStored(key: string, fallback: string) {
  try {
    return memory.get(key) ?? localStorage.getItem(key) ?? fallback;
  } catch {
    return memory.get(key) ?? fallback;
  }
}
export function useStored(key: string, fallback: string) {
  const get = useCallback(() => readStored(key, fallback), [key, fallback]);
  const server = useCallback(() => fallback, [fallback]);
  const value = useSyncExternalStore(subscribe, get, server);
  function write(next: string) {
    memory.set(key, next);
    try {
      localStorage.setItem(key, next);
    } catch {}
    listeners.forEach((listener) => listener());
  }
  return [value, write] as const;
}
