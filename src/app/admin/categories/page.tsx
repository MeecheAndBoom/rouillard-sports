import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTiles } from "@/lib/categories";
import { CATEGORY_LABELS } from "@/lib/constants";
import { AdminHead, Pill } from "@/components/admin/AdminUi";
import { ConfirmAction } from "@/components/admin/DeleteButton";
import { deleteTileAction } from "@/actions/admin";

export const metadata: Metadata = {
  title: "Categories",
  robots: { index: false, follow: false },
};

/**
 * Category tiles. Each tile is a small card with the source image, the
 * internal key in mono type and the tile type as a chip.
 */
export default async function AdminCategoriesPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const tiles = await getTiles();

  return (
    <>
      <AdminHead
        title="Categories & taxonomy"
        subtitle="Tiles that drive the homepage and shop browse grids."
        action={
          <Link href="/admin/categories/new" className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus text-[12px]" aria-hidden="true" />
            <span>New tile</span>
          </Link>
        }
      />

      {tiles.length === 0 ? (
        <p className="border border-line bg-panel px-6 py-14 text-center text-[15px] text-muted">
          No tiles yet. The homepage falls back to the built-in category chips until you add
          some.
        </p>
      ) : (
        <div className="grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-3">
          {tiles.map((tile) => (
            <div key={tile.id} className="bg-pit p-5">
              <div className="flex gap-4 border border-line bg-panel p-4">
                <span className="h-14 w-14 shrink-0 overflow-hidden border border-line-soft bg-asphalt">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tile.image || "/images/placeholder.jpg"}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-[15px] font-medium text-paper">
                    {CATEGORY_LABELS[tile.name as keyof typeof CATEGORY_LABELS]?.fr ?? tile.name}
                  </span>
                  <span className="font-mono-num text-[12.5px] text-muted">{tile.name}</span>
                  <span className="pt-1">
                    <Pill tone="accent">{tile.type}</Pill>
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <Link
                  href={`/admin/categories/${tile.id}`}
                  className="font-mono-num text-[11.5px] uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold-light"
                >
                  <i className="fa-solid fa-pen mr-1.5 text-[10px]" aria-hidden="true" />
                  Edit
                </Link>
                <ConfirmAction
                  action={deleteTileAction}
                  arg={tile.id}
                  label="Delete"
                  confirmLabel="Confirm"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
