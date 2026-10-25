import type { Metadata } from "next";
import Link from "next/link";
import { getDict, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { PageHeader } from "@/components/site/PageHeader";
import { HeroBackground } from "@/components/site/HeroBackground";
import { ContactForm } from "@/components/site/PublicForms";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDict();
  return pageMetadata({
    title: t.contact.title,
    description: t.contact.lead,
    path: "/contact",
    locale,
  });
}

/**
 * Contact. The workshop card runs as a sticky rail on the left, the form
 * sheet fills the right, and the map sits under both as a wide band.
 */
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getDict();
  const locale = await getLocale();
  const sp = await searchParams;
  const part = Array.isArray(sp.part) ? sp.part[0] : sp.part;
  const defaultSubject = part
    ? t.contact.subjectPart.replace("{part}", part)
    : undefined;

  return (
    <div className="page-enter">
      <PageHeader title={t.contact.title} lead={t.contact.lead} imageSrc="/images/editorial/hero-3.jpg">
        <span className="badge badge-quiet">
          <i className="fa-regular fa-clock text-[11px] text-gold" aria-hidden="true" />
          {t.contact.responseTime}
        </span>
      </PageHeader>

      <section className="border-b border-line bg-pit">
        <div className="section grid gap-10 py-14 lg:grid-cols-[330px_minmax(0,1fr)] lg:gap-14 lg:py-20">
          {/* ── Workshop card ───────────────────────────────────── */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <div className="border border-line bg-panel">
                <div aria-hidden="true" className="flag-band-sm h-[6px] w-full opacity-70" />
                <div className="p-7">
                  <h2 className="font-display text-[19px] leading-none text-white">
                    {t.contact.directTitle}
                  </h2>

                  <ul className="mt-5 flex flex-col">
                    <li className="border-b border-line-soft">
                      <a
                        href={`tel:${SITE.phoneHref}`}
                        className="flex items-center gap-4 py-4 transition-colors hover:text-gold-light"
                      >
                        <span
                          aria-hidden="true"
                          className="grid h-10 w-10 shrink-0 place-items-center border border-line text-[13px] text-gold"
                        >
                          <i className="fa-solid fa-phone" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-mono-num text-[10.5px] uppercase tracking-[0.14em] text-muted-dim">
                            {t.contact.phone}
                          </span>
                          <span className="mt-1 block font-mono-num text-[15px] text-paper">
                            {SITE.phone}
                          </span>
                        </span>
                      </a>
                    </li>
                    <li>
                      <a
                        href={`mailto:${SITE.email}`}
                        className="flex items-center gap-4 py-4 transition-colors hover:text-gold-light"
                      >
                        <span
                          aria-hidden="true"
                          className="grid h-10 w-10 shrink-0 place-items-center border border-line text-[13px] text-gold"
                        >
                          <i className="fa-solid fa-envelope" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-mono-num text-[10.5px] uppercase tracking-[0.14em] text-muted-dim">
                            {t.contact.email}
                          </span>
                          <span className="mt-1 block break-all font-mono-num text-[14px] text-paper">
                            {SITE.email}
                          </span>
                        </span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="mt-5 border border-line bg-panel p-7">
                <h2 className="font-display text-[19px] leading-none text-white">
                  {t.contact.hoursTitle}
                </h2>
                <dl className="mt-5 flex flex-col">
                  {SITE.hours.map((row) => (
                    <div
                      key={row.days}
                      className="flex items-center justify-between gap-4 border-b border-line-soft py-3 last:border-b-0"
                    >
                      <dt className="text-[14.5px] text-muted">
                        {locale === "en" ? row.daysEn : row.days}
                      </dt>
                      <dd className="font-mono-num text-[13.5px] text-paper">{row.time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <Link href="/help" className="btn btn-ghost btn-sm mt-6">
                <i className="fa-solid fa-circle-question text-[11px]" aria-hidden="true" />
                <span>{t.help.title}</span>
              </Link>
            </Reveal>
          </aside>

          {/* ── Form sheet ──────────────────────────────────────── */}
          <Reveal delay={60}>
            <div className="border border-line bg-panel p-7 sm:p-10">
              <h2 className="font-display text-[26px] leading-none text-white sm:text-[32px]">
                {t.contact.formTitle}
              </h2>
              <span aria-hidden="true" className="rule-gold mt-5 block w-28" />
              <div className="mt-8">
                <ContactForm defaultSubject={defaultSubject} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Map band ───────────────────────────────────────────── */}
      <section className="border-b border-line bg-asphalt">
        <div className="section section-pad">
          <Reveal className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <h2 className="font-display text-[26px] leading-none text-white sm:text-[34px]">
                {t.contact.addressTitle}
              </h2>
              <p className="mt-4 max-w-[56ch] text-[16.5px] leading-[1.7] text-muted">
                {SITE.address}
              </p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.address)}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm"
            >
              <i className="fa-solid fa-arrow-up-right-from-square text-[11px]" aria-hidden="true" />
              <span>{t.contact.mapLink}</span>
            </a>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-8 overflow-hidden border border-line bg-panel-2">
              <div className="aspect-[16/7] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/map-lyon.jpg"
                  alt=""
                  className="h-full w-full object-cover opacity-70"
                  loading="lazy"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
