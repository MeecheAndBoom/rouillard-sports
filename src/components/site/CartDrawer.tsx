"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useCart, cartSubtotal, cartCount } from "@/store/cart";
import { money } from "@/lib/format";
import { useToast } from "@/components/ui/Toast";

/** Event the top bar dispatches to open the cart panel. */
export const CART_OPEN_EVENT = "rs:cart-open";

/**
 * Slide-in cart panel. Escape and backdrop click dismiss it; focus is trapped
 * by the browser while `inert` is off, and the panel slides on a spring-ish
 * ease-out curve.
 */
export function CartDrawer() {
  const { locale, t } = useLocale();
  const lines = useCart((s) => s.lines);
  const remove = useCart((s) => s.remove);
  const setQty = useCart((s) => s.setQty);
  const [open, setOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(CART_OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(CART_OPEN_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const subtotal = cartSubtotal(lines);
  const count = cartCount(lines);

  return (
    <>
      <div
        role="presentation"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/70 backdrop-blur-[2px] transition-opacity duration-[320ms] ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-hidden={!open}
        inert={!open}
        aria-label={t.cart.drawerTitle}
        className={`fixed top-0 right-0 z-[61] flex h-full w-full max-w-[410px] flex-col border-l border-line bg-pit shadow-[0_0_80px_rgba(0,0,0,0.7)] transition-transform duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div aria-hidden="true" className="flag-band-sm h-[4px] w-full shrink-0" />
        <header className="flex shrink-0 items-center justify-between border-b border-line px-6 py-5">
          <h2 className="flex items-baseline gap-2 font-display text-[22px] leading-none text-white">
            {t.cart.drawerTitle}
            {count > 0 ? (
              <span className="font-mono-num text-[12px] font-normal text-gold">({count})</span>
            ) : null}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-8 w-8 place-items-center border border-line text-muted transition-all duration-150 hover:border-gold hover:text-gold-light active:scale-95"
            aria-label={t.nav.close}
          >
            <i className="fa-solid fa-xmark text-[13px]" aria-hidden="true" />
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <span className="grid h-16 w-16 place-items-center border border-line text-[22px] text-gold">
              <i className="fa-solid fa-bag-shopping" aria-hidden="true" />
            </span>
            <p className="text-[15px] text-muted">{t.cart.drawerEmpty}</p>
            <Link href="/shop" onClick={() => setOpen(false)} className="btn btn-primary btn-sm">
              {t.cart.browse}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6 py-4">
              {lines.map((line) => (
                <li
                  key={line.slug}
                  className="flex gap-4 border-b border-line-soft py-4 last:border-b-0"
                >
                  <Link
                    href={`/shop/${line.slug}`}
                    onClick={() => setOpen(false)}
                    className="h-16 w-16 shrink-0 overflow-hidden border border-line bg-panel-2"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={line.image} alt="" className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={`/shop/${line.slug}`}
                      onClick={() => setOpen(false)}
                      className="line-clamp-2 font-display text-[15px] leading-[1.15] text-white transition-colors hover:text-gold-light"
                    >
                      {line.title}
                    </Link>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <div className="flex h-7 items-center border border-line">
                        <button
                          type="button"
                          onClick={() => setQty(line.slug, line.qty - 1)}
                          className="grid h-7 w-7 place-items-center text-muted transition-colors hover:text-gold-light disabled:opacity-30"
                          disabled={line.qty <= 1}
                          aria-label="−"
                        >
                          <i className="fa-solid fa-minus text-[9px]" aria-hidden="true" />
                        </button>
                        <span className="w-7 text-center font-mono-num text-[12px] text-paper">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(line.slug, line.qty + 1)}
                          className="grid h-7 w-7 place-items-center text-muted transition-colors hover:text-gold-light disabled:opacity-30"
                          disabled={line.qty >= Math.min(line.stock || 99, 99)}
                          aria-label="+"
                        >
                          <i className="fa-solid fa-plus text-[9px]" aria-hidden="true" />
                        </button>
                      </div>
                      <span className="font-mono-num text-[13.5px] font-bold text-white">
                        {money(line.price * line.qty, locale)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      remove(line.slug);
                      toast.show(t.cart.remove, { type: "info" });
                    }}
                    className="self-start p-1 text-muted-dim transition-colors hover:text-danger"
                    aria-label={`${t.cart.remove}: ${line.title}`}
                  >
                    <i className="fa-regular fa-trash-can text-[13px]" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>

            <footer className="shrink-0 border-t border-line px-6 py-5">
              <div className="flex items-center justify-between">
                <span className="font-display text-[12px] uppercase tracking-[0.14em] text-muted">
                  {t.cart.drawerSubtotal}
                </span>
                <span className="font-mono-num text-[19px] font-bold text-white">
                  {money(subtotal, locale)}
                </span>
              </div>
              <p className="mt-1.5 text-[12px] text-muted-dim">{t.cart.shippingNote}</p>
              <div className="mt-4 flex flex-col gap-2.5">
                <Link href="/checkout" onClick={() => setOpen(false)} className="btn btn-primary w-full">
                  {t.cart.drawerCheckout}
                </Link>
                <Link href="/cart" onClick={() => setOpen(false)} className="btn btn-outline w-full">
                  {t.cart.drawerView}
                </Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
