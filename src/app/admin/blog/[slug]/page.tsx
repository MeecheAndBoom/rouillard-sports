import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPost } from "@/lib/blog";
import { BlogForm } from "@/components/admin/BlogForm";
import { AdminHead, BackLink } from "@/components/admin/AdminUi";

export const metadata: Metadata = {
  title: "Edit article",
  robots: { index: false, follow: false },
};

/** Editing sheet for one article. */
export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <>
      <BackLink href="/admin/blog" label="Back to blog" />

      <AdminHead title="Edit article" subtitle={`/blog/${post.slug}`} />

      <BlogForm post={post} />
    </>
  );
}
