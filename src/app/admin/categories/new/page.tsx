import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TileForm } from "@/components/admin/TileForm";
import { AdminHead, BackLink } from "@/components/admin/AdminUi";

export const metadata: Metadata = {
  title: "New tile",
  robots: { index: false, follow: false },
};

/** Creation sheet for a new taxonomy tile. */
export default async function NewTilePage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <>
      <BackLink href="/admin/categories" label="Back to categories" />

      <AdminHead
        title="New tile"
        subtitle="Category tiles link straight into the filtered shop grid."
      />

      <TileForm />
    </>
  );
}
