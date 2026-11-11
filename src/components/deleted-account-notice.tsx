"use client";
import { useEffect } from "react";
import { clearAccountCache } from "@/lib/browser-store";
export function DeletedAccountNotice({ id }: { id: string }) {
  useEffect(() => {
    clearAccountCache(id);
  }, [id]);
  return (
    <p role="status">
      Your account and this device’s account cache have been deleted.
    </p>
  );
}
