"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveTile, type AdminActionResult } from "@/actions/admin";
import { Field } from "@/components/ui/FormBits";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { TaxonomyTile } from "@/lib/types";

const TILE_TYPES = [
  { id: "category", label: "Category" },
  { id: "make", label: "Vehicle make" },
  { id: "brand", label: "Part brand" },
  { id: "model", label: "Model" },
] as const;

/** Create/edit tile for the shop taxonomy grids (homepage + shop headers). */
export function TileForm({ tile }: { tile?: TaxonomyTile }) {
  const [state, formAction, pending] = useActionState<AdminActionResult | null, FormData>(
    saveTile,
    null,
  );
  // Single source of truth — the URL field and the Cloudinary uploader both
  // write here, so either input method works and stays in sync.
  const [image, setImage] = useState(tile?.image ?? "");

  if (state?.ok) {
    return (
      <div className="flex items-center gap-3 border border-success/40 bg-success/[0.06] p-6">
        <i className="fa-solid fa-circle-check text-success" aria-hidden="true" />
        <p className="text-[15px] font-medium text-success">Tile saved.</p>
        <Link href="/admin/categories" className="btn btn-ghost btn-sm ml-auto">
          Back to categories
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="border border-line bg-panel p-6 sm:p-8">
      {tile ? <input type="hidden" name="id" value={tile.id} /> : null}
      <input type="hidden" name="image" value={image} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Name" htmlFor="tile-name" required>
            <input
              id="tile-name"
              name="name"
              required
              defaultValue={tile?.name ?? ""}
              placeholder="Freinage"
              className="field"
            />
          </Field>
        </div>

        <div>
          <label htmlFor="tile-type" className="field-label">
            Type
          </label>
          <select
            id="tile-type"
            name="type"
            defaultValue={tile?.type ?? "category"}
            className="field cursor-pointer"
          >
            {TILE_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <Field
          label="Custom link"
          htmlFor="tile-href"
          hint="Optional, defaults to a filtered shop link."
        >
          <input
            id="tile-href"
            name="href"
            defaultValue={tile?.href ?? ""}
            placeholder="/shop?category=brakes"
            className="field"
          />
        </Field>

        <div className="sm:col-span-2">
          <Field
            label="Image"
            htmlFor="tile-image"
            hint="Upload from your device (Cloudinary) or paste a public path / URL."
          >
            <input
              id="tile-image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="/images/categories/brakes.jpg"
              className="field"
            />
          </Field>
          <div className="mt-3">
            <ImageUploader
              value={image ? [image] : []}
              onChange={(urls) => setImage(urls[0] ?? "")}
              max={1}
              folder="rouillard/tiles"
            />
          </div>
        </div>
      </div>

      {image ? (
        <div className="mt-5 overflow-hidden border border-line bg-asphalt">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="aspect-[16/6] w-full object-cover" />
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary btn-sm">
          {pending ? (
            <i className="fa-solid fa-circle-notch animate-spin text-[12px]" aria-hidden="true" />
          ) : (
            <i className="fa-solid fa-floppy-disk text-[12px]" aria-hidden="true" />
          )}
          <span>{pending ? "Saving" : tile ? "Save tile" : "Create tile"}</span>
        </button>
        {state && !state.ok ? (
          <span role="alert" className="text-[13.5px] text-danger">
            {state.error}
          </span>
        ) : null}
      </div>
    </form>
  );
}
