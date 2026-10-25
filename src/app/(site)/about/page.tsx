import type { Metadata } from "next";
import Link from "next/link";
import { getDict, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { SITE, CATEGORY_LABELS, PART_CATEGORIES } from "@/lib/constants";
import { PageHeader, Breadcrumbs } from "@/components/site/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { HeroBackground } from "@/components/site/HeroBackground";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDict();
  return pageMetadata({
    title: t.about.title,
    description: t.about.intro,
    path: "/about",
    locale,
  });
}

/** Engagement icons, in the order the commitments are listed. */
const VALUE_ICONS = [
  "fa-magnifying-glass",
  "fa-list-check",
  "fa-comments",
  "fa-rotate-left",
];

/** Opening hours carry a range dash in the constants. Keep it a plain hyphen. */
const plain = (value: string) => value.replace(/[\u2013\u2014]/g, "-");

export default async function AboutPage() {
  const t = await getDict();
  const locale = await getLocale();

  return (
    <div className="page-enter">
      <PageHeader title={t.about.title} lead={t.about.intro} imageSrc="/images/editorial/hero-2.jpg">
        <Link href="/contact" className="btn btn-primary btn-sm">
          <i className="fa-solid fa-paper-plane text-[11px]" aria-hidden="true" />
          <span>{t.common.contactUs}</span>
        </Link>
        <Link href="/shop" className="btn btn-outline btn-sm">
          <i className="fa-solid fa-box-open text-[11px]" aria-hidden="true" />
          <span>{t.footer.allParts}</span>
        </Link>
      </PageHeader>

      <Breadcrumbs
        items={[
          { label: t.shop.breadcrumbHome, href: "/" },
          { label: t.nav.about },
        ]}
      />

      {/* ── Story: the bench, told in full ───────────────────────── */}
      <section className="border-b border-line bg-pit">
        <div className="section grid gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
          <Reveal>
            <h2 className="font-display text-[30px] leading-none text-white sm:text-[42px]">
              {t.about.storyTitle}
            </h2>
            <p className="mt-6 max-w-[62ch] text-[16.5px] leading-[1.75] text-muted">
              {t.about.story1}
            </p>
            <p className="mt-4 max-w-[62ch] text-[16.5px] leading-[1.75] text-muted">
              {t.about.story2}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/why-buy-from-us" className="btn btn-dark btn-sm">
                <i className="fa-solid fa-gauge-high text-[11px]" aria-hidden="true" />
                <span>{t.whyBuy.title}</span>
              </Link>
              <Link href="/first-time-buyers" className="btn btn-ghost btn-sm">
                <span>{t.firstTime.title}</span>
                <i className="fa-solid fa-arrow-right text-[11px]" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <figure className="brackets relative border border-line bg-panel">
              <div className="aspect-[4/5] w-full overflow-hidden sm:aspect-[5/6]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/editorial/workshop-3.jpg"
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </figure>
          </Reveal>
        </div>
      </section>

      <div aria-hidden="true" className="flag-band-sm h-[6px] w-full" />

      {/* ── Commitments: four columns, hairline divided ───────────── */}
      <section className="border-b border-line bg-asphalt">
        <div className="section section-pad">
          <Reveal>
            <h2 className="font-display text-[30px] leading-none text-white sm:text-[42px]">
              {t.about.valuesTitle}
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {t.about.values.map((value, i) => (
              <Reveal key={value.title} delay={i * 60} className="h-full">
                <article className="flex h-full flex-col bg-asphalt p-7">
                  <span className="font-mono-num text-[12px] font-bold tracking-[0.16em] text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-6 grid h-11 w-11 place-items-center border border-line text-[15px] text-gold"
                  >
                    <i className={`fa-solid ${VALUE_ICONS[i] ?? "fa-check"}`} />
                  </span>
                  <h3 className="mt-6 font-display text-[20px] leading-[1.05] text-white">
                    {value.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.7] text-muted">{value.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div aria-hidden="true" className="flag-band-sm h-[6px] w-full" />

      {/* ── Figures and the workshop address ──────────────────────── */}
      <section className="border-b border-line bg-pit">
        <div className="section section-pad grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <Reveal>
              <h2 className="font-display text-[30px] leading-none text-white sm:text-[42px]">
                {t.about.numbersTitle}
              </h2>
            </Reveal>

            <ul className="mt-9 grid grid-cols-2 gap-px bg-line xl:grid-cols-4">
              {t.home.stats.map((stat, i) => (
                <Reveal as="li" key={stat.label} delay={i * 60} className="bg-pit">
                  <div className="p-5">
                    <p className="font-mono-num text-[26px] leading-none font-bold text-gold">
                      {stat.value}
                    </p>
                    <p className="mt-2.5 font-mono-num text-[10.5px] uppercase tracking-[0.14em] text-muted-dim">
                      {stat.label}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-2">
              {PART_CATEGORIES.slice(0, 8).map((category) => (
                <Link
                  key={category}
                  href={`/shop?category=${encodeURIComponent(category)}`}
                  className="badge badge-quiet transition-colors hover:border-gold hover:text-gold"
                >
                  {CATEGORY_LABELS[category][locale]}
                </Link>
              ))}
            </div>
          </div>

          <Reveal delay={100} className="h-full">
            <div className="panel-flat h-full p-7 sm:p-9">
              <h3 className="font-display text-[22px] leading-none text-white">
                {t.contact.addressTitle}
              </h3>
              <p className="mt-4 text-[15.5px] leading-[1.7] text-muted">{SITE.address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.address)}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-[14.5px] font-medium text-gold transition-colors hover:text-gold-light"
              >
                {t.contact.mapLink}
                <i
                  className="fa-solid fa-arrow-up-right-from-square text-[11px]"
                  aria-hidden="true"
                />
              </a>

              <h3 className="mt-9 font-display text-[19px] leading-none text-white">
                {t.contact.hoursTitle}
              </h3>
              <dl className="mt-4 flex flex-col">
                {SITE.hours.map((row) => (
                  <div
                    key={row.days}
                    className="flex justify-between gap-4 border-b border-line-soft py-2.5 last:border-0"
                  >
                    <dt className="text-[14.5px] text-muted">{plain(row.days)}</dt>
                    <dd className="font-mono-num text-[14px] text-paper">{row.time}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-9 flex flex-wrap gap-3">
                <a href={`tel:${SITE.phoneHref}`} className="btn btn-primary btn-sm">
                  <i className="fa-solid fa-phone text-[11px]" aria-hidden="true" />
                  <span>{SITE.phone}</span>
                </a>
                <Link href="/contact" className="btn btn-outline btn-sm">
                  <i className="fa-solid fa-paper-plane text-[11px]" aria-hidden="true" />
                  <span>{t.common.emailUs}</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Closing statement over the workshop ───────────────────── */}
      <section className="on-dark relative overflow-hidden border-b border-line bg-pit">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/editorial/helmet-4.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          loading="lazy"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,10,0.96)_0%,rgba(8,9,10,0.8)_55%,rgba(8,9,10,0.5)_100%)]"
        />
        <div className="section relative py-16 sm:py-20">
          <Reveal className="max-w-[640px]">
            <h2 className="font-display text-[28px] leading-none text-white sm:text-[40px]">
              {t.about.ctaTitle}
            </h2>
            <p className="mt-5 max-w-[56ch] text-[16.5px] leading-[1.7] text-white/90">
              {t.about.ctaLead}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/contact" className="btn btn-primary">
                <i className="fa-solid fa-paper-plane text-[12px]" aria-hidden="true" />
                <span>{t.home.ctaButton}</span>
              </Link>
              <Link href="/shop" className="btn btn-outline">
                <i className="fa-solid fa-box-open text-[12px]" aria-hidden="true" />
                <span>{t.footer.allParts}</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
