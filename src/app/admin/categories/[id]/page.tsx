import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getTiles } from "@/lib/categories";
import { TileForm } from "@/components/admin/TileForm";
import { AdminHead, BackLink } from "@/components/admin/AdminUi";

export const metadata: Metadata = {
  title: "Edit tile",
  robots: { index: false, follow: false },
};

/** Editing sheet for one taxonomy tile. */
export default async function EditTilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const tiles = await getTiles();
  const tile = tiles.find((item) => item.id === id);
  if (!tile) notFound();

  return (
    <>
      <BackLink href="/admin/categories" label="Back to categories" />

      <AdminHead title="Edit tile" subtitle={tile.id} />

      <TileForm tile={tile} />
    </>
  );
}
