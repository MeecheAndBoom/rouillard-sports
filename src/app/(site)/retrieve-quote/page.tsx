import type { Metadata } from "next";
import Link from "next/link";
import { getDict, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/site/PageHeader";
import { QuoteForm } from "@/components/site/PublicForms";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDict();
  return pageMetadata({
    title: t.retrieveQuote.title,
    description: t.retrieveQuote.lead,
    path: "/retrieve-quote",
    locale,
  });
}

/**
 * Retrieve a quote. The request sheet fills the left, the follow-up steps
 * run down the right on a gold rail, and a note band closes the page.
 */
export default async function RetrieveQuotePage() {
  const t = await getDict();

  return (
    <div className="page-enter">
      <PageHeader title={t.retrieveQuote.title} lead={t.retrieveQuote.lead} / imageSrc="/images/editorial/hero-2.jpg">

      <section className="border-b border-line bg-pit">
        <div className="section grid gap-10 py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:py-16">
          {/* ── Request sheet ───────────────────────────────────── */}
          <div>
            <QuoteForm />

            <p className="mt-6 flex items-start gap-3 border-l-[3px] border-gold bg-panel px-5 py-4 text-[14.5px] leading-[1.7] text-muted">
              <i className="fa-solid fa-lightbulb mt-[3px] text-[13px] text-gold" aria-hidden="true" />
              <span>{t.retrieveQuote.noQuoteHint}</span>
            </p>
          </div>

          {/* ── Follow-up rail ──────────────────────────────────── */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <h2 className="font-display text-[24px] leading-none text-white sm:text-[30px]">
                {t.retrieveQuote.processTitle}
              </h2>
              <span aria-hidden="true" className="rule-gold mt-5 block w-24" />
            </Reveal>

            <ol className="mt-8 border-l border-line pl-7">
              {t.success.steps.map((step, i) => (
                <Reveal as="li" key={step.title} delay={i * 70}>
                  <div className="relative pb-8 last:pb-0">
                    <span
                      aria-hidden="true"
                      className="absolute top-[3px] -left-[calc(1.75rem+9px)] grid h-[19px] w-[19px] place-items-center border border-gold bg-pit font-mono-num text-[10px] font-bold text-gold"
                    >
                      {i + 1}
                    </span>
                    <h3 className="font-display text-[18px] leading-[1.15] text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2.5 text-[15px] leading-[1.7] text-muted">{step.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>

            <Reveal delay={120}>
              <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-7">
                <Link href="/help" className="btn btn-ghost btn-sm">
                  <i className="fa-solid fa-circle-question text-[11px]" aria-hidden="true" />
                  <span>{t.nav.help}</span>
                </Link>
                <Link href="/contact" className="btn btn-outline btn-sm">
                  <i className="fa-solid fa-paper-plane text-[11px]" aria-hidden="true" />
                  <span>{t.common.contactUs}</span>
                </Link>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>
    </div>
  );
}
