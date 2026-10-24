import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BlogForm } from "@/components/admin/BlogForm";
import { AdminHead, BackLink } from "@/components/admin/AdminUi";

export const metadata: Metadata = {
  title: "New article",
  robots: { index: false, follow: false },
};

/** Creation sheet for a new article. */
export default async function NewPostPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <>
      <BackLink href="/admin/blog" label="Back to blog" />

      <AdminHead
        title="New article"
        subtitle="Headings, bold, lists, links and code blocks are supported. Plain markdown, no raw HTML."
      />

      <BlogForm />
    </>
  );
}
