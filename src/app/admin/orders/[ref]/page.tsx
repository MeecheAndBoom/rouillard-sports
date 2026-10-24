import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { findOrder } from "@/lib/orders";
import { getSettings } from "@/lib/settings";
import { money, dateTime } from "@/lib/format";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { AdminHead, BackLink, Pill } from "@/components/admin/AdminUi";
import { OrderActions } from "@/components/admin/OrderActions";
import { ConfirmAction } from "@/components/admin/DeleteButton";
import { deleteOrderAction } from "@/actions/orders";
import { STATUS_TONE } from "../tone";

export const metadata: Metadata = {
  title: "Order detail",
  robots: { index: false, follow: false },
};

/**
 * Order sheet. Items and totals on the left, the control panel and the
 * status log on the right, all on hairlines.
 */
export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const { ref } = await params;
  const order = await findOrder(ref.toUpperCase());
  if (!order) notFound();

  const settings = await getSettings();
  const t = dictionaries[order.lang ?? "fr"];

  return (
    <>
      <BackLink href="/admin/orders" label="Back to orders" />

      <AdminHead
        title={`Order ${order.reference}`}
        subtitle={`${order.customer.name} · ${order.customer.email}${order.customer.phone ? ` · ${order.customer.phone}` : ""} · placed ${order.createdAt ? dateTime(order.createdAt) : "-"}`}
        action={
          <span className="flex flex-wrap items-center gap-2">
            <Pill tone={STATUS_TONE[order.status] ?? "neutral"}>{order.status}</Pill>
            <Pill tone={order.payment.status === "received" ? "success" : "warning"}>
              payment: {order.payment.status}
            </Pill>
            <Pill tone="accent">lang: {(order.lang ?? "fr").toUpperCase()}</Pill>
          </span>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* ── Left: items, customer, payment ─────────────── */}
        <div className="flex flex-col gap-8">
          <section className="border border-line bg-panel p-6">
            <h2 className="border-b border-line pb-4 font-display text-[20px] leading-none text-white">
              Items & totals
            </h2>
            <ul className="mt-1 flex flex-col">
              {order.items.map((item) => (
                <li
                  key={item.slug}
                  className="flex items-center gap-4 border-b border-line-soft py-3 last:border-b-0"
                >
                  <span className="h-12 w-12 shrink-0 overflow-hidden border border-line-soft bg-asphalt">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image || "/images/placeholder.jpg"}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[14.5px] font-medium text-paper">
                      {item.title}
                    </span>
                    <span className="font-mono-num text-[12.5px] text-muted">
                      {item.qty} × {money(item.price)}
                    </span>
                  </span>
                  <span className="font-mono-num text-[14.5px] font-semibold text-paper">
                    {money(item.price * item.qty)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4 text-[14.5px]">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-mono-num">{money(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Delivery</dt>
                <dd className="font-mono-num">
                  {order.deliveryFee === 0 ? "-" : money(order.deliveryFee)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-[17px] font-semibold">
                <dt className="text-white">Total</dt>
                <dd className="font-mono-num text-gold">{money(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="border border-line bg-panel p-6">
            <h2 className="border-b border-line pb-4 font-display text-[20px] leading-none text-white">
              Customer & delivery
            </h2>
            <dl className="mt-4 flex flex-col gap-2.5 text-[14.5px]">
              <Line label="Name" value={order.customer.name} />
              <Line label="Email" value={order.customer.email} />
              {order.customer.phone ? <Line label="Phone" value={order.customer.phone} /> : null}
              <Line
                label="Method"
                value={
                  order.delivery.method === "pickup" ? "Workshop pickup" : "Delivery"
                }
              />
              {order.delivery.address ? (
                <Line
                  label="Address"
                  value={[
                    order.delivery.address.line1,
                    order.delivery.address.zip,
                    order.delivery.address.city,
                    order.delivery.address.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                />
              ) : null}
              {order.customer.notes ? (
                <Line label="Customer notes" value={order.customer.notes} />
              ) : null}
              <Line label="Admin notes" value={order.adminNotes ?? "-"} />
            </dl>
          </section>

          <section className="border border-line bg-panel p-6">
            <h2 className="border-b border-line pb-4 font-display text-[20px] leading-none text-white">
              Payment method
            </h2>
            <dl className="mt-4 flex flex-col gap-2.5 text-[14.5px]">
              <Line label="Method" value={order.payment.label} />
              {order.payment.methodOther ? (
                <Line label="Other (customer text)" value={order.payment.methodOther} />
              ) : null}
              <Line
                label="Proof method"
                value={
                  order.payment.proofMethod === "upload"
                    ? "Upload on /track"
                    : "Email proof"
                }
              />
              {order.payment.paymentDetails ? (
                <Line label="Payment details" value={order.payment.paymentDetails} />
              ) : null}
              {order.payment.instructions ? (
                <Line label="Instructions" value={order.payment.instructions} />
              ) : null}
              {order.payment.receivedAt ? (
                <Line label="Received" value={dateTime(order.payment.receivedAt)} />
              ) : null}
            </dl>
            <p className="mt-4 border-t border-line pt-3 text-[13px] text-muted">
              Customer-facing labels ({(order.lang ?? "fr").toUpperCase()}):{" "}
              <span className="font-medium text-paper">
                {t.order.paymentMethods[
                  order.payment.method as keyof typeof t.order.paymentMethods
                ]?.label ?? order.payment.label}
              </span>{" "}
              | {t.order.statuses[order.status] ?? order.status}
            </p>
          </section>
        </div>

        {/* ── Right: controls + history ──────────────────── */}
        <div className="flex flex-col gap-8">
          <OrderActions order={order} />

          <section className="border border-line bg-panel p-6">
            <h2 className="border-b border-line pb-4 font-display text-[20px] leading-none text-white">
              Status history
            </h2>
            <ol className="mt-4 flex flex-col gap-4">
              {order.statusHistory.map((event, i) => (
                <li key={`${event.status}-${event.at}-${i}`} className="flex gap-3.5">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-2 w-2 shrink-0 bg-gold"
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-medium text-paper">
                      {dictionaries[order.lang ?? "fr"].order.statuses[
                        event.status as keyof (typeof dictionaries)["fr"]["order"]["statuses"]
                      ] ?? event.status}
                    </span>
                    <span className="font-mono-num text-[12.5px] text-muted-dim">
                      {dateTime(event.at)}
                    </span>
                    {event.note ? (
                      <span className="text-[13.5px] text-muted">{event.note}</span>
                    ) : null}
                  </span>
                </li>
              ))}
              {order.statusHistory.length === 0 ? (
                <li className="text-[14px] text-muted">No events recorded yet.</li>
              ) : null}
            </ol>
          </section>

          <section className="border border-danger/40 bg-panel p-6">
            <h2 className="border-b border-danger/30 pb-4 font-display text-[20px] leading-none text-danger">
              Danger zone
            </h2>
            <p className="mt-3 text-[14px] leading-[1.7] text-muted">
              Deleting removes the order from the admin list and the tracking
              system. Totals are not refunded automatically.
            </p>
            <div className="mt-4">
              <ConfirmAction
                action={deleteOrderAction}
                arg={order.reference}
                label="Delete order"
                confirmLabel="Confirm delete"
                successMessage="Order deleted."
              />
            </div>
            <p className="mt-4 border-t border-line pt-3 font-mono-num text-[12.5px] text-muted-dim">
              Delivery: {settings.delivery.fee} EUR / free from{" "}
              {settings.delivery.freeThreshold} EUR.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-6 border-b border-line-soft pb-2 last:border-b-0">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className="text-right font-medium break-words text-paper">{value}</dd>
    </div>
  );
}
