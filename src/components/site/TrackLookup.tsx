"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { lookupOrder } from "@/actions/orders";
import { TrackPanel } from "@/components/site/TrackPanel";
import type { OrderRecord } from "@/lib/types";

/**
 * Track-page lookup — reference + email pair gates the order panel (§7).
 * The query-string prefill (?ref=) lets the success page deep-link here.
 */
export function TrackLookup() {
  const { t } = useLocale();
  const params = useSearchParams();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const reference = String(formData.get("reference") ?? "");
    const email = String(formData.get("email") ?? "");
    startTransition(async () => {
      const result = await lookupOrder(reference, email);
      if (result.ok) {
        setOrder(result.order);
        setErrorKey(null);
      } else {
        setOrder(null);
        setErrorKey(result.errorKey);
      }
    });
  }

  if (order) {
    return (
      <div className="flex flex-col gap-6">
        <TrackPanel order={order} />
        <button
          type="button"
          onClick={() => setOrder(null)}
          className="btn btn-ghost btn-sm self-start"
        >
          <i className="fa-solid fa-arrow-left text-[11px]" aria-hidden="true" />
          <span>{t.common.back}</span>
        </button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="border border-line bg-panel">
      <div aria-hidden="true" className="flag-band-sm h-[4px] w-full" />
      <div className="p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="track-ref" className="field-label">
              {t.track.refLabel}
            </label>
            <input
              id="track-ref"
              name="reference"
              required
              autoComplete="off"
              defaultValue={(params.get("ref") ?? "").toUpperCase()}
              placeholder={t.track.refPlaceholder}
              className="field font-mono-num uppercase tracking-[0.12em] text-[15px] text-gold"
            />
          </div>
          <div>
            <label htmlFor="track-email" className="field-label">
              {t.track.emailLabel}
            </label>
            <input
              id="track-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              defaultValue={params.get("email") ?? ""}
              className="field"
            />
          </div>
        </div>

        {errorKey ? (
          <p
            role="alert"
            className="mt-5 flex items-start gap-3 border border-danger/45 bg-danger/10 px-4 py-3 text-[14px] text-danger"
          >
            <i className="fa-solid fa-triangle-exclamation mt-0.5" aria-hidden="true" />
            <span>{t.track[errorKey as "errorMissing" | "errorNoMatch"]}</span>
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary btn-lg mt-6 w-full sm:w-auto"
        >
          {pending ? (
            <i
              className="fa-solid fa-circle-notch animate-spin text-[13px]"
              aria-hidden="true"
            />
          ) : (
            <i className="fa-solid fa-magnifying-glass text-[12px]" aria-hidden="true" />
          )}
          <span>{pending ? t.track.looking : t.track.lookup}</span>
        </button>
      </div>
    </form>
  );
}

/** Suspense wrapper — useSearchParams requires a boundary in Next. */
export function TrackLookupForm() {
  return (
    <Suspense fallback={null}>
      <TrackLookup />
    </Suspense>
  );
}
