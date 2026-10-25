import Link from "next/link";
import { getDict, getLocale } from "@/lib/i18n/server";
import { getProducts } from "@/lib/products";
import { getTiles } from "@/lib/categories";
import { getFeaturedPosts } from "@/lib/blog";
import { getReviews } from "@/lib/reviews";
import { ProductCard } from "@/components/ui/ProductCard";
import { ProductCardCompact } from "@/components/ui/ProductCardCompact";
import { ScrollRail } from "@/components/ui/ScrollRail";
import { ReviewsMarquee } from "@/components/site/ReviewsMarquee";
import { Spotlight } from "@/components/site/Spotlight";
import { HeroBackground } from "@/components/site/HeroBackground";
import { BrandsMarquee } from "@/components/site/BrandsMarquee";
import { Reveal } from "@/components/ui/Reveal";
import { PART_CATEGORIES, categoryLabel } from "@/lib/constants";
import { shortDate } from "@/lib/format";

/** Local editorial still for every discipline, keyed by category slug. */
const DISCIPLINE_IMAGE: Record<string, string> = {
  Brakes: "/images/categories/brakes-1.jpg",
  Suspension: "/images/categories/suspension-1.jpg",
  Engine: "/images/categories/engine-1.jpg",
  Transmission: "/images/categories/transmission-1.jpg",
  Exhaust: "/images/categories/exhaust-1.jpg",
  Aero: "/images/categories/aero-1.jpg",
  Cooling: "/images/categories/cooling-1.jpg",
  Electronics: "/images/categories/electronics-1.jpg",
  Safety: "/images/categories/safety-1.jpg",
  Wheels: "/images/categories/wheels-1.jpg",
  Tires: "/images/categories/tires-1.jpg",
  Fluids: "/images/categories/fluids-1.jpg",
  Interior: "/images/categories/interior-1.jpg",
  Tools: "/images/categories/tools-1.jpg",
};

const WHY_ICONS = ["fa-magnifying-glass", "fa-box-open", "fa-truck-fast"];

export default async function HomePage() {
  const t = await getDict();
  const locale = await getLocale();
  const [products, tiles, posts, reviews] = await Promise.all([
    getProducts(),
    getTiles("category"),
    getFeaturedPosts(3),
    getReviews(),
  ]);

  const featured = (() => {
    const f = products.filter((p) => p.featured);
    return (f.length ? f : products).slice(0, 6);
  })();

  // Full-bleed spotlight: discounted, in-stock parts with photos, auto-rotates.
  const spotlightItems = (() => {
    const discounted = products.filter(
      (p) => p.listPrice && p.price < p.listPrice && p.stock > 0 && p.images[0],
    );
    const inStock = products.filter(
      (p) => p.stock > 0 && p.images[0] && !discounted.includes(p),
    );
    const pool = [...discounted, ...inStock].slice(0, 5);
    return pool.length ? pool : products.filter((p) => p.images[0]).slice(0, 1);
  })();

  const spotlightSlugs = new Set(spotlightItems.map((p) => p.slug));

  // Horizontal rail: newest arrivals first, spotlight excluded.
  const arrivals = (() => {
    const pool = products.filter((p) => !spotlightSlugs.has(p.slug));
    const sorted = [...pool].sort(
      (a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
    );
    return (sorted.length ? sorted : pool).slice(0, 8);
  })();

  // Discipline index: taxonomy tiles win on imagery, local stills as fallback.
  const tileImage = new Map(tiles.map((tile) => [tile.name, tile.image]));
  const disciplines = PART_CATEGORIES.map((name) => ({
    name,
    label: categoryLabel(name, locale),
    image:
      tileImage.get(name) ||
      DISCIPLINE_IMAGE[name] ||
      "/images/placeholder.jpg",
  }));

  const marqueeReviews = reviews.slice(0, 8);

  return (
    <div className="page-enter">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="on-dark relative overflow-hidden border-b border-line bg-pit">
        <HeroBackground />
        <div className="section relative pt-24 pb-14 sm:pt-32 sm:pb-20">
          <div className="max-w-[740px]">
            <h1 className="font-display text-[44px] leading-[0.92] text-white sm:text-[74px] lg:text-[86px]">
              {t.home.heroTitle}
            </h1>
            <p className="mt-6 max-w-[540px] text-[16.5px] leading-[1.7] text-muted sm:text-[18px]">
              {t.home.heroLead}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-primary btn-lg">
                <span>{t.home.heroCta}</span>
                <i className="fa-solid fa-arrow-right text-[12px]" aria-hidden="true" />
              </Link>
              <Link href="/contact" className="btn btn-outline btn-lg">
                <i className="fa-solid fa-magnifying-glass text-[12px]" aria-hidden="true" />
                <span>{t.home.heroSecondary}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Telemetry strip: the numbers a team reads before the session. */}
        <div className="border-t border-line bg-pit/90 backdrop-blur-md">
          <ul className="section grid grid-cols-2 lg:grid-cols-4">
            {t.home.stats.map((stat, i) => (
              <li
                key={stat.label}
                className={`py-6 ${i % 2 === 1 ? "border-l border-line pl-5" : "pr-5"} ${
                  i >= 2 ? "border-t border-line lg:border-t-0" : ""
                }`}
              >
                <p className="font-mono-num text-[25px] leading-none font-bold text-gold">
                  {stat.value}
                </p>
                <p className="mt-2.5 font-mono-num text-[10.5px] uppercase tracking-[0.14em] text-muted-dim">
                  {stat.label}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Discipline index ─────────────────────────────────────── */}
      <section className="border-b border-line bg-asphalt">
        <div className="section section-pad">
          <Reveal>
            <h2 className="font-display text-[30px] leading-none text-white sm:text-[42px]">
              {t.home.categoriesTitle}
            </h2>
            <p className="mt-4 max-w-[62ch] text-[16.5px] leading-[1.7] text-muted">
              {t.home.categoriesLead}
            </p>
          </Reveal>

          <ul className="mt-12 border-t border-line">
            {disciplines.map((discipline, i) => (
              <li key={discipline.name}>
                <Reveal delay={Math.min(i, 8) * 40}>
                  <Link
                    href={`/shop?category=${encodeURIComponent(discipline.name)}`}
                    className="group flex items-center gap-4 border-b border-line py-4 transition-colors duration-200 hover:bg-panel/60 sm:gap-8 sm:py-5"
                  >
                    <span className="w-7 shrink-0 font-mono-num text-[11px] font-bold tracking-[0.1em] text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 font-display text-[23px] leading-none text-white transition-colors duration-200 group-hover:text-gold-light sm:text-[36px]">
                      {discipline.label}
                    </span>
                    <span className="hidden h-16 w-28 shrink-0 overflow-hidden border border-line opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={discipline.image}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </span>
                    <i
                      className="fa-solid fa-arrow-right w-4 shrink-0 text-[12px] text-muted-dim transition-all duration-200 group-hover:translate-x-1 group-hover:text-gold"
                      aria-hidden="true"
                    />
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Spotlight ────────────────────────────────────────────── */}
      {spotlightItems.length ? (
        <Spotlight
          items={spotlightItems}
          locale={locale}
          ctaLabel={t.home.spotlightCta}
          secondaryLabel={t.home.heroCta}
        />
      ) : null}

      {/* ── Featured grid ────────────────────────────────────────── */}
      <section className="border-b border-line bg-pit">
        <div className="section section-pad">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h2 className="font-display text-[30px] leading-none text-white sm:text-[42px]">
                {t.home.featuredTitle}
              </h2>
              <p className="mt-4 max-w-[62ch] text-[16.5px] leading-[1.7] text-muted">
                {t.home.featuredLead}
              </p>
            </div>
            <Link href="/shop" className="btn btn-ghost btn-sm">
              <span>{t.footer.allParts}</span>
              <i className="fa-solid fa-arrow-right text-[11px]" aria-hidden="true" />
            </Link>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product, i) => (
              <Reveal key={product.slug} delay={i * 60}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── New arrivals rail ────────────────────────────────────── */}
      {arrivals.length ? (
        <section className="border-b border-line bg-asphalt">
          <div className="section section-pad">
            <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-5">
              <div>
                <h2 className="font-display text-[30px] leading-none text-white sm:text-[42px]">
                  {t.home.railTitle}
                </h2>
                <p className="mt-4 max-w-[62ch] text-[16.5px] leading-[1.7] text-muted">
                  {t.home.railLead}
                </p>
              </div>
              <Link href="/shop" className="btn btn-ghost btn-sm">
                <span>{t.footer.allParts}</span>
                <i className="fa-solid fa-arrow-right text-[11px]" aria-hidden="true" />
              </Link>
            </Reveal>
            <ScrollRail
              label={t.home.railTitle}
              prevLabel={t.home.railPrev}
              nextLabel={t.home.railNext}
            >
              {arrivals.map((product, i) => (
                <Reveal
                  key={product.slug}
                  delay={i * 45}
                  className="w-[250px] shrink-0 sm:w-[290px]"
                >
                  <ProductCardCompact product={product} />
                </Reveal>
              ))}
            </ScrollRail>
          </div>
        </section>
      ) : null}

      {/* ── Why us ───────────────────────────────────────────────── */}
      <section className="border-b border-line bg-pit">
        <div className="section section-pad">
          <Reveal>
            <h2 className="font-display text-[30px] leading-none text-white sm:text-[42px]">
              {t.home.whyTitle}
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-px bg-line md:grid-cols-3">
            {t.home.why.map((item, i) => (
              <Reveal key={item.title} delay={i * 70}>
                <article className="relative h-full bg-pit p-8">
                  <span className="font-mono-num text-[12px] font-bold tracking-[0.16em] text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-6 grid h-11 w-11 place-items-center border border-line text-[15px] text-gold"
                  >
                    <i className={`fa-solid ${WHY_ICONS[i] ?? "fa-check"}`} />
                  </span>
                  <h3 className="mt-6 font-display text-[22px] leading-none text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3.5 text-[15.5px] leading-[1.7] text-muted">{item.body}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-9">
            <Link href="/why-buy-from-us" className="btn btn-ghost btn-sm">
              <span>{t.whyBuy.title}</span>
              <i className="fa-solid fa-arrow-right text-[11px]" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Brands (sponsor board) ───────────────────────────────── */}
      <section className="border-b border-line bg-pit">
        <div className="section py-12">
          <Reveal className="mb-8">
            <h2 className="font-display text-[22px] leading-none text-white sm:text-[28px]">
              {t.home.brandsTitle}
            </h2>
            <p className="mt-3 max-w-[62ch] text-[15.5px] leading-[1.7] text-muted">
              {t.home.brandsLead}
            </p>
          </Reveal>
          <BrandsMarquee />
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────────── */}
      {marqueeReviews.length ? (
        <section className="border-b border-line bg-asphalt">
          <div className="section section-pad">
            <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-5">
              <div>
                <h2 className="font-display text-[30px] leading-none text-white sm:text-[42px]">
                  {t.home.testimonialsTitle}
                </h2>
                <p className="mt-4 max-w-[62ch] text-[16.5px] leading-[1.7] text-muted">
                  {t.home.testimonialsLead}
                </p>
              </div>
              <Link href="/testimonials" className="btn btn-ghost btn-sm">
                <span>{t.home.testimonialsCta}</span>
                <i className="fa-solid fa-arrow-right text-[11px]" aria-hidden="true" />
              </Link>
            </Reveal>
            <ReviewsMarquee reviews={marqueeReviews} locale={locale} />
          </div>
        </section>
      ) : null}

      {/* ── Blog ─────────────────────────────────────────────────── */}
      {posts.length ? (
        <section className="border-b border-line bg-pit">
          <div className="section section-pad">
            <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-5">
              <div>
                <h2 className="font-display text-[30px] leading-none text-white sm:text-[42px]">
                  {t.home.blogTitle}
                </h2>
                <p className="mt-4 max-w-[62ch] text-[16.5px] leading-[1.7] text-muted">
                  {t.home.blogLead}
                </p>
              </div>
              <Link href="/blog" className="btn btn-ghost btn-sm">
                <span>{t.footer.blogGuides}</span>
                <i className="fa-solid fa-arrow-right text-[11px]" aria-hidden="true" />
              </Link>
            </Reveal>

            <div className="grid gap-5 md:grid-cols-3">
              {posts.map((post, i) => {
                const title = locale === "en" && post.titleEn ? post.titleEn : post.title;
                const excerpt =
                  locale === "en" && post.excerptEn ? post.excerptEn : post.excerpt;
                return (
                  <Reveal key={post.slug} delay={i * 70}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group flex h-full flex-col overflow-hidden border border-line bg-panel transition-colors duration-200 hover:border-gold/60"
                    >
                      <div className="aspect-[16/9] w-full overflow-hidden border-b border-line bg-panel-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.image || "/images/placeholder.jpg"}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-5">
                        <p className="font-mono-num text-[10.5px] uppercase tracking-[0.1em] text-muted-dim">
                          {shortDate(post.date, locale)} / {post.category}
                        </p>
                        <h3 className="font-display text-[19px] leading-[1.1] text-white transition-colors duration-150 group-hover:text-gold-light">
                          {title}
                        </h3>
                        <p className="line-clamp-3 text-[14.5px] leading-[1.7] text-muted">
                          {excerpt}
                        </p>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Closing call to action ───────────────────────────────── */}
      <section className="section section-pad">
        <Reveal>
          <div className="relative overflow-hidden border border-line bg-panel">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/editorial/workshop-1.jpg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-30"
              loading="lazy"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(100deg,rgba(20,23,26,0.97)_0%,rgba(20,23,26,0.9)_52%,rgba(20,23,26,0.6)_100%)]"
            />
            <div aria-hidden="true" className="flag-band h-[24px] w-full" />
            <div className="relative p-8 sm:p-14">
              <h2 className="max-w-[640px] font-display text-[28px] leading-[0.98] text-white sm:text-[44px]">
                {t.home.ctaTitle}
              </h2>
              <p className="mt-5 max-w-[58ch] text-[16.5px] leading-[1.7] text-white/90">
                {t.home.ctaLead}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/contact" className="btn btn-primary btn-lg">
                  <i className="fa-solid fa-paper-plane text-[12px]" aria-hidden="true" />
                  <span>{t.home.ctaButton}</span>
                </Link>
                <Link href="/retrieve-quote" className="btn btn-outline btn-lg">
                  <i className="fa-solid fa-clock-rotate-left text-[12px]" aria-hidden="true" />
                  <span>{t.footer.retrieveQuote}</span>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
