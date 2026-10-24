import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProducts } from "@/lib/products";
import { money } from "@/lib/format";
import { CATEGORY_LABELS } from "@/lib/constants";
import { AdminHead, ResponsiveList, Pill } from "@/components/admin/AdminUi";
import { ConfirmAction } from "@/components/admin/DeleteButton";
import { deleteProductAction } from "@/actions/admin";

export const metadata: Metadata = {
  title: "Parts",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

/**
 * Parts register. The search strip sits above the table, the reference is
 * carried in gold mono type and every row opens its editing sheet.
 */
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const sp = await searchParams;
  const q = first(sp.q).trim().toLowerCase();

  const all = await getProducts({ includeDrafts: true });
  const products = q
    ? all.filter((product) =>
        [
          product.title,
          product.partNumber,
          product.brand,
          product.make,
          product.model,
          product.sku ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
    : all;

  return (
    <>
      <AdminHead
        title="Parts"
        subtitle={`${products.length} of ${all.length} references.`}
        action={
          <Link href="/admin/products/new" className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus text-[12px]" aria-hidden="true" />
            <span>New part</span>
          </Link>
        }
      />

      <form className="flex flex-col gap-3 border border-line bg-panel p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="pq" className="field-label">
            Search
          </label>
          <input
            id="pq"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Title, reference, brand, make"
            className="field"
          />
        </div>
        <button type="submit" className="btn btn-primary btn-sm shrink-0">
          <i className="fa-solid fa-magnifying-glass text-[12px]" aria-hidden="true" />
          <span>Search</span>
        </button>
      </form>

      <ResponsiveList
        rows={products}
        getKey={(product) => product.slug}
        empty="No parts yet, create the first reference."
        columns={[
          {
            key: "image",
            header: "",
            className: "w-14",
            render: (product) => (
              <span className="block h-11 w-11 overflow-hidden border border-line-soft bg-asphalt">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.images[0] || "/images/placeholder.jpg"}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </span>
            ),
          },
          {
            key: "title",
            header: "Part",
            render: (product) => (
              <Link
                href={`/admin/products/${product.slug}`}
                className="flex flex-col font-medium text-gold transition-colors hover:text-gold-light"
              >
                <span>{product.title}</span>
                <span className="font-mono-num text-[12.5px] text-muted">
                  {product.partNumber}
                </span>
              </Link>
            ),
          },
          {
            key: "fit",
            header: "Fitment",
            render: (product) => (
              <span className="text-[13.5px] text-muted">
                {product.make} / {product.model}
              </span>
            ),
          },
          {
            key: "category",
            header: "Category",
            render: (product) => (
              <Pill>
                {CATEGORY_LABELS[product.category as keyof typeof CATEGORY_LABELS]?.fr ??
                  product.category}
              </Pill>
            ),
          },
          {
            key: "price",
            header: "Price",
            align: "right",
            render: (product) => (
              <span className="font-mono-num font-semibold text-paper">
                {money(product.price)}
              </span>
            ),
          },
          {
            key: "stock",
            header: "Stock",
            align: "right",
            render: (product) => (
              <Pill tone={product.stock > 0 ? "success" : "danger"}>
                {product.stock}
              </Pill>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (product) => (
              <span className="flex flex-wrap items-center gap-2">
                <Pill tone={product.status === "live" ? "accent" : "warning"}>
                  {product.status}
                </Pill>
                {product.featured ? <Pill tone="success">featured</Pill> : null}
              </span>
            ),
          },
          {
            key: "actions",
            header: "",
            align: "right",
            render: (product) => (
              <ConfirmAction
                action={deleteProductAction}
                arg={product.slug}
                label="Delete"
                confirmLabel="Confirm"
              />
            ),
          },
        ]}
        tile={(product) => (
          <div className="border border-line bg-panel p-5">
            <div className="flex gap-4">
              <span className="h-14 w-14 shrink-0 overflow-hidden border border-line-soft bg-asphalt">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.images[0] || "/images/placeholder.jpg"}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Link
                  href={`/admin/products/${product.slug}`}
                  className="text-[15px] font-medium text-gold transition-colors hover:text-gold-light"
                >
                  {product.title}
                </Link>
                <span className="font-mono-num text-[12.5px] text-muted">
                  {product.partNumber}
                </span>
                <span className="flex flex-wrap items-center gap-2 pt-1">
                  <Pill tone={product.status === "live" ? "accent" : "warning"}>
                    {product.status}
                  </Pill>
                  <Pill tone={product.stock > 0 ? "success" : "danger"}>
                    stock {product.stock}
                  </Pill>
                  <span className="font-mono-num text-[13.5px] font-semibold text-paper">
                    {money(product.price)}
                  </span>
                </span>
              </div>
            </div>
            <div className="mt-3 flex justify-end border-t border-line-soft pt-3">
              <ConfirmAction
                action={deleteProductAction}
                arg={product.slug}
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
