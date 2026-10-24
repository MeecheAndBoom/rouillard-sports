"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { AddToCart } from "@/components/site/AddToCart";
import { money } from "@/lib/format";
import { categoryLabel } from "@/lib/constants";
import { localizedTitle } from "@/lib/seo";
import type { Product } from "@/lib/types";

function StockBadge({
  product,
  labels,
}: {
  product: Product;
  labels: { inStock: string; out: string; low: string };
}) {
  if (product.stock <= 0) {
    return (
      <span className="badge badge-danger bg-pit/90">
        <i className="fa-solid fa-xmark" aria-hidden="true" /> {labels.out}
      </span>
    );
  }
  if (product.stock <= 3) {
    return (
      <span className="badge badge-warning bg-pit/90">
        <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> {labels.low}
      </span>
    );
  }
  return (
    <span className="badge badge-success bg-pit/90">
      <i className="fa-solid fa-check" aria-hidden="true" /> {labels.inStock}
    </span>
  );
}

/** Catalogue grid card: square, hairline, gold on hover. */
export function ProductCard({ product }: { product: Product }) {
  const { locale, t } = useLocale();
  const title = localizedTitle(product, locale);
  const hasDiscount = product.listPrice && product.listPrice > product.price;

  return (
    <article className="group relative flex h-full flex-col border border-line bg-panel transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gold/60">
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 z-10 h-[2px] w-0 bg-gold transition-all duration-300 ease-out group-hover:w-full"
      />
      <Link
        href={`/shop/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden border-b border-line bg-panel-2"
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
        <span className="absolute top-3 left-3 flex flex-col gap-1.5">
          <StockBadge
            product={product}
            labels={{
              inStock: t.common.inStock,
              out: t.common.outOfStock,
              low: t.common.lowStock,
            }}
          />
        </span>
        {hasDiscount ? (
          <span className="absolute top-3 right-3 bg-gold px-2 py-1 font-mono-num text-[11px] font-bold text-gold-ink">
            -{Math.round(((product.listPrice! - product.price) / product.listPrice!) * 100)}%
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 font-mono-num text-[10px] uppercase tracking-[0.1em]">
          <span className="text-muted-dim">{categoryLabel(product.category, locale)}</span>
          <span className="text-gold">{product.brand}</span>
        </div>

        <h3 className="mt-2.5 font-display text-[19px] leading-[1.05] text-white">
          <Link
            href={`/shop/${product.slug}`}
            className="line-clamp-2 transition-colors duration-150 hover:text-gold-light"
          >
            {title}
          </Link>
        </h3>

        <p className="mt-2 font-mono-num text-[10.5px] tracking-[0.04em] text-muted">
          {t.product.partNumber} {product.partNumber}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line-soft pt-4">
          <div className="flex flex-col">
            {hasDiscount ? (
              <span className="font-mono-num text-[11px] text-muted-dim line-through">
                {money(product.listPrice!, locale)}
              </span>
            ) : null}
            <span className="font-mono-num text-[19px] leading-none font-bold text-white">
              {money(product.price, locale)}
            </span>
          </div>
          <AddToCart product={product} compact />
        </div>
      </div>
    </article>
  );
}
