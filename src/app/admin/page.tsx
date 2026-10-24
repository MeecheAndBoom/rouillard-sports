import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listOrders } from "@/lib/orders";
import { listEnquiries } from "@/lib/enquiries";
import { getProducts } from "@/lib/products";
import { getReviews } from "@/lib/reviews";
import { money, dateTime } from "@/lib/format";
import { AdminHead, StatCard, Pill } from "@/components/admin/AdminUi";
import { STATUS_TONE } from "./orders/tone";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

/** Filters orders down to a day / month / year window (default: all time). */
function withinRange(iso: string | undefined, range: string): boolean {
  if (range === "all" || !iso) return true;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return true;
  const now = new Date();
  if (range === "day") {
    return date.toDateString() === now.toDateString();
  }
  if (range === "month") {
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }
  if (range === "year") {
    return date.getFullYear() === now.getFullYear();
  }
  return true;
}

const RANGES = [
  { value: "day", label: "Today" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
  { value: "all", label: "All time" },
] as const;

/**
 * Race control. Telemetry readouts across the top, the payment-proof queue
 * in the middle, then the order log and the inbox side by side.
 */
export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const sp = await searchParams;
  const range = first(sp.range) || "all";

  const [allOrders, enquiries, products, reviews] = await Promise.all([
    listOrders(),
    listEnquiries(),
    getProducts(),
    getReviews(),
  ]);

  const orders = allOrders.filter((o) => withinRange(o.createdAt, range));

  const revenue = orders
    .filter((o) => o.payment.status === "received")
    .reduce((sum, o) => sum + o.total, 0);
  const proofQueue = orders.filter(
    (o) => o.payment.proof && !o.payment.proof.decision,
  );
  const unhandled = enquiries.filter((e) => !e.handled);
  const recent = orders.slice(0, 6);

  return (
    <>
      <AdminHead
        title="Overview"
        subtitle="Orders, payment proofs and live inventory at a glance."
        action={
          <Link href="/admin/orders" className="btn btn-primary btn-sm">
            <i className="fa-solid fa-bag-shopping text-[11px]" aria-hidden="true" />
            <span>All orders</span>
          </Link>
        }
      />

      {/* Period filter */}
      <nav aria-label="Filter by period" className="flex flex-wrap items-center gap-2">
        {RANGES.map((r) => {
          const active = range === r.value;
          return (
            <Link
              key={r.value}
              href={r.value === "all" ? "/admin" : `/admin?range=${r.value}`}
              aria-current={active ? "page" : undefined}
              className={`border px-4 py-2 font-mono-num text-[11px] uppercase tracking-[0.12em] transition-colors duration-150 ${
                active
                  ? "border-gold bg-gold text-gold-ink"
                  : "border-line bg-panel text-muted hover:border-gold/60 hover:text-paper"
              }`}
            >
              {r.label}
            </Link>
          );
        })}
      </nav>

      {/* Telemetry */}
      <div className="grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders" value={String(orders.length)} icon="fa-bag-shopping" />
        <StatCard
          label="Revenue (paid)"
          value={money(revenue)}
          icon="fa-euro-sign"
          tone="success"
        />
        <StatCard
          label="Proofs to review"
          value={String(proofQueue.length)}
          icon="fa-file-invoice-dollar"
          tone={proofQueue.length ? "warning" : "neutral"}
        />
        <StatCard
          label="Open enquiries"
          value={String(unhandled.length)}
          icon="fa-envelope"
          tone={unhandled.length ? "warning" : "neutral"}
        />
      </div>

      <div className="grid gap-px bg-line sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Parts live"
          value={String(products.length)}
          icon="fa-gears"
          tone="neutral"
        />
        <StatCard
          label="Reviews published"
          value={String(reviews.filter((r) => r.published).length)}
          icon="fa-star"
          tone="neutral"
        />
        <StatCard
          label="Drafts (parts + posts)"
          value={String(products.filter((p) => p.status === "draft").length)}
          icon="fa-pen-ruler"
          tone="neutral"
        />
      </div>

      {/* Payment proof queue */}
      {proofQueue.length ? (
        <section className="border border-warning/40 bg-warning/[0.06] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2.5 font-display text-[20px] leading-none text-white">
              <i
                className="fa-solid fa-hourglass-half text-[15px] text-warning"
                aria-hidden="true"
              />
              Payment proofs waiting
            </h2>
            <Pill tone="warning">{proofQueue.length}</Pill>
          </div>
          <ul className="mt-4 flex flex-col">
            {proofQueue.map((order) => (
              <li key={order.reference}>
                <Link
                  href={`/admin/orders/${order.reference}`}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft py-3 text-[14.5px] transition-colors last:border-b-0 hover:text-gold-light"
                >
                  <span className="font-mono-num font-semibold text-gold">
                    {order.reference}
                  </span>
                  <span className="text-muted">{order.customer.name}</span>
                  <span className="font-mono-num text-paper">{money(order.total)}</span>
                  <i
                    className="fa-solid fa-arrow-right text-[11px] text-muted-dim"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Recent orders */}
        <section className="border border-line bg-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <h2 className="font-display text-[20px] leading-none text-white">
              Recent orders
            </h2>
            <Link
              href="/admin/orders"
              className="font-mono-num text-[11px] uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold-light"
            >
              All orders
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-6 text-[14.5px] text-muted">
              No orders yet, they land here right after checkout.
            </p>
          ) : (
            <ul className="mt-2 flex flex-col">
              {recent.map((order) => (
                <li key={order.reference}>
                  <Link
                    href={`/admin/orders/${order.reference}`}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft py-3 text-[14.5px] transition-colors last:border-b-0 hover:text-gold-light"
                  >
                    <span className="font-mono-num font-medium text-gold">
                      {order.reference}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-muted">
                      {order.customer.name}
                    </span>
                    <Pill tone={STATUS_TONE[order.status] ?? "neutral"}>
                      {order.status}
                    </Pill>
                    <span className="font-mono-num text-paper">{money(order.total)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Open enquiries */}
        <section className="border border-line bg-panel p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <h2 className="font-display text-[20px] leading-none text-white">
              Open enquiries
            </h2>
            <Link
              href="/admin/enquiries"
              className="font-mono-num text-[11px] uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold-light"
            >
              All enquiries
            </Link>
          </div>
          {unhandled.length === 0 ? (
            <p className="mt-6 text-[14.5px] text-muted">Inbox zero, nothing waiting.</p>
          ) : (
            <ul className="mt-2 flex flex-col">
              {unhandled.slice(0, 6).map((enquiry) => (
                <li
                  key={enquiry.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft py-3 text-[14.5px] last:border-b-0"
                >
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-medium text-paper">{enquiry.name}</span>
                    <span className="truncate text-[13px] text-muted">{enquiry.email}</span>
                  </span>
                  <Pill tone="accent">{enquiry.kind}</Pill>
                  <span className="font-mono-num text-[12px] text-muted-dim">
                    {enquiry.createdAt ? dateTime(enquiry.createdAt) : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
