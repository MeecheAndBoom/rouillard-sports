import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, getLocale } from "@/lib/i18n/server";
import { getProduct, getRelatedProducts } from "@/lib/products";
import {
  breadcrumbJsonLd,
  productJsonLd,
  productTitle,
  productDescription,
  localizedDescription,
  pageMetadata,
} from "@/lib/seo";
import { money, shortDate } from "@/lib/format";
import { categoryLabel } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/site/PageHeader";
import { Gallery } from "@/components/site/Gallery";
import { AddToCart } from "@/components/site/AddToCart";
import { ProductCard } from "@/components/ui/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const product = await getProduct(slug);
  if (!product) return { title: "404" };
  return pageMetadata({
    title: productTitle(product, locale),
    description: productDescription(product, locale),
    path: `/shop/${product.slug}`,
    locale,
    image: product.images[0],
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getDict();
  const locale = await getLocale();
  const product = await getProduct(slug);
  if (!product || product.status === "draft") notFound();

  const related = await getRelatedProducts(product, 3);
  const title = locale === "en" && product.titleEn ? product.titleEn : product.title;
  const discipline = categoryLabel(product.category, locale);
  const save =
    product.listPrice && product.listPrice > product.price
      ? product.listPrice - product.price
      : null;

  /** The race-entry sheet: one fact per cell, hairline divided. */
  const entry: { label: string; value: string }[] = [
    { label: t.product.brand, value: product.brand },
    { label: t.product.make, value: product.make },
    { label: t.product.model, value: product.model },
    { label: t.product.condition, value: t.shop.conditions[product.condition] },
  ];
  if (product.yearRange) {
    entry.push({ label: t.product.years, value: product.yearRange });
  }
  if (product.weightKg) {
    entry.push({ label: t.product.weight, value: `${product.weightKg} kg` });
  }
  if (product.sku) {
    entry.push({ label: t.product.sku, value: product.sku });
  }

  return (
    <div className="page-enter">
      <Breadcrumbs
        items={[
          { label: t.shop.breadcrumbHome, href: "/" },
          { label: t.product.breadcrumbShop, href: "/shop" },
          { label: title },
        ]}
      />

      {/* ── Tech sheet ──────────────────────────────────────────── */}
      <section className="border-b border-line bg-pit">
        <div className="section grid gap-10 py-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-14">
          <div className="min-w-0 lg:sticky lg:top-[92px] lg:self-start">
            <Gallery
              images={product.images}
              alt={t.product.galleryAlt.replace("{title}", title)}
              autoRotate
              badge={
                product.stock > 0 ? (
                  <span className="badge badge-success bg-pit/90">
                    <i className="fa-solid fa-check text-[10px]" aria-hidden="true" />
                    {t.common.inStock}
                  </span>
                ) : undefined
              }
            />
          </div>

          <div className="min-w-0 flex flex-col">
            {/* Reference stamp */}
            <div className="flex flex-wrap items-stretch gap-px bg-line">
              <div className="flex-1 min-w-[140px] bg-panel px-4 py-3">
                <p className="font-mono-num text-[9.5px] uppercase tracking-[0.18em] text-muted-dim">
                  {t.product.partNumber}
                </p>
                <p className="mt-1 break-words font-mono-num text-[16px] leading-none font-bold text-gold sm:text-[21px]">
                  {product.partNumber}
                </p>
              </div>
              <div className="flex-1 min-w-[140px] bg-panel px-4 py-3">
                <p className="font-mono-num text-[9.5px] uppercase tracking-[0.18em] text-muted-dim">
                  {t.product.brand}
                </p>
                <p className="mt-1 break-words font-display text-[16px] leading-none text-white sm:text-[21px]">
                  {product.brand}
                </p>
              </div>
            </div>

            <h1 className="mt-7 break-words font-display text-[24px] leading-[0.98] text-white sm:text-[42px]">
              {title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="badge badge-quiet">{discipline}</span>
              <span className="badge badge-quiet">
                {t.shop.conditions[product.condition]}
              </span>
              {save ? (
                <span className="badge badge-gold">
                  <i className="fa-solid fa-arrow-down text-[9px]" aria-hidden="true" />
                  {money(save, locale)}
                </span>
              ) : null}
            </div>

            {/* Price block */}
            <div className="mt-7 border border-line bg-panel">
              <div aria-hidden="true" className="livery h-[3px] w-full" />
              <div className="flex flex-wrap items-end justify-between gap-4 px-5 py-5">
                <div>
                  <p className="font-mono-num text-[30px] leading-none font-bold text-white">
                    {money(product.price, locale)}
                  </p>
                  <p className="mt-2 text-[12.5px] text-muted-dim">
                    {t.common.perUnit}
                    {product.listPrice && product.listPrice > product.price ? (
                      <span className="ml-2 font-mono-num text-muted-dim line-through">
                        {money(product.listPrice, locale)}
                      </span>
                    ) : null}
                  </p>
                </div>
                <p className="font-mono-num text-[11px] uppercase tracking-[0.14em] text-muted-dim">
                  {t.product.stockLabel}:{" "}
                  <span
                    className={
                      product.stock > 3
                        ? "text-success"
                        : product.stock > 0
                          ? "text-warning"
                          : "text-danger"
                    }
                  >
                    {product.stock}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-5">
              <AddToCart product={product} full />
            </div>

            <p className="mt-4 flex items-start gap-3 border border-line-soft bg-panel-2 px-4 py-3.5 text-[13.5px] leading-[1.7] text-muted">
              <i
                className="fa-solid fa-shield-halved mt-1 shrink-0 text-[13px] text-gold"
                aria-hidden="true"
              />
              <span>{t.product.trustLine}</span>
            </p>

            {/* Compatibility */}
            <section className="mt-8">
              <h2 className="font-display text-[20px] leading-none text-white">
                {t.product.compatibility}
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="badge badge-quiet">
                  {t.product.make}: {product.make}
                </span>
                <span className="badge badge-quiet">
                  {t.product.model}: {product.model}
                </span>
                {product.yearRange ? (
                  <span className="badge badge-quiet">
                    {t.product.years}: {product.yearRange}
                  </span>
                ) : null}
              </div>
              {product.fitment.length ? (
                <ul className="mt-4 grid gap-2">
                  {product.fitment.map((line) => (
                    <li key={line} className="flex gap-3 text-[14.5px] text-muted">
                      <i
                        className="fa-solid fa-check mt-1 shrink-0 text-[11px] text-success"
                        aria-hidden="true"
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          </div>
        </div>
      </section>

      {/* ── Entry sheet strip ──────────────────────────────────── */}
      <div aria-hidden="true" className="flag-band-sm h-[6px] w-full opacity-70" />

      <section className="border-b border-line bg-asphalt">
        <div className="overflow-x-auto">
          <dl className="section grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-6">
            {entry.map((cell) => (
              <div key={cell.label} className="min-w-0 bg-asphalt px-4 py-5">
                <dt className="font-mono-num text-[9.5px] uppercase tracking-[0.18em] text-muted-dim">
                  {cell.label}
                </dt>
                <dd className="mt-1.5 break-all font-display text-[16px] leading-none text-white sm:text-[17px]">
                  {cell.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Detail body ─────────────────────────────────────────── */}
      <section className="border-b border-line bg-pit">
        <div className="section grid gap-10 py-14 lg:grid-cols-[1.35fr_1fr] lg:gap-14 lg:py-16">
          <div>
            <h2 className="font-display text-[26px] leading-none text-white sm:text-[32px]">
              {t.product.description}
            </h2>
            <p className="mt-5 whitespace-pre-line text-[16px] leading-[1.8] text-muted">
              {localizedDescription(product, locale)}
            </p>

            {product.features.length ? (
              <>
                <h3 className="mt-11 font-display text-[20px] leading-none text-white">
                  {t.product.features}
                </h3>
                <ul className="mt-5 grid gap-3">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex gap-3.5 text-[15.5px] text-muted">
                      <span
                        aria-hidden="true"
                        className="mt-[9px] h-[5px] w-[5px] shrink-0 bg-gold"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {product.oemNumbers.length ? (
              <>
                <h3 className="mt-11 font-display text-[20px] leading-none text-white">
                  {t.product.oemNumbers}
                </h3>
                <div className="mt-5 flex flex-wrap gap-2">
                  {product.oemNumbers.map((oem) => (
                    <span
                      key={oem}
                      className="border border-line bg-panel px-2.5 py-1 font-mono-num text-[12px] text-paper"
                    >
                      {oem}
                    </span>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <div className="flex flex-col gap-6">
            {Object.keys(product.specs).length ? (
              <div className="border border-line bg-panel">
                <div aria-hidden="true" className="flag-band-sm h-[4px] w-full" />
                <div className="p-6">
                  <h2 className="font-display text-[18px] leading-none text-white">
                    {t.product.specs}
                  </h2>
                  <dl className="mt-5 flex flex-col">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between gap-4 border-b border-line-soft py-3 last:border-0"
                      >
                        <dt className="text-[14px] text-muted">{key}</dt>
                        <dd className="text-right font-mono-num text-[13.5px] text-paper">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            ) : null}

            <div className="border border-line bg-panel p-6">
              <h2 className="font-display text-[18px] leading-none text-white">
                {t.product.stockLabel}
              </h2>
              <dl className="mt-5 flex flex-col gap-3 text-[14.5px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">{t.product.category}</dt>
                  <dd className="text-paper">{discipline}</dd>
                </div>
                {product.weightKg ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">{t.product.weight}</dt>
                    <dd className="font-mono-num text-paper">{product.weightKg} kg</dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">{t.product.condition}</dt>
                  <dd className="text-paper">
                    {t.shop.conditions[product.condition]}
                  </dd>
                </div>
                {product.sku ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">{t.product.sku}</dt>
                    <dd className="font-mono-num text-paper">{product.sku}</dd>
                  </div>
                ) : null}
                {product.createdAt ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">{t.product.updated}</dt>
                    <dd className="font-mono-num text-paper">
                      {shortDate(product.createdAt, locale)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related ─────────────────────────────────────────────── */}
      {related.length ? (
        <section className="section section-pad bg-asphalt">
          <Reveal className="mb-9 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-[26px] leading-none text-white sm:text-[34px]">
                {t.product.related}
              </h2>
              <p className="mt-3.5 max-w-[62ch] text-[15.5px] leading-[1.7] text-muted">
                {t.product.relatedLead}
              </p>
            </div>
            <Link href="/shop" className="btn btn-ghost btn-sm">
              <i className="fa-solid fa-arrow-left text-[11px]" aria-hidden="true" />
              <span>{t.product.backToShop}</span>
            </Link>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item, i) => (
              <Reveal key={item.slug} delay={i * 60}>
                <ProductCard product={item} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <JsonLd data={productJsonLd(product, locale)} />
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: t.shop.breadcrumbHome, path: "/" },
            { name: t.product.breadcrumbShop, path: "/shop" },
            { name: title, path: `/shop/${product.slug}` },
          ],
          locale,
        )}
      />
    </div>
  );
}
