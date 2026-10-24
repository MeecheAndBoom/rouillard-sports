import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, getLocale } from "@/lib/i18n/server";
import { getLegalPage, legalTitle, LEGAL_PAGES } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";
import { shortDate } from "@/lib/format";
import { Breadcrumbs } from "@/components/site/PageHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/ui/Reveal";

export function generateStaticParams() {
  return LEGAL_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const page = getLegalPage(slug);
  if (!page) return { title: "404" };
  return pageMetadata({
    title: legalTitle(page, locale),
    description: page.sections[locale].map((s) => s.body[0] ?? "").join(" ").slice(0, 160),
    path: `/legal/${page.slug}`,
    locale,
  });
}

/**
 * Legal pages. A document sheet: the table of contents runs down a sticky
 * left rail, the clauses fill the right column, and the neighbouring
 * policies close the page.
 */
export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getDict();
  const locale = await getLocale();
  const page = getLegalPage(slug);
  if (!page) notFound();

  const title = legalTitle(page, locale);
  const sections = page.sections[locale];
  const others = LEGAL_PAGES.filter((other) => other.slug !== page.slug);

  return (
    <div className="page-enter">
      <Breadcrumbs
        items={[
          { label: t.shop.breadcrumbHome, href: "/" },
          { label: t.legal.title },
          { label: title },
        ]}
      />

      <header className="border-b border-line bg-asphalt">
        <div className="section pt-8 pb-9 sm:pt-11 sm:pb-12">
          <h1 className="max-w-[900px] font-display text-[34px] leading-[0.98] text-white sm:text-[50px]">
            {title}
          </h1>
          <p className="mt-5 font-mono-num text-[11px] uppercase tracking-[0.14em] text-muted-dim">
            {t.legal.updated}{" "}
            <time dateTime={page.updated} className="text-paper">
              {shortDate(page.updated, locale)}
            </time>
          </p>
        </div>
        <div aria-hidden="true" className="flag-band-sm h-[6px] w-full opacity-60" />
      </header>

      <section className="border-b border-line bg-pit">
        <div className="section grid gap-10 py-12 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16 lg:py-16">
          {/* ── Table of contents ────────────────────────────────── */}
          <nav aria-label={title} className="hidden lg:block">
            <div className="sticky top-28">
              <p className="border-b border-line pb-3 font-mono-num text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-dim">
                {t.legal.title}
              </p>
              <ol className="mt-3 flex flex-col">
                {sections.map((section, i) => (
                  <li key={section.heading}>
                    <a
                      href={`#section-${i + 1}`}
                      className="group flex items-start gap-3 border-b border-line-soft py-2.5 text-[13.5px] leading-[1.4] text-muted transition-colors duration-150 hover:text-white"
                    >
                      <span className="font-mono-num text-[11px] text-gold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{section.heading.replace(/^\d+\.\s*/, "")}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          {/* ── Clauses ──────────────────────────────────────────── */}
          <div className="min-w-0">
            {sections.map((section, i) => (
              <Reveal key={section.heading} delay={Math.min(i, 8) * 45}>
                <section id={`section-${i + 1}`} className="scroll-mt-28 border-b border-line pb-9 pt-8 first:pt-0">
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono-num text-[12px] font-bold tracking-[0.14em] text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="font-display text-[21px] leading-[1.15] text-white sm:text-[26px]">
                      {section.heading.replace(/^\d+\.\s*/, "")}
                    </h2>
                  </div>
                  <div className="mt-5 flex flex-col gap-4 pl-0 sm:pl-[calc(2ch+1rem)]">
                    {section.body.map((paragraph, j) => (
                      <p key={j} className="max-w-[72ch] text-[16px] leading-[1.8] text-muted">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              </Reveal>
            ))}

            <Reveal className="mt-10">
              <Link href="/" className="btn btn-ghost btn-sm">
                <i className="fa-solid fa-arrow-left text-[11px]" aria-hidden="true" />
                <span>{t.legal.backToHome}</span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Other policies ──────────────────────────────────────── */}
      <section className="border-b border-line bg-asphalt">
        <div className="section section-pad">
          <Reveal>
            <h2 className="font-display text-[24px] leading-none text-white sm:text-[30px]">
              {t.legal.title}
            </h2>
          </Reveal>

          <ul className="mt-8 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {others.map((other, i) => (
              <Reveal as="li" key={other.slug} delay={Math.min(i, 8) * 40} className="bg-asphalt">
                <Link
                  href={`/legal/${other.slug}`}
                  className="group flex items-center justify-between gap-4 p-6 transition-colors duration-200 hover:bg-panel"
                >
                  <span className="font-display text-[17px] leading-[1.15] text-white transition-colors duration-200 group-hover:text-gold-light">
                    {legalTitle(other, locale)}
                  </span>
                  <i
                    className="fa-solid fa-arrow-right text-[11px] text-muted-dim transition-all duration-200 group-hover:translate-x-1 group-hover:text-gold"
                    aria-hidden="true"
                  />
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: title,
          inLanguage: locale,
        }}
      />
    </div>
  );
}
