"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { LogoMark } from "@/components/site/Logo";
import {
  CONSENT_MANAGE_EVENT,
  EMPTY_CONSENT,
  parseConsent,
  readConsentRaw,
  subscribeConsent,
  subscribeManageRequest,
  writeConsent,
  type Consent,
  type ConsentCategory,
} from "@/lib/consent";

/**
 * Cookie consent gate (RGPD/ePrivacy).
 *
 * Blocks the page until the visitor makes an explicit choice: accept all,
 * refuse all, or save a per-category selection. The choice persists in
 * localStorage and can be revised from the footer ("Manage cookies").
 *
 * The stored value is read through `useSyncExternalStore`, so the gate never
 * copies an external value into state inside an effect.
 */

export { CONSENT_MANAGE_EVENT as COOKIE_MANAGE_EVENT };

const noopSubscribe = () => () => {};

/** True once the client has hydrated, false during the server render. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function CookieConsent() {
  const { t } = useLocale();
  const hydrated = useHydrated();
  const raw = useSyncExternalStore(subscribeConsent, readConsentRaw, () => null);
  const existing = useMemo(() => parseConsent(raw), [raw]);
  const [requested, setRequested] = useState(false);
  const [override, setOverride] = useState<Consent | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const open = hydrated && (requested || existing === null);

  useEffect(() => {
    const onRequest = () => setRequested(true);
    return subscribeManageRequest(onRequest);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => panelRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(id);
    };
  }, [open]);

  const draft = override ?? existing ?? EMPTY_CONSENT;

  const save = useCallback((next: Consent) => {
    writeConsent(next);
    setOverride(null);
    setRequested(false);
  }, []);

  const toggle = (key: ConsentCategory) =>
    setOverride({ ...draft, [key]: !draft[key] });

  if (!open) return null;

  const categories: { key: ConsentCategory; title: string; description: string }[] = [
    {
      key: "preferences",
      title: t.cookies.categories.preferences.title,
      description: t.cookies.categories.preferences.description,
    },
    {
      key: "analytics",
      title: t.cookies.categories.analytics.title,
      description: t.cookies.categories.analytics.description,
    },
    {
      key: "marketing",
      title: t.cookies.categories.marketing.title,
      description: t.cookies.categories.marketing.description,
    },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-stretch justify-center sm:items-center sm:p-4 lg:p-6">
      <div aria-hidden="true" className="absolute inset-0 bg-black/80 backdrop-blur-[3px]" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        tabIndex={-1}
        className="page-enter relative flex max-h-[100dvh] w-full max-w-[940px] flex-col overflow-hidden border border-line bg-pit shadow-[0_40px_100px_rgba(0,0,0,0.8)] outline-none sm:max-h-[calc(100dvh-32px)] lg:max-h-[calc(100dvh-48px)]"
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          <div aria-hidden="true" className="flag-band-sm h-[5px] w-full shrink-0" />

          <div className="shrink-0 border-b border-line px-5 pt-6 pb-5 sm:px-9 sm:pt-8">
            <div className="flex items-start gap-4">
              <LogoMark size={44} />
              <div className="min-w-0">
                <h2
                  id="cookie-consent-title"
                  className="font-display text-[22px] leading-[1.05] text-white sm:text-[28px]"
                >
                  {t.cookies.title}
                </h2>
                <p className="mt-2.5 max-w-[76ch] text-[13.5px] leading-[1.7] text-muted sm:text-[14.5px]">
                  {t.cookies.lead}
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-5 sm:px-9 sm:py-6">
            <ul className="space-y-3">
              <li className="flex items-start justify-between gap-4 border border-line bg-panel px-4 py-3.5 sm:px-5">
                <div className="min-w-0">
                  <p className="font-display text-[15px] uppercase tracking-[0.04em] text-white">
                    {t.cookies.categories.essential.title}
                  </p>
                  <p className="mt-1 text-[13px] leading-[1.65] text-muted">
                    {t.cookies.categories.essential.description}
                  </p>
                </div>
                <span className="badge badge-gold shrink-0 whitespace-nowrap">
                  {t.cookies.categories.essential.alwaysOn}
                </span>
              </li>

              {categories.map((cat) => {
                const checked = draft[cat.key];
                return (
                  <li
                    key={cat.key}
                    className={`flex items-start justify-between gap-4 border px-4 py-3.5 transition-colors sm:px-5 ${
                      checked ? "border-gold/45 bg-panel" : "border-line bg-transparent"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-display text-[15px] uppercase tracking-[0.04em] text-white">
                        {cat.title}
                      </p>
                      <p className="mt-1 text-[13px] leading-[1.65] text-muted">{cat.description}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={checked}
                      aria-label={cat.title}
                      onClick={() => toggle(cat.key)}
                      className={`mt-0.5 flex h-[28px] w-[52px] shrink-0 items-center border p-[3px] transition-colors duration-200 ${
                        checked ? "border-gold bg-gold" : "border-line bg-pit"
                      }`}
                    >
                      <span
                        className={`h-[20px] w-[20px] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                          checked
                            ? "translate-x-[24px] bg-gold-ink"
                            : "translate-x-0 bg-muted-dim"
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="mt-4 text-[13px] text-muted">
              {t.cookies.privacyNote}{" "}
              <Link
                href="/legal/privacy"
                className="text-gold underline underline-offset-2 transition-colors hover:text-gold-light"
              >
                {t.cookies.privacyLink}
              </Link>
            </p>
          </div>

          <div className="mt-auto shrink-0 border-t border-line bg-asphalt px-5 py-4 sm:px-9 sm:py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono-num text-[10.5px] tracking-[0.06em] text-muted-dim">
                {t.cookies.manageHint}
              </p>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  className="btn btn-dark w-full sm:w-auto"
                  onClick={() =>
                    save({ ...draft, preferences: false, analytics: false, marketing: false })
                  }
                >
                  {t.cookies.rejectAll}
                </button>
                <button
                  type="button"
                  className="btn btn-outline w-full sm:w-auto"
                  onClick={() => save(draft)}
                >
                  {t.cookies.save}
                </button>
                <button
                  type="button"
                  className="btn btn-primary w-full sm:w-auto"
                  onClick={() =>
                    save({ ...draft, preferences: true, analytics: true, marketing: true })
                  }
                >
                  {t.cookies.acceptAll}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
