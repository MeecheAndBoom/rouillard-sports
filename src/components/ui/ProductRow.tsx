"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { AddToCart } from "@/components/site/AddToCart";
import { money } from "@/lib/format";
import { categoryLabel } from "@/lib/constants";
import { localizedTitle } from "@/lib/seo";
import type { Product } from "@/lib/types";

/** Specification row for list view: reference-first, comparison friendly. */
export function ProductRow({ product }: { product: Product }) {
  const { locale, t } = useLocale();
  const title = localizedTitle(product, locale);

  return (
    <article className="group relative flex gap-4 border border-line bg-panel p-4 transition-colors duration-200 hover:border-gold/50 sm:gap-5 sm:p-5">
      <Link
        href={`/shop/${product.slug}`}
        className="block h-24 w-24 shrink-0 overflow-hidden border border-line bg-panel-2 sm:h-28 sm:w-28"
        tabIndex={-1}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0] ?? "/images/placeholder.jpg"}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="font-mono-num text-[10px] uppercase tracking-[0.1em]">
          <span className="text-muted-dim">{categoryLabel(product.category, locale)}</span>
          <span className="mx-2 text-line">/</span>
          <span className="text-gold">{product.brand}</span>
        </p>
        <h3 className="mt-1.5 truncate font-display text-[18px] leading-none text-white">
          <Link
            href={`/shop/${product.slug}`}
            className="transition-colors hover:text-gold-light"
          >
            {title}
          </Link>
        </h3>
        <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-mono-num text-[10.5px] tracking-[0.02em] text-muted">
          <div className="flex gap-1.5">
            <dt className="text-muted-dim">{t.product.partNumber}</dt>
            <dd className="text-paper">{product.partNumber}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-muted-dim">{t.product.model}</dt>
            <dd className="text-paper">{product.model}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-muted-dim">{t.product.condition}</dt>
            <dd className="text-paper">
              {t.shop.conditions[product.condition] ?? product.condition}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line-soft pt-3">
          <span className="font-mono-num text-[17px] font-bold text-white">
            {money(product.price, locale)}
            {product.stock <= 0 ? (
              <span className="ml-2 font-mono-num text-[10px] font-normal tracking-[0.08em] text-danger">
                {t.common.outOfStock.toUpperCase()}
              </span>
            ) : null}
          </span>
          <AddToCart product={product} compact />
        </div>
      </div>
    </article>
  );
}
