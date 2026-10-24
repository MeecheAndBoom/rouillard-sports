import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listOrders } from "@/lib/orders";
import { ORDER_STATUSES } from "@/lib/constants";
import { money, dateTime } from "@/lib/format";
import { AdminHead, ResponsiveList, Pill } from "@/components/admin/AdminUi";
import { ConfirmAction } from "@/components/admin/DeleteButton";
import { deleteOrderAction } from "@/actions/orders";
import { STATUS_TONE } from "./tone";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

const paymentTone = (status: string) =>
  status === "received"
    ? ("success" as const)
    : status === "proof-submitted"
      ? ("accent" as const)
      : ("warning" as const);

/**
 * Order log. A filter bar sits above the list, the reference is carried in
 * gold mono type, and every row can be opened or deleted in place.
 */
export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const sp = await searchParams;
  const q = first(sp.q).trim().toLowerCase();
  const status = first(sp.status);

  const all = await listOrders();
  const orders = all.filter((order) => {
    if (status && order.status !== status) return false;
    if (!q) return true;
    return [
      order.reference,
      order.customer.name,
      order.customer.email,
      order.customer.phone ?? "",
      ...order.items.map((item) => item.title),
    ]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  return (
    <>
      <AdminHead
        title="Orders"
        subtitle={`${orders.length} of ${all.length} orders${status ? ` | ${status}` : ""}.`}
        action={
          <Link href="/track" target="_blank" className="btn btn-ghost btn-sm">
            <i
              className="fa-solid fa-arrow-up-right-from-square text-[11px]"
              aria-hidden="true"
            />
            <span>Customer track page</span>
          </Link>
        }
      />

      {/* Search + status filter */}
      <form className="flex flex-col gap-3 border border-line bg-panel p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="oq" className="field-label">
            Search
          </label>
          <input
            id="oq"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Reference, customer, email, item"
            className="field"
          />
        </div>
        <div className="sm:w-[240px]">
          <label htmlFor="ostatus" className="field-label">
            Status
          </label>
          <select
            id="ostatus"
            name="status"
            defaultValue={status}
            className="field cursor-pointer"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary btn-sm shrink-0">
          <i className="fa-solid fa-filter text-[12px]" aria-hidden="true" />
          <span>Filter</span>
        </button>
      </form>

      <ResponsiveList
        rows={orders}
        getKey={(order) => order.reference}
        empty="No orders match this filter."
        columns={[
          {
            key: "reference",
            header: "Reference",
            render: (order) => (
              <Link
                href={`/admin/orders/${order.reference}`}
                className="font-mono-num font-semibold text-gold transition-colors hover:text-gold-light"
              >
                {order.reference}
              </Link>
            ),
          },
          {
            key: "customer",
            header: "Customer",
            render: (order) => (
              <span className="flex flex-col">
                <span className="font-medium text-paper">{order.customer.name}</span>
                <span className="font-mono-num text-[12.5px] text-muted">
                  {order.customer.email}
                </span>
              </span>
            ),
          },
          {
            key: "placed",
            header: "Placed",
            render: (order) => (
              <span className="font-mono-num text-[13px] text-muted">
                {order.createdAt ? dateTime(order.createdAt) : "-"}
              </span>
            ),
          },
          {
            key: "payment",
            header: "Payment",
            render: (order) => (
              <Pill tone={paymentTone(order.payment.status)}>
                {order.payment.status}
              </Pill>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (order) => (
              <Pill tone={STATUS_TONE[order.status] ?? "neutral"}>{order.status}</Pill>
            ),
          },
          {
            key: "total",
            header: "Total",
            align: "right",
            render: (order) => (
              <span className="font-mono-num font-semibold text-paper">
                {money(order.total)}
              </span>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            align: "right",
            render: (order) => (
              <ConfirmAction
                action={deleteOrderAction}
                arg={order.reference}
                label="Delete"
                confirmLabel="Delete order?"
                successMessage="Order deleted."
                className="btn btn-ghost btn-sm text-danger"
              />
            ),
          },
        ]}
        tile={(order) => (
          <div className="flex flex-col gap-3 border border-line bg-panel p-5">
            <Link
              href={`/admin/orders/${order.reference}`}
              className="flex items-center justify-between gap-3"
            >
              <span className="font-mono-num text-[15px] font-semibold text-gold">
                {order.reference}
              </span>
              <Pill tone={STATUS_TONE[order.status] ?? "neutral"}>{order.status}</Pill>
            </Link>
            <span className="flex items-center justify-between gap-3 text-[14px]">
              <span className="flex flex-col">
                <span className="font-medium text-paper">{order.customer.name}</span>
                <span className="font-mono-num text-[12.5px] text-muted">
                  {order.customer.email}
                </span>
              </span>
              <span className="font-mono-num font-semibold text-paper">
                {money(order.total)}
              </span>
            </span>
            <span className="flex items-center justify-between gap-3 text-[12.5px] text-muted-dim">
              <span className="font-mono-num">
                {order.createdAt ? dateTime(order.createdAt) : ""}
              </span>
              <Pill tone={paymentTone(order.payment.status)}>
                {order.payment.status}
              </Pill>
            </span>
            <ConfirmAction
              action={deleteOrderAction}
              arg={order.reference}
              label="Delete order"
              confirmLabel="Delete?"
              successMessage="Order deleted."
              className="btn btn-ghost btn-sm text-danger self-start"
            />
          </div>
        )}
      />
    </>
  );
}
