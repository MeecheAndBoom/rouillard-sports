"use client";

import { useActionState, useState, useTransition } from "react";
import {
  reviewPaymentProof,
  sendPaymentInstructions,
  updateOrderStatus,
  type AdminOrderResult,
} from "@/actions/orders";
import { ORDER_STATUSES } from "@/lib/constants";
import { dateTime } from "@/lib/format";
import type { OrderRecord } from "@/lib/types";
import { Pill } from "@/components/admin/AdminUi";

const PAYMENT_STATUSES = [
  { id: "pending", label: "Pending" },
  { id: "awaiting-proof", label: "Awaiting proof" },
  { id: "proof-submitted", label: "Proof submitted" },
  { id: "received", label: "Received" },
] as const;

/**
 * Order-detail control panel: status/payment editor, instructions email and
 * the payment-proof review queue. Approve sends the order to Payment
 * Received, reject sends it back to Awaiting Proof, both with an optional
 * note to the customer.
 */
export function OrderActions({ order }: { order: OrderRecord }) {
  const [state, formAction, pending] = useActionState<AdminOrderResult | null, FormData>(
    updateOrderStatus,
    null,
  );

  return (
    <div className="flex flex-col gap-6">
      {/* ── Payment proof review ───────────────────────────── */}
      {order.payment.proof ? <ProofReview order={order} /> : null}

      {/* ── Status editor ──────────────────────────────────── */}
      <form action={formAction} className="border border-line bg-panel p-6">
        <div className="flex items-center gap-2.5 border-b border-line pb-4">
          <i
            className="fa-solid fa-sliders text-[15px] text-gold"
            aria-hidden="true"
          />
          <h2 className="font-display text-[20px] leading-none text-white">
            Status & payment
          </h2>
        </div>

        <input type="hidden" name="reference" value={order.reference} />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="o-status" className="field-label">
              Order status
            </label>
            <select
              id="o-status"
              name="status"
              defaultValue={order.status}
              className="field cursor-pointer"
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="o-pay" className="field-label">
              Payment status
            </label>
            <select
              id="o-pay"
              name="paymentStatus"
              defaultValue={order.payment.status}
              className="field cursor-pointer"
            >
              {PAYMENT_STATUSES.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="o-note" className="field-label">
            Customer note
          </label>
          <textarea
            id="o-note"
            name="note"
            rows={3}
            placeholder="Optional message included in the status email"
            className="field resize-y"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="o-pay-details" className="field-label">
            Payment details
          </label>
          <textarea
            id="o-pay-details"
            name="paymentDetails"
            rows={4}
            defaultValue={order.payment.paymentDetails ?? ""}
            placeholder={"e.g.\nIBAN FR76 3000 4000 0312 3456 7890 189\nBIC BNPAFRPPXXX\nHolder: Rouillard Sport"}
            className="field resize-y font-mono-num text-[13.5px]"
          />
          <p className="mt-1.5 text-[13px] text-muted">
            Included in the instructions email. Prefilled from Settings, Payment methods.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={pending} className="btn btn-primary btn-sm">
            {pending ? (
              <i className="fa-solid fa-circle-notch animate-spin text-[12px]" aria-hidden="true" />
            ) : (
              <i className="fa-solid fa-floppy-disk text-[12px]" aria-hidden="true" />
            )}
            <span>{pending ? "Saving" : "Save changes"}</span>
          </button>
          {state && !state.ok ? (
            <span role="alert" className="text-[13.5px] text-danger">
              {state.error}
            </span>
          ) : null}
          {state?.ok ? (
            <span className="flex items-center gap-2 text-[13.5px] text-success">
              <i className="fa-solid fa-circle-check text-[12px]" aria-hidden="true" />
              Saved.
            </span>
          ) : null}
        </div>
      </form>

      {/* ── Payment instructions email ─────────────────────── */}
      <InstructionsButton order={order} />
    </div>
  );
}

/* ── Proof review ────────────────────────────────────────────── */

function ProofReview({ order }: { order: OrderRecord }) {
  const [result, setResult] = useState<AdminOrderResult | null>(null);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  const proof = order.payment.proof;
  if (!proof) return null;

  function decide(decision: "approved" | "rejected") {
    startTransition(async () => {
      const outcome = await reviewPaymentProof({
        reference: order.reference,
        decision,
        note: note.trim() || undefined,
      });
      setResult(outcome);
    });
  }

  const decided = proof.decision;

  return (
    <section className="border border-line bg-panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <h2 className="flex items-center gap-2.5 font-display text-[20px] leading-none text-white">
          <i
            className="fa-solid fa-file-invoice-dollar text-[15px] text-gold"
            aria-hidden="true"
          />
          Payment proof
        </h2>
        {decided === "approved" ? (
          <Pill tone="success">Approved</Pill>
        ) : decided === "rejected" ? (
          <Pill tone="danger">Rejected</Pill>
        ) : (
          <Pill tone="warning">Review pending</Pill>
        )}
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-[220px_1fr]">
        <a
          href={proof.url}
          target="_blank"
          rel="noreferrer"
          className="block overflow-hidden border border-line bg-asphalt"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={proof.url}
            alt="Payment proof"
            className="aspect-[4/3] h-full w-full object-cover"
          />
        </a>

        <dl className="flex flex-col gap-2 text-[14px]">
          <Row label="Uploaded" value={dateTime(proof.uploadedAt)} />
          {proof.uploadedBy ? <Row label="By" value={proof.uploadedBy} /> : null}
          {proof.note ? <Row label="Customer note" value={proof.note} /> : null}
          {proof.decidedAt ? (
            <Row
              label="Decided"
              value={`${dateTime(proof.decidedAt)}${proof.decisionNote ? ` | ${proof.decisionNote}` : ""}`}
            />
          ) : null}
        </dl>
      </div>

      {!decided ? (
        <>
          <div className="mt-5">
            <label htmlFor="proof-note" className="field-label">
              Decision note
            </label>
            <textarea
              id="proof-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. transfer received 14/03, ref RS-AB12CD"
              className="field resize-y"
            />
            <p className="mt-1.5 text-[13px] text-muted">
              Shared with the customer when the proof is rejected.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={() => decide("approved")}
              className="btn btn-success btn-sm"
            >
              <i className="fa-solid fa-check text-[12px]" aria-hidden="true" />
              <span>Approve proof</span>
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => decide("rejected")}
              className="btn btn-danger btn-sm"
            >
              <i className="fa-solid fa-xmark text-[12px]" aria-hidden="true" />
              <span>Reject</span>
            </button>
            {pending ? (
              <span className="self-center text-[13px] text-muted">Working</span>
            ) : null}
          </div>
        </>
      ) : null}

      {result && !result.ok ? (
        <p role="alert" className="mt-3 text-[13.5px] text-danger">
          {result.error}
        </p>
      ) : null}
    </section>
  );
}

/* ── Instructions email button ───────────────────────────────── */

function InstructionsButton({ order }: { order: OrderRecord }) {
  const [result, setResult] = useState<AdminOrderResult | null>(null);
  const [pending, startTransition] = useTransition();
  const sent = order.status === "Payment Pending" || order.status === "Awaiting Payment Proof";

  return (
    <section className="border border-line bg-panel p-6">
      <div className="flex items-center gap-2.5 border-b border-line pb-4">
        <i className="fa-solid fa-envelope-open text-[15px] text-gold" aria-hidden="true" />
        <h2 className="font-display text-[20px] leading-none text-white">
          Payment instructions
        </h2>
      </div>
      <p className="mt-4 text-[14.5px] leading-[1.7] text-muted">
        Emails the payment instructions to{" "}
        <span className="font-medium text-paper">{order.customer.email}</span> in the order
        language, then moves the order to{" "}
        <span className="font-medium text-paper">
          {sent ? "its current awaiting state" : "Payment Pending"}
        </span>
        .
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setResult(await sendPaymentInstructions(order.reference));
            })
          }
          className="btn btn-primary btn-sm"
        >
          <i
            className={`fa-solid ${pending ? "fa-circle-notch animate-spin" : "fa-paper-plane"} text-[12px]`}
            aria-hidden="true"
          />
          <span>{pending ? "Sending" : "Send instructions"}</span>
        </button>
        {result?.ok ? (
          <span className="flex items-center gap-2 text-[13.5px] text-success">
            <i className="fa-solid fa-circle-check text-[12px]" aria-hidden="true" />
            Email sent.
          </span>
        ) : null}
        {result && !result.ok ? (
          <span role="alert" className="text-[13.5px] text-warning">
            {result.error}
          </span>
        ) : null}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line-soft pb-2 last:border-b-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-paper">{value}</dd>
    </div>
  );
}
