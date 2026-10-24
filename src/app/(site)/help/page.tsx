import type { Metadata } from "next";
import Link from "next/link";
import { getDict, getLocale } from "@/lib/i18n/server";
import { pageMetadata, faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/site/PageHeader";
import { FaqExplorer, type FaqGroup } from "@/components/site/FaqExplorer";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDict();
  return pageMetadata({
    title: t.help.title,
    description: t.help.lead,
    path: "/help",
    locale,
  });
}

/**
 * Help centre. A service-manual index runs down the left, the answers
 * fill the right column, and a full-width assistance band closes the page.
 */
export default async function HelpPage() {
  const t = await getDict();
  const locale = await getLocale();

  const groups: FaqGroup[] = (
    Object.entries(t.help.faqs) as [keyof typeof t.help.faqs, { q: string; a: string }[]][]
  ).map(([key, items]) => ({
    key,
    label: t.help.categories[key],
    items,
  }));

  const flatFaqs = groups.flatMap((g) => g.items.map((i) => ({ q: i.q, a: i.a })));

  return (
    <div className="page-enter">
      <PageHeader title={t.help.title} lead={t.help.lead} />

      <section className="border-b border-line bg-pit">
        <div className="section grid gap-10 py-12 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-14 lg:py-16">
          {/* ── Index ──────────────────────────────────────────── */}
          <nav aria-label={t.help.title} className="hidden lg:block">
            <div className="sticky top-28">
              <p className="border-b border-line pb-3 font-mono-num text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-dim">
                {t.help.indexLabel}
              </p>
              <ul className="mt-3 flex flex-col">
                {groups.map((group) => (
                  <li key={group.key}>
                    <a
                      href={`#faq-${group.key}`}
                      className="group flex items-center gap-3 border-b border-line-soft py-3 text-[14.5px] text-muted transition-colors duration-150 hover:text-white"
                    >
                      <span
                        aria-hidden="true"
                        className="h-[5px] w-[5px] shrink-0 bg-line transition-colors duration-150 group-hover:bg-gold"
                      />
                      <span className="flex-1">{group.label}</span>
                      <span className="font-mono-num text-[11px] text-muted-dim">
                        {String(group.items.length).padStart(2, "0")}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* ── Answers ────────────────────────────────────────── */}
          <div className="min-w-0">
            <FaqExplorer groups={groups} />
          </div>
        </div>
      </section>

      {/* ── Assistance band ─────────────────────────────────────── */}
      <section className="border-b border-line bg-asphalt">
        <div className="section section-pad">
          <Reveal>
            <div className="relative overflow-hidden border border-line bg-panel">
              <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-70" />
              <div aria-hidden="true" className="livery absolute top-0 bottom-0 left-0 w-[3px]" />
              <div className="relative flex flex-wrap items-center justify-between gap-6 p-8 sm:p-11">
                <div className="max-w-[54ch]">
                  <h2 className="font-display text-[26px] leading-none text-white sm:text-[34px]">
                    {t.help.contactTitle}
                  </h2>
                  <p className="mt-4 text-[16px] leading-[1.7] text-muted">
                    {t.help.contactLead}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/contact" className="btn btn-primary">
                    <i className="fa-solid fa-paper-plane text-[12px]" aria-hidden="true" />
                    <span>{t.common.contactUs}</span>
                  </Link>
                  <Link href="/track" className="btn btn-outline">
                    <i className="fa-solid fa-location-crosshairs text-[12px]" aria-hidden="true" />
                    <span>{t.nav.track}</span>
                  </Link>
                </div>
              </div>
              <div aria-hidden="true" className="flag-band-sm h-[6px] w-full opacity-60" />
            </div>
          </Reveal>
        </div>
      </section>

      <JsonLd data={faqJsonLd(flatFaqs, locale)} />
    </div>
  );
}
