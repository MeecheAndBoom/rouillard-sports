"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { money } from "@/lib/format";
import { categoryLabel } from "@/lib/constants";
import { localizedTitle } from "@/lib/seo";
import type { Product } from "@/lib/types";

/** Compact rail tile: image square, reference line, price-forward. */
export function ProductCardCompact({ product }: { product: Product }) {
  const { locale, t } = useLocale();
  const title = localizedTitle(product, locale);

  return (
    <article className="group">
      <Link
        href={`/shop/${product.slug}`}
        className="relative block aspect-square overflow-hidden border border-line bg-panel-2 transition-colors duration-200 group-hover:border-gold/60"
        tabIndex={-1}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0] ?? "/images/placeholder.jpg"}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
        />
        <span className="absolute inset-x-0 bottom-0 h-[2px] w-0 bg-gold transition-all duration-300 group-hover:w-full" />
      </Link>
      <div className="mt-3">
        <p className="font-mono-num text-[10px] uppercase tracking-[0.1em] text-muted-dim">
          {categoryLabel(product.category, locale)}
        </p>
        <h3 className="mt-1.5 font-display text-[16px] leading-[1.08] text-white">
          <Link
            href={`/shop/${product.slug}`}
            className="line-clamp-2 transition-colors duration-150 hover:text-gold-light"
          >
            {title}
          </Link>
        </h3>
        <p className="mt-1.5 font-mono-num text-[13.5px] font-bold text-white">
          {money(product.price, locale)}
          {product.stock <= 0 ? (
            <span className="ml-2 font-mono-num text-[10px] font-normal tracking-[0.08em] text-danger">
              {t.common.outOfStock.toUpperCase()}
            </span>
          ) : null}
        </p>
      </div>
    </article>
  );
}
