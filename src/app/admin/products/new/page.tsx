import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminHead, BackLink } from "@/components/admin/AdminUi";

export const metadata: Metadata = {
  title: "New part",
  robots: { index: false, follow: false },
};

/** Creation sheet for a new reference. */
export default async function NewProductPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <>
      <BackLink href="/admin/products" label="Back to parts" />

      <AdminHead
        title="New part"
        subtitle="French fields are required, English variants improve the EN storefront."
      />

      <ProductForm />
    </>
  );
}
