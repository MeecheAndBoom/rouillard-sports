"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { money, shortDate } from "@/lib/format";
import { PaymentProofUpload } from "@/components/site/PaymentProofUpload";
import type { OrderRecord } from "@/lib/types";

/** Status badge tone. Status colours only, never decoration. */
const STATUS_TONE: Record<string, string> = {
  "Payment Received": "bg-success/10 text-success",
  "Payment Proof Submitted": "bg-gold/10 text-gold",
  "Awaiting Payment Proof": "bg-warning/10 text-warning",
  "Awaiting Payment": "bg-warning/10 text-warning",
  "Payment Pending": "bg-warning/10 text-warning",
  Preparing: "bg-gold/10 text-gold",
  "Ready for Pickup": "bg-gold/10 text-gold",
  "Out for Delivery": "bg-gold/10 text-gold",
  Placed: "bg-panel-2 text-muted",
  Completed: "bg-success/10 text-success",
  Cancelled: "bg-danger/10 text-danger",
};

/** Glyph for each status badge, so no badge is a bare coloured dot. */
const STATUS_ICON: Record<string, string> = {
  "Payment Received": "fa-circle-check",
  "Payment Proof Submitted": "fa-file-circle-check",
  "Awaiting Payment Proof": "fa-hourglass-half",
  "Awaiting Payment": "fa-hourglass-half",
  "Payment Pending": "fa-hourglass-half",
  Preparing: "fa-box-open",
  "Ready for Pickup": "fa-warehouse",
  "Out for Delivery": "fa-truck-fast",
  Placed: "fa-flag-checkered",
  Completed: "fa-circle-check",
  Cancelled: "fa-circle-xmark",
};

/** Milestones of the customer-facing stepper, with the rank they unlock at. */
const MILESTONES = {
  placed: { status: "Placed", doneRank: 0 },
  paymentReceived: { status: "Payment Received", doneRank: 2 },
  preparing: { status: "Preparing", doneRank: 3 },
  ready: { status: "Ready for Pickup", doneRank: 4 },
  outForDelivery: { status: "Out for Delivery", doneRank: 4 },
  completed: { status: "Completed", doneRank: 5 },
} as const;

type MilestoneKey = keyof typeof MILESTONES;

/** Where each live order status sits on the milestone ladder. */
const STATUS_RANK: Record<string, number> = {
  Placed: 0,
  "Awaiting Payment": 1,
  "Payment Pending": 1,
  "Awaiting Payment Proof": 1,
  "Payment Proof Submitted": 1,
  "Payment Received": 2,
  Preparing: 3,
  "Ready for Pickup": 4,
  "Out for Delivery": 4,
  Completed: 5,
};

type StepState = "done" | "current" | "upcoming" | "muted";

const MARKER_CLASS: Record<StepState, string> = {
  done: "border-gold bg-gold",
  current: "border-gold bg-pit",
  upcoming: "border-line bg-panel-2",
  muted: "border-line bg-panel-2",
};

const LABEL_CLASS: Record<StepState, string> = {
  done: "text-paper",
  current: "text-gold",
  upcoming: "text-muted",
  muted: "text-muted-dim",
};

/**
 * Track-page order panel — the status stepper plus the payment-proof upload
 * when the order is in an awaiting state (master prompt §7).
 */
export function TrackPanel({ order }: { order: OrderRecord }) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const statusLabel =
    t.order.statuses[order.status as keyof typeof t.order.statuses] ??
    order.status;
  const proofDone = order.payment.proof?.decision === "approved";
  const paymentReceived = order.payment.status === "received" || proofDone;

  const cancelled = order.status === "Cancelled";
  const rank = STATUS_RANK[order.status] ?? 0;

  // A delivered order never reaches "ready for pickup", and a collected
  // order never goes out for delivery: the rail follows the chosen method.
  const keys: MilestoneKey[] =
    order.delivery?.method === "delivery"
      ? ["placed", "paymentReceived", "preparing", "outForDelivery", "completed"]
      : ["placed", "paymentReceived", "preparing", "ready", "completed"];

  const history = order.statusHistory ?? [];
  let currentTaken = false;
  const steps = keys.map((key) => {
    const milestone = MILESTONES[key];
    let state: StepState;
    if (cancelled) {
      state = "muted";
    } else if (rank >= milestone.doneRank) {
      state = "done";
    } else if (!currentTaken) {
      state = "current";
      currentTaken = true;
    } else {
      state = "upcoming";
    }
    const event = history.find((e) => e.status === milestone.status);
    return {
      key,
      label: t.track.steps[key],
      state,
      date: event?.at,
    };
  });

  return (
    <div className="flex flex-col gap-8">
      {/* ── Order sheet ──────────────────────────────────────────── */}
      <section className="border border-line bg-panel">
        <div aria-hidden="true" className="flag-band-sm h-[4px] w-full" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono-num text-[11px] uppercase tracking-[0.16em] text-muted-dim">
                {t.track.refLabel}
              </p>
              <p className="mt-2 font-mono-num text-[24px] font-bold leading-none tracking-[0.05em] text-gold sm:text-[28px]">
                {order.reference}
              </p>
            </div>
            <span
              className={`badge ${STATUS_TONE[order.status] ?? "bg-panel-2 text-muted"}`}
            >
              <i
                className={`fa-solid ${STATUS_ICON[order.status] ?? "fa-circle-info"} text-[10px]`}
                aria-hidden="true"
              />
              {statusLabel}
            </span>
          </div>

          <dl className="mt-6 grid gap-x-10 gap-y-3 border-t border-line pt-5 text-[14px] sm:grid-cols-2">
            <div className="flex justify-between gap-4 sm:justify-start">
              <dt className="text-muted">{t.track.customer}</dt>
              <dd className="font-medium text-paper">{order.customer.name}</dd>
            </div>
            <div className="flex justify-between gap-4 sm:justify-start">
              <dt className="text-muted">{t.cart.total}</dt>
              <dd className="font-mono-num font-bold text-white">
                {money(order.total, locale)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 sm:justify-start">
              <dt className="text-muted">{t.checkout.payment}</dt>
              <dd className="font-medium text-paper">{order.payment.label}</dd>
            </div>
            <div className="flex justify-between gap-4 sm:justify-start">
              <dt className="text-muted">{t.track.placedOn}</dt>
              <dd className="font-mono-num font-medium text-paper">
                {order.createdAt
                  ? shortDate(order.createdAt, locale)
                  : t.common.none}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ── Stepper ───────────────────────────────────────────────── */}
      <section className="border border-line bg-panel p-6 sm:p-8">
        <h2 className="font-display text-[20px] leading-none text-white">
          {t.track.statusTitle}
        </h2>

        {/* Desktop: horizontal stepper */}
        <ol className="mt-8 hidden lg:flex">
          {steps.map((step, i) => (
            <li key={step.key} className="relative min-w-0 flex-1 pr-4">
              {i < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`absolute left-6 right-0 top-[7px] h-px ${
                    step.state === "done" ? "bg-gold" : "bg-line"
                  }`}
                />
              ) : null}
              <span
                aria-hidden="true"
                className={`relative grid h-4 w-4 place-items-center border ${MARKER_CLASS[step.state]}`}
              >
                {step.state === "done" ? (
                  <i className="fa-solid fa-check text-[8px] text-gold-ink" />
                ) : null}
              </span>
              <p
                className={`mt-3 pr-4 text-[13.5px] leading-tight ${LABEL_CLASS[step.state]}`}
              >
                {step.label}
              </p>
              {step.date ? (
                <p className="mt-1.5 font-mono-num text-[11px] text-muted-dim">
                  {shortDate(step.date, locale)}
                </p>
              ) : null}
            </li>
          ))}
        </ol>

        {/* Mobile: vertical rail */}
        <ol className="mt-6 flex flex-col lg:hidden">
          {steps.map((step, i) => (
            <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
              {i < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0 left-[7px] top-4 w-px ${
                    step.state === "done" ? "bg-gold" : "bg-line"
                  }`}
                />
              ) : null}
              <span
                aria-hidden="true"
                className={`relative mt-0.5 grid h-4 w-4 shrink-0 place-items-center border ${MARKER_CLASS[step.state]}`}
              >
                {step.state === "done" ? (
                  <i className="fa-solid fa-check text-[8px] text-gold-ink" />
                ) : null}
              </span>
              <div className="min-w-0">
                <p className={`text-[14.5px] leading-tight ${LABEL_CLASS[step.state]}`}>
                  {step.label}
                </p>
                {step.date ? (
                  <p className="mt-1 font-mono-num text-[11.5px] text-muted-dim">
                    {shortDate(step.date, locale)}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── History ───────────────────────────────────────────────── */}
      <section className="border border-line bg-panel p-6 sm:p-8">
        <h2 className="font-display text-[20px] leading-none text-white">
          {t.track.historyTitle}
        </h2>
        <ol className="mt-6 flex flex-col">
          {history.map((event, i, all) => (
            <li
              key={`${event.status}-${event.at}`}
              className="relative flex gap-4 pb-6 last:pb-0"
            >
              {i < all.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-[7px] top-4 w-px bg-line-soft"
                />
              ) : null}
              <span
                aria-hidden="true"
                className={`relative mt-1 h-3.5 w-3.5 shrink-0 border-2 ${
                  i === all.length - 1
                    ? "border-gold bg-gold"
                    : "border-line bg-panel-2"
                }`}
              />
              <div className="min-w-0">
                <p className="text-[14.5px] font-medium text-paper">
                  {t.order.statuses[event.status as keyof typeof t.order.statuses] ??
                    event.status}
                </p>
                <p className="mt-0.5 font-mono-num text-[12px] text-muted-dim">
                  {new Date(event.at).toLocaleString(
                    locale === "fr" ? "fr-FR" : "en-GB",
                  )}
                </p>
                {event.note ? (
                  <p className="mt-1.5 text-[13px] leading-[1.6] text-muted">
                    {event.note}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Payment details — hidden once payment is received */}
      {!paymentReceived && (order.payment.paymentDetails || order.payment.instructions) ? (
        <section className="border border-line bg-panel p-6 sm:p-8">
          <h2 className="font-display text-[20px] leading-none text-white">
            {t.track.paymentInstructions}
          </h2>
          <p className="mt-4 whitespace-pre-wrap text-[14.5px] leading-[1.7] text-muted">
            {order.payment.paymentDetails ?? order.payment.instructions}
          </p>
        </section>
      ) : null}

      {/* Proof upload */}
      <PaymentProofUpload order={order} onSuccess={() => router.refresh()} />

      {/* Proof received preview */}
      {order.payment.proof ? (
        <section className="border border-line bg-panel p-6 sm:p-8">
          <h2 className="font-display text-[20px] leading-none text-white">
            {t.track.proofOnFile}
          </h2>
          <div className="mt-5 flex flex-wrap items-start gap-6">
            {order.payment.proof.url.match(/\.(jpg|jpeg|png|webp)(\?|$)/i) ||
            order.payment.proof.url.includes("cloudinary") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={order.payment.proof.url}
                alt={t.track.proofTitle}
                className="h-40 w-auto max-w-full border border-line object-contain"
              />
            ) : null}
            <div className="text-[14px] text-muted">
              <p>
                {t.track.proofUploadedAt}:{" "}
                <span className="font-mono-num font-medium text-paper">
                  {order.payment.proof.uploadedAt
                    ? new Date(order.payment.proof.uploadedAt).toLocaleString(
                        locale === "fr" ? "fr-FR" : "en-GB",
                      )
                    : t.common.none}
                </span>
              </p>
              {order.payment.proof.note ? (
                <p className="mt-1.5">
                  {t.track.proofNote}:{" "}
                  <span className="text-muted-dim">{order.payment.proof.note}</span>
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
