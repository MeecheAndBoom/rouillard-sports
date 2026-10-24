import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPosts } from "@/lib/blog";
import { shortDate } from "@/lib/format";
import { AdminHead, ResponsiveList, Pill } from "@/components/admin/AdminUi";
import { ConfirmAction } from "@/components/admin/DeleteButton";
import { deletePostAction } from "@/actions/admin";

export const metadata: Metadata = {
  title: "Blog",
  robots: { index: false, follow: false },
};

/**
 * Article register. Drafts, featured flags and the translation status read
 * as chips so the publication state is visible at a glance.
 */
export default async function AdminBlogPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const posts = await getPosts({ includeDrafts: true });

  return (
    <>
      <AdminHead
        title="Blog"
        subtitle={`${posts.length} articles. Guides, maintenance and workshop notes.`}
        action={
          <Link href="/admin/blog/new" className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus text-[12px]" aria-hidden="true" />
            <span>New article</span>
          </Link>
        }
      />

      <ResponsiveList
        rows={posts}
        getKey={(post) => post.slug}
        empty="No articles yet, write the first guide."
        columns={[
          {
            key: "title",
            header: "Article",
            render: (post) => (
              <Link
                href={`/admin/blog/${post.slug}`}
                className="flex flex-col font-medium text-gold transition-colors hover:text-gold-light"
              >
                <span>{post.title}</span>
                <span className="font-mono-num text-[12.5px] text-muted">
                  /blog/{post.slug}
                </span>
              </Link>
            ),
          },
          {
            key: "category",
            header: "Category",
            render: (post) => <Pill>{post.category}</Pill>,
          },
          {
            key: "date",
            header: "Date",
            render: (post) => (
              <span className="font-mono-num text-[13px] text-muted">
                {shortDate(post.date, "fr")}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (post) => (
              <span className="flex flex-wrap items-center gap-2">
                <Pill tone={post.status === "live" ? "accent" : "warning"}>{post.status}</Pill>
                {post.featured ? <Pill tone="success">featured</Pill> : null}
                {post.titleEn ? <Pill tone="neutral">EN</Pill> : null}
              </span>
            ),
          },
          {
            key: "actions",
            header: "",
            align: "right",
            render: (post) => (
              <ConfirmAction
                action={deletePostAction}
                arg={post.slug}
                label="Delete"
                confirmLabel="Confirm"
              />
            ),
          },
        ]}
        tile={(post) => (
          <div className="border border-line bg-panel p-5">
            <Link
              href={`/admin/blog/${post.slug}`}
              className="text-[15px] font-medium text-gold transition-colors hover:text-gold-light"
            >
              {post.title}
            </Link>
            <p className="mt-1 font-mono-num text-[12.5px] text-muted">/blog/{post.slug}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Pill tone={post.status === "live" ? "accent" : "warning"}>{post.status}</Pill>
              <Pill>{post.category}</Pill>
              <span className="font-mono-num text-[13px] text-muted">
                {shortDate(post.date, "fr")}
              </span>
            </div>
            <div className="mt-3 flex justify-end border-t border-line-soft pt-3">
              <ConfirmAction
                action={deletePostAction}
                arg={post.slug}
                label="Delete"
                confirmLabel="Confirm"
              />
            </div>
          </div>
        )}
      />
    </>
  );
}
