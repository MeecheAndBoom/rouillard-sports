"use client";

import { useState, useTransition } from "react";
import { submitPaymentProof, type ProofState } from "@/actions/orders";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { OrderRecord } from "@/lib/types";

/**
 * Reusable payment-proof upload form.
 *
 * Shown when the order accepts a proof upload (proofMethod === "upload" and
 * the payment is awaiting proof). On success it calls `onSuccess` (the page
 * can refresh to re-fetch the order) and reports the result inline.
 */
export function PaymentProofUpload({
  order,
  onSuccess,
}: {
  order: OrderRecord;
  onSuccess?: () => void;
}) {
  const { t } = useLocale();
  const [proofState, setProofState] = useState<ProofState>(null);
  const [pending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);

  const acceptsProof =
    order.payment.proofMethod === "upload" &&
    ["awaiting-proof", "proof-submitted"].includes(
      order.payment.status ?? "pending",
    );
  const proofDone = order.payment.proof?.decision === "approved";
  const proofRejected = order.payment.proof?.decision === "rejected";

  if (!acceptsProof || proofDone) return null;

  function handleUpload(formData: FormData) {
    if (file) formData.set("file", file);
    startTransition(async () => {
      const result = await submitPaymentProof(
        order.reference,
        order.customer.email,
        formData,
      );
      setProofState(result);
      if (result?.ok) {
        setFile(null);
        onSuccess?.();
      }
    });
  }

  return (
    <section className="border border-line bg-panel">
      <div aria-hidden="true" className="flag-band-sm h-[4px] w-full" />
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-9 w-9 shrink-0 place-items-center border border-line text-[14px] text-gold"
          >
            <i className="fa-solid fa-file-arrow-up" />
          </span>
          <h2 className="font-display text-[19px] leading-none text-white">
            {t.track.proofTitle}
          </h2>
          {proofRejected ? (
            <span className="badge bg-danger/10 text-danger">
              <i className="fa-solid fa-triangle-exclamation text-[10px]" aria-hidden="true" />
              {t.track.proofRejected}
            </span>
          ) : null}
        </div>

        <p className="mt-4 max-w-[62ch] text-[14px] leading-[1.7] text-muted">
          {proofRejected && order.payment.proof?.decisionNote
            ? `${t.track.proofRejected}: ${order.payment.proof.decisionNote}`
            : t.track.proofLead}
        </p>

        <form action={handleUpload} className="mt-6 flex flex-col gap-5">
          <div>
            <label htmlFor="proof-file" className="field-label">
              {t.track.proofFile}
            </label>
            <input
              id="proof-file"
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="field cursor-pointer file:mr-4 file:cursor-pointer file:border-0 file:bg-panel-2 file:px-4 file:py-1.5 file:text-[13px] file:font-medium file:text-paper"
            />
            <p className="mt-1.5 text-[12.5px] text-muted-dim">
              {t.track.proofDrop}
            </p>
          </div>

          <div>
            <label htmlFor="proof-note" className="field-label">
              {t.track.proofNote}
              <span className="ml-1.5 text-[13px] font-normal normal-case tracking-normal text-muted">
                ({t.common.optional})
              </span>
            </label>
            <textarea
              id="proof-note"
              name="note"
              rows={2}
              placeholder={t.track.proofNotePlaceholder}
              className="field resize-y"
            />
          </div>

          {proofState?.error ? (
            <p
              role="alert"
              className="flex items-start gap-3 border border-danger/45 bg-danger/10 px-4 py-3 text-[14px] text-danger"
            >
              <i className="fa-solid fa-triangle-exclamation mt-0.5" aria-hidden="true" />
              <span>{proofState.error}</span>
            </p>
          ) : null}
          {proofState?.ok ? (
            <p
              role="status"
              className="flex items-start gap-3 border border-success/45 bg-success/10 px-4 py-3 text-[14px] text-success"
            >
              <i className="fa-solid fa-circle-check mt-0.5" aria-hidden="true" />
              <span>{t.track.proofDone}</span>
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary self-start"
          >
            {pending ? (
              <i
                className="fa-solid fa-circle-notch animate-spin text-[12px]"
                aria-hidden="true"
              />
            ) : (
              <i className="fa-solid fa-upload text-[12px]" aria-hidden="true" />
            )}
            <span>{t.track.proofButton}</span>
          </button>
        </form>
      </div>
    </section>
  );
}
