"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useResearch } from "@/lib/research";
import { isMemberId, type PublicMember } from "@/lib/member-data";
type Result = {
  key: string;
  members: PublicMember[];
  checked: string[];
  error: boolean;
};
export function FollowedMaintainers() {
  const { following, toggleFollow } = useResearch();
  const key = [
    ...new Set(
      following
        .filter((handle) => handle.startsWith("member:"))
        .map((handle) => handle.slice(7))
        .filter(isMemberId),
    ),
  ]
    .sort()
    .join(",");
  const [result, setResult] = useState<Result>({
    key: "",
    members: [],
    checked: [],
    error: false,
  });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    const ids = key.split(","),
      chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 50) chunks.push(ids.slice(i, i + 50));
    void Promise.all(
      chunks.map(async (chunk) => {
        try {
          const response = await fetch(
            "/api/members?ids=" + encodeURIComponent(chunk.join(",")),
            { signal: controller.signal, cache: "no-store" },
          );
          if (!response.ok) throw new Error("Lookup unavailable");
          const data = await response.json();
          if (!Array.isArray(data.members)) throw new Error("Invalid profiles");
          return {
            members: data.members as PublicMember[],
            checked: chunk,
            error: false,
          };
        } catch {
          return { members: [], checked: [], error: true };
        }
      }),
    ).then((parts) => {
      if (!controller.signal.aborted)
        setResult({
          key,
          members: parts.flatMap((part) => part.members),
          checked: parts.flatMap((part) => part.checked),
          error: parts.some((part) => part.error),
        });
    });
    return () => controller.abort();
  }, [key, attempt]);
  if (!following.length) return null;
  const loaded = result.key === key;
  const members = new Map(result.members.map((member) => [member.id, member]));
  return (
    <section
      className="followed-maintainers"
      aria-labelledby="following-heading"
    >
      <h2 id="following-heading">
        Followed maintainers <span>{following.length}</span>
      </h2>
      {loaded && result.error && (
        <p role="status">
          Some profiles could not be loaded.{" "}
          <button
            className="plain-button"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Retry profiles
          </button>
        </p>
      )}
      {following.map((handle) => {
        const id = handle.startsWith("member:") ? handle.slice(7) : "",
          member = isMemberId(id) && loaded ? members.get(id) : undefined;
        const unavailable = loaded && result.checked.includes(id) && !member;
        return (
          <div className="followed-maintainer" key={handle}>
            {member ? (
              <Link
                className="followed-maintainer-profile"
                href={"/members/" + member.id}
              >
                <Image src={member.avatar_url} width={40} height={40} alt="" />
                <span>
                  <strong>{member.display_name}</strong>
                  <small>@{member.github_login}</small>
                  {member.bio && <p>{member.bio}</p>}
                </span>
              </Link>
            ) : (
              <span className="followed-maintainer-missing">
                {!id
                  ? "Saved prototype profile · " + handle
                  : unavailable
                    ? "Profile no longer available"
                    : !loaded
                      ? "Loading maintainer…"
                      : "Profile temporarily unavailable"}
              </span>
            )}
            <button
              className="btn"
              aria-label={
                "Unfollow " + (member?.display_name || "this maintainer")
              }
              onClick={() => toggleFollow(handle)}
            >
              Unfollow
            </button>
          </div>
        );
      })}
    </section>
  );
}
