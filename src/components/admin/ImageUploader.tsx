"use client";

import { useState } from "react";

type UploadResponse = { url: string; publicId: string };

/**
 * Admin image uploader: posts the file to our session-gated upload route,
 * which stores it on Cloudinary (basic-auth server side, this cloud rejects
 * signed browser uploads). Surfaces a clear message when Cloudinary is not
 * configured.
 */
export function ImageUploader({
  folder = "rouillard/products",
  value = [],
  onChange,
  max = 6,
}: {
  folder?: string;
  value?: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setBusy(true);
    try {
      const urls = [...value];
      for (const file of Array.from(files)) {
        if (urls.length >= max) break;

        const form = new FormData();
        form.append("file", file);
        form.append("folder", folder);

        const upload = await fetch("/api/cloudinary/upload", {
          method: "POST",
          body: form,
        });
        const data = (await upload.json().catch(() => ({}))) as
          | UploadResponse
          | { error?: string };
        if (!upload.ok || !("url" in data)) {
          throw new Error(
            "error" in data && data.error ? data.error : `Cloudinary ${upload.status}`,
          );
        }
        urls.push(data.url);
      }
      onChange(urls);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(
        message.includes("non configuré")
          ? "Cloudinary is not configured. Add the credentials in Settings."
          : message.includes("Fichier trop volumineux")
            ? message
            : "Upload failed, try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div
            key={url + i}
            className="relative h-20 w-20 overflow-hidden border border-line bg-asphalt"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute top-0.5 right-0.5 grid h-5 w-5 place-items-center bg-pit/85 text-white transition-colors hover:bg-danger"
              aria-label={`Remove image ${i + 1}`}
            >
              <i className="fa-solid fa-xmark text-[10px]" aria-hidden="true" />
            </button>
          </div>
        ))}
        {value.length < max ? (
          <label className="grid h-20 w-20 cursor-pointer place-items-center border border-dashed border-line text-muted transition-colors hover:border-gold hover:text-gold">
            <i
              className={`fa-solid ${busy ? "fa-circle-notch animate-spin" : "fa-cloud-arrow-up"} text-[16px]`}
              aria-hidden="true"
            />
            <span className="sr-only">Add an image</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={busy}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="text-[13px] font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
