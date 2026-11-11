"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function ProjectImageUpload({
  id,
  hasImage = false,
  version,
}: {
  id: number;
  hasImage?: boolean;
  version: number;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  async function upload() {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setMessage("Choose an image under 4 MB.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/listing-images/" + id, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const result = await response.json();
      setMessage(
        response.ok ? "Image saved. Your project is in review." : result.error,
      );
      if (response.ok) {
        setFile(null);
        router.refresh();
      }
    } catch {
      setMessage("Connection failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/listing-images/" + id, {
        method: "DELETE",
      });
      const result = await response.json();
      setMessage(
        response.ok
          ? "Cover removed. Your project is in review."
          : result.error,
      );
      if (response.ok) router.refresh();
    } catch {
      setMessage("Connection failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="project-upload">
      <summary>Project cover image</summary>
      {hasImage && (
        <>
          <Image
            className="project-cover"
            src={"/api/listing-images/" + id + "?v=" + version}
            width={640}
            height={400}
            alt="Your project cover"
            unoptimized
          />
          <button className="btn" disabled={busy} onClick={remove}>
            Remove cover
          </button>
        </>
      )}
      <p>
        PNG, JPEG or WebP up to 4 MB. Image changes return the project to
        editorial review.
      </p>
      <label>
        Choose a cover
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>
      <button className="btn" disabled={!file || busy} onClick={upload}>
        {busy ? "Uploading…" : "Upload cover"}
      </button>
      {message && <p role="status">{message}</p>}
    </details>
  );
}
