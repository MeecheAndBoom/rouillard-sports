"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveProduct, type AdminActionResult } from "@/actions/admin";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Field } from "@/components/ui/FormBits";
import { PART_CATEGORIES, PART_CONDITIONS } from "@/lib/constants";
import type { Product } from "@/lib/types";

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  refurb: "Refurbished",
  used: "Used",
};

/**
 * Part create/edit sheet. French fields first, English variants beside them.
 * Lists submit as newline or comma separated text, simple to paste from a
 * supplier sheet.
 */
export function ProductForm({ product }: { product?: Product }) {
  const [state, formAction, pending] = useActionState<AdminActionResult | null, FormData>(
    saveProduct,
    null,
  );
  const [images, setImages] = useState<string[]>(product?.images ?? []);

  if (state?.ok) {
    return (
      <div className="flex flex-col items-start gap-5 border border-success/40 bg-success/[0.06] p-8">
        <p className="flex items-center gap-2.5 text-[16px] font-medium text-success">
          <i className="fa-solid fa-circle-check" aria-hidden="true" />
          Part saved.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/admin/products" className="btn btn-primary btn-sm">
            <i className="fa-solid fa-arrow-left text-[12px]" aria-hidden="true" />
            <span>Back to parts</span>
          </Link>
          <a href="/shop" className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer">
            <i
              className="fa-solid fa-arrow-up-right-from-square text-[11px]"
              aria-hidden="true"
            />
            <span>View the storefront</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state && !state.ok ? (
        <p
          role="alert"
          className="border border-danger/40 bg-danger/[0.06] px-4 py-3 text-[14px] text-danger"
        >
          {state.error}
        </p>
      ) : null}

      {product ? <input type="hidden" name="slug" value={product.slug} /> : null}

      {/* Identity */}
      <Section title="Identity" icon="fa-fingerprint">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Title (FR)" htmlFor="title" required>
            <input
              id="title"
              name="title"
              required
              defaultValue={product?.title ?? ""}
              className="field"
            />
          </Field>
          <Field label="Title (EN)" htmlFor="titleEn" optionalLabel="optional">
            <input
              id="titleEn"
              name="titleEn"
              defaultValue={product?.titleEn ?? ""}
              className="field"
            />
          </Field>
          <Field
            label="Part number"
            htmlFor="partNumber"
            required
            hint="Stamped on the part or its packaging."
          >
            <input
              id="partNumber"
              name="partNumber"
              required
              defaultValue={product?.partNumber ?? ""}
              className="field"
            />
          </Field>
          <Field label="SKU / barcode" htmlFor="sku" optionalLabel="optional">
            <input
              id="sku"
              name="sku"
              defaultValue={product?.sku ?? ""}
              className="field"
            />
          </Field>
          <Field label="Brand (manufacturer)" htmlFor="brand" required>
            <input
              id="brand"
              name="brand"
              required
              defaultValue={product?.brand ?? ""}
              className="field"
              placeholder="Bosch, Brembo"
            />
          </Field>
          <Field label="Condition" htmlFor="condition" required>
            <select
              id="condition"
              name="condition"
              defaultValue={product?.condition ?? "new"}
              className="field cursor-pointer"
            >
              {PART_CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {CONDITION_LABELS[c] ?? c}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* Fitment */}
      <Section title="Fitment" icon="fa-diagram-project">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Vehicle make" htmlFor="make" required>
            <input
              id="make"
              name="make"
              required
              defaultValue={product?.make ?? ""}
              className="field"
              placeholder="Peugeot, VW"
            />
          </Field>
          <Field label="Model" htmlFor="model" required>
            <input
              id="model"
              name="model"
              required
              defaultValue={product?.model ?? ""}
              className="field"
              placeholder="208, Golf"
            />
          </Field>
          <Field label="Years" htmlFor="yearRange" hint="Format 2012-2019">
            <input
              id="yearRange"
              name="yearRange"
              defaultValue={product?.yearRange ?? ""}
              className="field"
              placeholder="2012-2019"
            />
          </Field>
        </div>
        <div className="mt-5">
          <Field
            label="Compatible models (list)"
            htmlFor="fitment"
            hint="One model per line, shown on the product sheet."
          >
            <textarea
              id="fitment"
              name="fitment"
              rows={3}
              defaultValue={product?.fitment?.join("\n") ?? ""}
              className="field resize-y"
            />
          </Field>
        </div>
      </Section>

      {/* Commercial */}
      <Section title="Price & stock" icon="fa-scale-balanced">
        <div className="grid gap-5 sm:grid-cols-4">
          <Field label="Price (EUR)" htmlFor="price" required>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={product?.price ?? ""}
              className="field"
            />
          </Field>
          <Field label="List price (EUR)" htmlFor="listPrice" optionalLabel="optional">
            <input
              id="listPrice"
              name="listPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.listPrice ?? ""}
              className="field"
            />
          </Field>
          <Field label="Stock" htmlFor="stock" required>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              required
              defaultValue={product?.stock ?? 0}
              className="field"
            />
          </Field>
          <Field label="Weight (kg)" htmlFor="weightKg" optionalLabel="optional">
            <input
              id="weightKg"
              name="weightKg"
              type="number"
              step="0.1"
              min="0"
              defaultValue={product?.weightKg ?? ""}
              className="field"
            />
          </Field>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Category" htmlFor="category" required>
            <input
              id="category"
              name="category"
              required
              list="category-list"
              defaultValue={product?.category ?? ""}
              className="field"
            />
            <datalist id="category-list">
              {PART_CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Subcategory" htmlFor="subcategory" optionalLabel="optional">
            <input
              id="subcategory"
              name="subcategory"
              defaultValue={product?.subcategory ?? ""}
              className="field"
            />
          </Field>
        </div>
      </Section>

      {/* Content */}
      <Section title="Content" icon="fa-align-left">
        <div className="flex flex-col gap-5">
          <Field label="Description (FR)" htmlFor="description" required>
            <textarea
              id="description"
              name="description"
              rows={6}
              required
              defaultValue={product?.description ?? ""}
              className="field resize-y"
            />
          </Field>
          <Field label="Description (EN)" htmlFor="descriptionEn" optionalLabel="optional">
            <textarea
              id="descriptionEn"
              name="descriptionEn"
              rows={6}
              defaultValue={product?.descriptionEn ?? ""}
              className="field resize-y"
            />
          </Field>
          <Field label="Highlights (list)" htmlFor="features" hint="One point per line.">
            <textarea
              id="features"
              name="features"
              rows={4}
              defaultValue={product?.features?.join("\n") ?? ""}
              className="field resize-y"
            />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="SEO tags" htmlFor="tags" hint="Comma separated.">
              <input
                id="tags"
                name="tags"
                defaultValue={product?.tags?.join(", ") ?? ""}
                className="field"
              />
            </Field>
            <Field label="OEM numbers" htmlFor="oemNumbers" hint="Comma separated.">
              <input
                id="oemNumbers"
                name="oemNumbers"
                defaultValue={product?.oemNumbers?.join(", ") ?? ""}
                className="field"
              />
            </Field>
          </div>
        </div>
      </Section>

      {/* Media + status */}
      <Section title="Images & publication" icon="fa-image">
        <input type="hidden" name="images" value={images.join("\n")} />
        <ImageUploader value={images} onChange={setImages} folder="rouillard/products" />
        <div className="mt-6 flex flex-wrap items-end gap-6">
          <Field label="Status" htmlFor="status" required>
            <select
              id="status"
              name="status"
              defaultValue={product?.status ?? "live"}
              className="field w-[160px] cursor-pointer"
            >
              <option value="live">Live</option>
              <option value="draft">Draft</option>
            </select>
          </Field>
          <label className="flex cursor-pointer items-center gap-2.5 pb-2.5 text-[14px] text-paper">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product?.featured}
              className="h-4 w-4 accent-[var(--color-gold)]"
            />
            Featured part
          </label>
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? (
            <i className="fa-solid fa-circle-notch animate-spin text-[12px]" aria-hidden="true" />
          ) : (
            <i className="fa-solid fa-floppy-disk text-[12px]" aria-hidden="true" />
          )}
          <span>{pending ? "Saving" : "Save part"}</span>
        </button>
        <Link href="/admin/products" className="btn btn-ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-line bg-panel p-6">
      <h2 className="mb-6 flex items-center gap-2.5 border-b border-line pb-4 font-display text-[20px] leading-none text-white">
        <i className={`fa-solid ${icon} text-[14px] text-gold`} aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  );
}
