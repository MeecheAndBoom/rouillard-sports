"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { placeOrder, type CheckoutResult } from "@/actions/orders";
import { useCart, cartSubtotal } from "@/store/cart";
import { money } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";
import type { PaymentMethodSetting } from "@/lib/settings";

/**
 * Checkout form — customer details, pickup/delivery, payment method with
 * "Other" reveal, and a hidden JSON cart payload. On success the cart is
 * cleared and the reference drives the redirect (done in the page).
 *
 * Layout: a numbered step rail on the left (contact, delivery, payment) and
 * a sticky order sheet on the right that keeps the live totals in view.
 */
export function CheckoutForm({
  paymentMethods,
  deliveryFee,
  freeThreshold,
}: {
  paymentMethods: PaymentMethodSetting[];
  deliveryFee: number;
  freeThreshold: number;
}) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const [state, formAction, pending] = useActionState<CheckoutResult | null, FormData>(
    placeOrder,
    null,
  );
  const [delivery, setDelivery] = useState<"pickup" | "delivery">("pickup");
  const [method, setMethod] = useState<string>(paymentMethods[0]?.id ?? "");

  const enabledMethods = paymentMethods.filter((m) => m.enabled);
  const subtotal = cartSubtotal(lines);
  const fee =
    delivery === "delivery" && subtotal < freeThreshold ? deliveryFee : 0;
  const total = subtotal + fee;
  const itemsJson = useMemo(
    () => JSON.stringify(lines.map((l) => ({ slug: l.slug, qty: l.qty }))),
    [lines],
  );

  // Success: empty the cart and hand off to the confirmation page.
  useEffect(() => {
    if (state?.ok) {
      clear();
      router.replace(`/checkout/success/${state.reference}`);
    }
  }, [state, clear, router]);

  if (state?.ok) {
    return null;
  }

  return (
    <form
      action={formAction}
      className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12"
    >
      <div className="hidden">
        <input type="hidden" name="items" value={itemsJson} />
        <input type="hidden" name="deliveryMethod" value={delivery} />
        <input type="hidden" name="paymentMethod" value={method} />
      </div>

      {state && !state.ok ? (
        <p
          role="alert"
          className="flex items-start gap-3 border border-danger/45 bg-danger/10 px-4 py-3 text-[14px] text-danger lg:col-span-2"
        >
          <i className="fa-solid fa-triangle-exclamation mt-0.5" aria-hidden="true" />
          <span>{state.error}</span>
        </p>
      ) : null}

      {/* ── Step rail ────────────────────────────────────────────── */}
      <ol className="flex flex-col">
        {/* 01 — contact */}
        <Reveal as="li" delay={0} className="flex gap-5 pb-8">
          <div className="flex w-9 shrink-0 flex-col items-center">
            <span className="grid h-9 w-9 place-items-center border border-gold bg-pit font-mono-num text-[13px] font-bold leading-none text-gold">
              01
            </span>
            <span aria-hidden="true" className="mt-2 w-px flex-1 bg-line" />
          </div>
          <div className="min-w-0 flex-1 border border-line bg-panel p-5 sm:p-6">
            <h2 className="font-display text-[20px] leading-none text-white">
              {t.checkout.yourInfo}
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="field-label">
                  {t.checkout.name} *
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  autoComplete="name"
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="email" className="field-label">
                  {t.checkout.email} *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="phone" className="field-label">
                  {t.checkout.phone}
                  <span className="ml-1.5 text-[13px] font-normal normal-case tracking-normal text-muted">
                    ({t.common.optional})
                  </span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className="field"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="notes" className="field-label">
                  {t.checkout.notes}
                  <span className="ml-1.5 text-[13px] font-normal normal-case tracking-normal text-muted">
                    ({t.common.optional})
                  </span>
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder={t.checkout.notesPlaceholder}
                  className="field resize-y"
                />
              </div>
            </div>
          </div>
        </Reveal>

        {/* 02 — delivery */}
        <Reveal as="li" delay={90} className="flex gap-5 pb-8">
          <div className="flex w-9 shrink-0 flex-col items-center">
            <span className="grid h-9 w-9 place-items-center border border-gold bg-pit font-mono-num text-[13px] font-bold leading-none text-gold">
              02
            </span>
            <span aria-hidden="true" className="mt-2 w-px flex-1 bg-line" />
          </div>
          <div className="min-w-0 flex-1 border border-line bg-panel p-5 sm:p-6">
            <h2 className="font-display text-[20px] leading-none text-white">
              {t.checkout.delivery}
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {(["pickup", "delivery"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDelivery(option)}
                  aria-pressed={delivery === option}
                  className={`flex items-start gap-3 border p-4 text-left transition-colors duration-150 active:scale-[0.99] ${
                    delivery === option
                      ? "border-gold bg-gold/10"
                      : "border-line bg-pit hover:border-muted-dim"
                  }`}
                >
                  <span
                    className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center border-2 ${
                      delivery === option ? "border-gold" : "border-line"
                    }`}
                  >
                    {delivery === option ? (
                      <span className="h-1.5 w-1.5 bg-gold" />
                    ) : null}
                  </span>
                  <span>
                    <span className="block font-display text-[16px] leading-tight text-white">
                      {option === "pickup"
                        ? t.checkout.methodPickup
                        : t.checkout.methodDelivery}
                    </span>
                    <span className="mt-1.5 block text-[13px] leading-[1.6] text-muted">
                      {option === "pickup"
                        ? t.checkout.pickupHint
                        : t.checkout.deliveryHint}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {delivery === "delivery" ? (
              <div className="mt-5 grid gap-5 border-t border-line-soft pt-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="addressLine1" className="field-label">
                    {t.checkout.addressLine} *
                  </label>
                  <input
                    id="addressLine1"
                    name="addressLine1"
                    required
                    autoComplete="address-line1"
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="field-label">
                    {t.checkout.city} *
                  </label>
                  <input
                    id="city"
                    name="city"
                    required
                    autoComplete="address-level2"
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="zip" className="field-label">
                    {t.checkout.zip} *
                  </label>
                  <input
                    id="zip"
                    name="zip"
                    required
                    autoComplete="postal-code"
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="field-label">
                    {t.checkout.state}
                  </label>
                  <input
                    id="state"
                    name="state"
                    autoComplete="address-level1"
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="field-label">
                    {t.checkout.country}
                  </label>
                  <input
                    id="country"
                    name="country"
                    defaultValue="France"
                    autoComplete="country-name"
                    className="field"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </Reveal>

        {/* 03 — payment */}
        <Reveal as="li" delay={180} className="flex gap-5">
          <div className="flex w-9 shrink-0 flex-col items-center">
            <span className="grid h-9 w-9 place-items-center border border-gold bg-pit font-mono-num text-[13px] font-bold leading-none text-gold">
              03
            </span>
          </div>
          <div className="min-w-0 flex-1 border border-line bg-panel p-5 sm:p-6">
            <h2 className="font-display text-[20px] leading-none text-white">
              {t.checkout.payment}
            </h2>
            <p className="mt-3 text-[13.5px] leading-[1.65] text-muted">
              {t.checkout.paymentLead}
            </p>

            <div className="mt-5 flex flex-col gap-2.5">
              {enabledMethods.map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors duration-150 ${
                    method === m.id
                      ? "border-gold bg-gold/10"
                      : "border-line bg-pit hover:border-muted-dim"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-choice"
                    checked={method === m.id}
                    onChange={() => setMethod(m.id)}
                    className="sr-only"
                  />
                  <span
                    className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center border-2 ${
                      method === m.id ? "border-gold" : "border-line"
                    }`}
                  >
                    {method === m.id ? (
                      <span className="h-1.5 w-1.5 bg-gold" />
                    ) : null}
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-[16px] leading-tight text-white">
                      {locale === "en" && m.labelEn ? m.labelEn : m.label}
                    </span>
                    <span className="mt-1.5 block text-[13px] leading-[1.6] text-muted">
                      {locale === "en" && m.hintEn ? m.hintEn : m.hint}
                    </span>
                    {method === m.id && m.sendEmailAfterOrder === false ? (
                      <div className="mt-4 border border-line bg-panel-2 p-4">
                        <p className="font-display text-[14px] uppercase tracking-[0.08em] text-gold">
                          {t.checkout.paymentDetails}
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-[1.65] text-paper">
                          {locale === "en"
                            ? m.defaultPaymentDetailsEn || m.defaultPaymentDetails
                            : m.defaultPaymentDetails || m.defaultPaymentDetailsEn}
                        </p>
                        <p className="mt-2 text-[12.5px] leading-[1.6] text-muted">
                          {t.checkout.paymentDetailsHint}
                        </p>
                      </div>
                    ) : null}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </Reveal>
      </ol>

      {/* ── Order sheet (sticky on desktop) ──────────────────────── */}
      <aside className="lg:sticky lg:top-[92px]">
        <div className="border border-line bg-panel">
          <div aria-hidden="true" className="flag-band-sm h-[4px] w-full" />
          <div className="p-6">
            <h2 className="font-display text-[20px] leading-none text-white">
              {t.checkout.orderSummary}
            </h2>

            {lines.length ? (
              <ul className="mt-5 flex flex-col border-t border-line-soft">
                {lines.map((line) => (
                  <li
                    key={line.slug}
                    className="flex items-start justify-between gap-3 border-b border-line-soft py-3 last:border-b-0"
                  >
                    <span className="min-w-0">
                      <span className="block text-[13.5px] leading-snug text-paper">
                        {line.title}
                      </span>
                      <span className="mt-1 block font-mono-num text-[11px] text-muted-dim">
                        {money(line.price, locale)} × {line.qty}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono-num text-[14px] font-bold text-white">
                      {money(line.price * line.qty, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            <dl className="mt-5 flex flex-col gap-3 border-t border-line pt-5 text-[14px]">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.cart.subtotal}</dt>
                <dd className="font-mono-num text-paper">{money(subtotal, locale)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">{t.cart.shipping}</dt>
                <dd className="font-mono-num text-paper">
                  {fee > 0 ? money(fee, locale) : t.common.free}
                </dd>
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-line-soft pt-4">
                <dt className="font-display text-[15px] uppercase tracking-[0.1em] text-white">
                  {t.cart.total}
                </dt>
                <dd className="font-mono-num text-[22px] font-bold text-gold">
                  {money(total, locale)}
                </dd>
              </div>
            </dl>

            <p className="mt-4 text-[12px] leading-[1.6] text-muted-dim">
              {t.cart.shippingNote}
            </p>

            <button
              type="submit"
              disabled={pending || lines.length === 0}
              className="btn btn-primary btn-lg mt-6 w-full"
            >
              {pending ? (
                <i
                  className="fa-solid fa-circle-notch animate-spin text-[13px]"
                  aria-hidden="true"
                />
              ) : (
                <i className="fa-solid fa-lock" aria-hidden="true" />
              )}
              <span>{pending ? t.checkout.placing : t.checkout.placeOrder}</span>
            </button>
            <p className="mt-3 text-center text-[12.5px] leading-[1.6] text-muted">
              {t.checkout.byPlacing}
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}
