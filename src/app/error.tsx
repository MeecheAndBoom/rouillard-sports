"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";

/**
 * Root error boundary — catches any unhandled server/client throw and renders
 * a calm, on-brand recovery panel instead of Next's raw error page.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLocale();

  useEffect(() => {
    // Surface to console for debugging without exposing details to visitors.
    console.error("[site error]", error);
  }, [error]);

  return (
    <main id="main" className="relative overflow-hidden bg-pit">
      <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-70" />
      <div aria-hidden="true" className="livery absolute top-0 bottom-0 left-0 w-[3px]" />

      <div className="section relative py-16 sm:py-24">
        <div className="page-enter max-w-[640px]">
          <span
            aria-hidden="true"
            className="grid h-14 w-14 place-items-center border border-danger/50 bg-danger/10 text-[20px] text-danger"
          >
            <i className="fa-solid fa-triangle-exclamation" />
          </span>

          <h1 className="mt-8 font-display text-[34px] leading-[0.98] text-white sm:text-[48px]">
            {t.errorPage.title}
          </h1>
          <p className="mt-5 max-w-[52ch] text-[16.5px] leading-[1.7] text-muted">
            {t.errorPage.lead}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <button type="button" onClick={reset} className="btn btn-primary">
              <i className="fa-solid fa-rotate-right text-[12px]" aria-hidden="true" />
              <span>{t.errorPage.retry}</span>
            </button>
            <Link href="/" className="btn btn-outline">
              <i className="fa-solid fa-house text-[12px]" aria-hidden="true" />
              <span>{t.errorPage.home}</span>
            </Link>
          </div>

          {error.digest ? (
            <p className="mt-10 border-t border-line pt-5 font-mono-num text-[11px] uppercase tracking-[0.14em] text-muted-dim">
              {t.errorPage.ref}: <span className="text-paper">{error.digest}</span>
            </p>
          ) : null}
        </div>
      </div>

      <div aria-hidden="true" className="flag-band-sm h-[6px] w-full opacity-60" />
    </main>
  );
}
