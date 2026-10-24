"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { money } from "@/lib/format";

function titleOf(p: { title: string; titleEn?: string }, locale: "fr" | "en") {
  return locale === "en" && p.titleEn ? p.titleEn : p.title;
}
function descOf(p: { description: string; descriptionEn?: string }, locale: "fr" | "en") {
  return locale === "en" && p.descriptionEn ? p.descriptionEn : p.description;
}

type SpotProduct = {
  slug: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  listPrice?: number;
  images: string[];
  stock: number;
};

/**
 * Full-bleed rotating product stage. Each slide carries a telemetry index,
 * the part name, price and a save block; controls are square ticks rather
 * than dots.
 */
export function Spotlight({
  items,
  locale,
  ctaLabel,
  secondaryLabel,
}: {
  items: SpotProduct[];
  locale: "fr" | "en";
  ctaLabel: string;
  secondaryLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [items.length, tick]);

  function go(delta: number) {
    setIndex((i) => (i + delta + items.length) % items.length);
    setTick((t) => t + 1);
  }

  if (!items.length) return null;
  const item = items[index];
  const save = item.listPrice && item.listPrice > item.price ? item.listPrice - item.price : 0;

  return (
    <section className="on-dark relative isolate overflow-hidden border-y border-line bg-pit">
      <div className="relative min-h-[560px] sm:min-h-[640px]">
        {items.map((p, i) => (
          <div
            key={p.slug}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={i !== index}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.images[0]}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(100deg,rgba(8,9,10,0.97)_0%,rgba(8,9,10,0.9)_38%,rgba(8,9,10,0.45)_68%,rgba(8,9,10,0.15)_100%)]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,10,0.4)_0%,transparent_30%,rgba(8,9,10,0.55)_78%,rgba(8,9,10,0.98)_100%)]"
            />
            <div className="section relative flex min-h-[560px] items-end py-14 sm:min-h-[640px] sm:py-20">
              <div className="max-w-[560px]">
                <div className="flex items-center gap-4">
                  <span className="font-mono-num text-[13px] font-bold tracking-[0.16em] text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span aria-hidden="true" className="h-[1px] w-12 bg-gold/60" />
                  <span className="font-mono-num text-[11px] tracking-[0.16em] text-muted">
                    {String(items.length).padStart(2, "0")}
                  </span>
                </div>

                <h2 className="mt-5 font-display text-[34px] leading-[0.96] text-white sm:text-[50px]">
                  {titleOf(p, locale)}
                </h2>
                <p className="mt-4 line-clamp-3 max-w-[480px] text-[15.5px] leading-[1.7] text-muted">
                  {descOf(p, locale)}
                </p>

                <div className="mt-7 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <span className="font-mono-num text-[32px] leading-none font-bold text-white">
                    {money(p.price, locale)}
                  </span>
                  {p.listPrice && p.listPrice > p.price ? (
                    <span className="font-mono-num text-[16px] text-muted-dim line-through">
                      {money(p.listPrice, locale)}
                    </span>
                  ) : null}
                  {save > 0 ? (
                    <span className="border border-gold/60 px-2 py-1 font-mono-num text-[11px] font-bold tracking-[0.06em] text-gold">
                      -{money(save, locale)}
                    </span>
                  ) : null}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={`/shop/${p.slug}`} className="btn btn-primary btn-lg">
                    <span>{ctaLabel}</span>
                    <i className="fa-solid fa-arrow-right text-[12px]" aria-hidden="true" />
                  </Link>
                  <Link href="/shop" className="btn btn-dark btn-lg">
                    <span>{secondaryLabel}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div aria-hidden="true" className="flag-band-sm absolute inset-x-0 bottom-0 h-[6px] opacity-70" />
      </div>

      {items.length > 1 ? (
        <div className="absolute right-6 bottom-8 z-10 flex items-center gap-2 sm:right-10">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous product"
            className="grid h-10 w-10 place-items-center border border-line bg-pit/70 text-paper transition-colors duration-200 hover:border-gold hover:text-gold"
          >
            <i className="fa-solid fa-arrow-left text-[11px]" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-1.5">
            {items.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => {
                  setIndex(i);
                  setTick((t) => t + 1);
                }}
                aria-label={`Show ${titleOf(p, locale)}`}
                aria-current={i === index}
                className={`h-[3px] transition-all duration-300 ${
                  i === index ? "w-8 bg-gold" : "w-4 bg-panel/70 hover:bg-panel/70"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next product"
            className="grid h-10 w-10 place-items-center border border-line bg-pit/70 text-paper transition-colors duration-200 hover:border-gold hover:text-gold"
          >
            <i className="fa-solid fa-arrow-right text-[11px]" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
