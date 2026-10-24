import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getProduct } from "@/lib/products";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminHead, BackLink } from "@/components/admin/AdminUi";

export const metadata: Metadata = {
  title: "Edit part",
  robots: { index: false, follow: false },
};

/** Editing sheet for one reference. */
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <>
      <BackLink href="/admin/products" label="Back to parts" />

      <AdminHead
        title="Edit part"
        subtitle={`${product.slug} | ${product.partNumber}`}
      />

      <ProductForm product={product} />
    </>
  );
}
