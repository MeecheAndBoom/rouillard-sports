"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useCart, cartSubtotal } from "@/store/cart";
import { money } from "@/lib/format";

/** Full cart page: line items with steppers plus the totals rail. */
export function CartView({
  deliveryFee,
  freeThreshold,
}: {
  deliveryFee: number;
  freeThreshold: number;
}) {
  const { locale, t } = useLocale();
  const lines = useCart((s) => s.lines);
  const remove = useCart((s) => s.remove);
  const setQty = useCart((s) => s.setQty);
  const clear = useCart((s) => s.clear);

  const subtotal = cartSubtotal(lines);

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 border border-line bg-panel px-8 py-20 text-center">
        <span className="grid h-16 w-16 place-items-center border border-line text-[22px] text-gold">
          <i className="fa-solid fa-bag-shopping" aria-hidden="true" />
        </span>
        <p className="text-[16px] text-muted">{t.cart.empty}</p>
        <Link href="/shop" className="btn btn-primary">
          {t.cart.browse}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div>
        <ul className="flex flex-col">
          {lines.map((line) => (
            <li
              key={line.slug}
              className="flex gap-4 border-b border-line py-6 first:pt-0 sm:gap-5"
            >
              <Link
                href={`/shop/${line.slug}`}
                className="h-24 w-24 shrink-0 overflow-hidden border border-line bg-panel-2 sm:h-28 sm:w-28"
                tabIndex={-1}
                aria-hidden="true"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={line.image} alt="" className="h-full w-full object-cover" />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/shop/${line.slug}`}
                    className="font-display text-[18px] leading-[1.1] text-white transition-colors hover:text-gold-light"
                  >
                    {line.title}
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(line.slug)}
                    className="p-1 text-muted-dim transition-colors hover:text-danger"
                    aria-label={`${t.cart.remove}: ${line.title}`}
                  >
                    <i className="fa-regular fa-trash-can text-[14px]" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between gap-4 border-t border-line-soft pt-3">
                  <div className="flex h-8 items-center border border-line">
                    <button
                      type="button"
                      onClick={() => setQty(line.slug, line.qty - 1)}
                      disabled={line.qty <= 1}
                      className="grid h-8 w-8 place-items-center text-muted transition-colors hover:text-gold-light disabled:opacity-30"
                      aria-label="−"
                    >
                      <i className="fa-solid fa-minus text-[10px]" aria-hidden="true" />
                    </button>
                    <span className="w-8 text-center font-mono-num text-[13px] text-paper">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(line.slug, line.qty + 1)}
                      disabled={line.qty >= Math.min(line.stock || 99, 99)}
                      className="grid h-8 w-8 place-items-center text-muted transition-colors hover:text-gold-light disabled:opacity-30"
                      aria-label="+"
                    >
                      <i className="fa-solid fa-plus text-[10px]" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-mono-num text-[11px] text-muted-dim">
                      {money(line.price, locale)} × {line.qty}
                    </p>
                    <p className="font-mono-num text-[17px] font-bold text-white">
                      {money(line.price * line.qty, locale)}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/shop" className="btn btn-ghost btn-sm">
            <i className="fa-solid fa-arrow-left text-[11px]" aria-hidden="true" />
            <span>{t.cart.continueShopping}</span>
          </Link>
          <button
            type="button"
            onClick={clear}
            className="text-[12.5px] text-muted-dim underline-offset-4 transition-colors hover:text-danger hover:underline"
          >
            {t.cart.clear}
          </button>
        </div>
      </div>

      <aside className="h-fit border border-line bg-panel lg:sticky lg:top-[92px]">
        <div aria-hidden="true" className="flag-band-sm h-[4px] w-full" />
        <div className="p-6">
          <h2 className="font-display text-[20px] leading-none text-white">{t.cart.summary}</h2>
          <dl className="mt-5 flex flex-col gap-3 text-[14px]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t.cart.subtotal}</dt>
              <dd className="font-mono-num text-paper">{money(subtotal, locale)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t.cart.shipping}</dt>
              <dd className="text-right font-mono-num text-[12px] text-muted-dim">
                {subtotal >= freeThreshold
                  ? t.common.free
                  : `${money(deliveryFee, locale)} / ${t.cart.freeFrom.replace("{amount}", money(freeThreshold, locale))}`}
              </dd>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-line pt-4">
              <dt className="font-display text-[15px] uppercase tracking-[0.1em] text-white">
                {t.cart.total}
              </dt>
              <dd className="font-mono-num text-[22px] font-bold text-gold">
                {money(subtotal, locale)}
              </dd>
            </div>
          </dl>
          <Link href="/checkout" className="btn btn-primary btn-lg mt-6 w-full">
            <span>{t.cart.proceedCheckout}</span>
            <i className="fa-solid fa-arrow-right text-[12px]" aria-hidden="true" />
          </Link>
          <p className="mt-3 text-center text-[12px] leading-[1.5] text-muted-dim">
            {t.cart.shippingNote}
          </p>
        </div>
      </aside>
    </div>
  );
}
