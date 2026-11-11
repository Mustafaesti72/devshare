"use client";
import { setAccountScope } from "@/lib/browser-store";
import { isMemberId } from "@/lib/member-data";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
type Account = { id: string; display_name: string };
export function AccountMenu() {
  const path = usePathname();
  const [account, setAccount] = useState<Account | null | undefined>(undefined);
  const [error, setError] = useState(false),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/auth/session", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Account unavailable");
        const data = await response.json();
        if (
          data.user !== null &&
          (!isMemberId(data.user?.id) ||
            typeof data.user?.display_name !== "string")
        )
          throw new Error("Invalid account");
        if (controller.signal.aborted) return;
        setAccount(data.user);
        setError(false);
        setAccountScope(data.user?.id || null);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, [path, attempt]);
  return (
    <div className="account-menu">
      {account !== undefined && (
        <Link className="account-link" href={account ? "/dashboard" : "/login"}>
          {account ? account.display_name : "Sign in"}
        </Link>
      )}
      {account === undefined && !error && (
        <span className="account-link" role="status">
          Account…
        </span>
      )}
      {error && (
        <button
          className="plain-button"
          onClick={() => setAttempt((value) => value + 1)}
          title="Could not check your account. Retry to load your private library."
        >
          Retry account
        </button>
      )}
    </div>
  );
}
