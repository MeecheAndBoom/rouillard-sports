"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { savePost, type AdminActionResult } from "@/actions/admin";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Field } from "@/components/ui/FormBits";
import { BLOG_CATEGORIES } from "@/lib/constants";
import type { BlogPost } from "@/lib/types";

/** Article create/edit sheet. French body first, English body beside it. */
export function BlogForm({ post }: { post?: BlogPost }) {
  const [state, formAction, pending] = useActionState<AdminActionResult | null, FormData>(
    savePost,
    null,
  );
  const [images, setImages] = useState<string[]>(post?.image ? [post.image] : []);

  if (state?.ok) {
    return (
      <div className="flex flex-col items-start gap-5 border border-success/40 bg-success/[0.06] p-8">
        <p className="flex items-center gap-2.5 text-[16px] font-medium text-success">
          <i className="fa-solid fa-circle-check" aria-hidden="true" />
          Article saved.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/admin/blog" className="btn btn-primary btn-sm">
            <i className="fa-solid fa-arrow-left text-[12px]" aria-hidden="true" />
            <span>Back to articles</span>
          </Link>
          <a href="/blog" className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer">
            <i
              className="fa-solid fa-arrow-up-right-from-square text-[11px]"
              aria-hidden="true"
            />
            <span>View the blog</span>
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

      {post ? <input type="hidden" name="slug" value={post.slug} /> : null}
      <input type="hidden" name="image" value={images[0] ?? ""} />

      <Section title="Metadata" icon="fa-file-lines">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Title (FR)" htmlFor="title" required>
            <input
              id="title"
              name="title"
              required
              defaultValue={post?.title ?? ""}
              className="field"
            />
          </Field>
          <Field label="Title (EN)" htmlFor="titleEn" optionalLabel="optional">
            <input
              id="titleEn"
              name="titleEn"
              defaultValue={post?.titleEn ?? ""}
              className="field"
            />
          </Field>
          <Field
            label="Standfirst (FR)"
            htmlFor="excerpt"
            required
            hint="Two sentences at most, shown on the card."
          >
            <textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              required
              defaultValue={post?.excerpt ?? ""}
              className="field resize-y"
            />
          </Field>
          <Field label="Standfirst (EN)" htmlFor="excerptEn" optionalLabel="optional">
            <textarea
              id="excerptEn"
              name="excerptEn"
              rows={3}
              defaultValue={post?.excerptEn ?? ""}
              className="field resize-y"
            />
          </Field>
          <Field label="Category" htmlFor="category" required>
            <input
              id="category"
              name="category"
              required
              list="blog-category-list"
              defaultValue={post?.category ?? "Guides"}
              className="field"
            />
            <datalist id="blog-category-list">
              {BLOG_CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Author" htmlFor="author" optionalLabel="optional">
            <input
              id="author"
              name="author"
              defaultValue={post?.author ?? ""}
              className="field"
            />
          </Field>
          <Field label="Date" htmlFor="date" required hint="YYYY-MM-DD">
            <input
              id="date"
              name="date"
              required
              type="date"
              defaultValue={post?.date ?? new Date().toISOString().slice(0, 10)}
              className="field"
            />
          </Field>
          <Field label="Tags" htmlFor="tags" hint="Comma separated.">
            <input
              id="tags"
              name="tags"
              defaultValue={post?.tags?.join(", ") ?? ""}
              className="field"
            />
          </Field>
        </div>
      </Section>

      <Section title="Content" icon="fa-align-left">
        <div className="flex flex-col gap-5">
          <Field
            label="Body (FR)"
            htmlFor="body"
            required
            hint="Markdown supported: ## headings, **bold**, dash lists."
          >
            <textarea
              id="body"
              name="body"
              rows={14}
              required
              defaultValue={post?.body ?? ""}
              className="field resize-y font-mono-num text-[13.5px]"
            />
          </Field>
          <Field
            label="Body (EN)"
            htmlFor="bodyEn"
            optionalLabel="optional"
            hint="Leave empty to keep the French text."
          >
            <textarea
              id="bodyEn"
              name="bodyEn"
              rows={14}
              defaultValue={post?.bodyEn ?? ""}
              className="field resize-y font-mono-num text-[13.5px]"
            />
          </Field>
        </div>
      </Section>

      <Section title="Image & publication" icon="fa-image">
        <ImageUploader value={images} onChange={setImages} max={1} folder="rouillard/blog" />
        <div className="mt-6 flex flex-wrap items-end gap-6">
          <Field label="Status" htmlFor="status" required>
            <select
              id="status"
              name="status"
              defaultValue={post?.status ?? "live"}
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
              defaultChecked={post?.featured}
              className="h-4 w-4 accent-[var(--color-gold)]"
            />
            Featured on the homepage
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
          <span>{pending ? "Saving" : "Save article"}</span>
        </button>
        <Link href="/admin/blog" className="btn btn-ghost">
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
