import type { Metadata } from "next";
import { getDict, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/site/PageHeader";
import { AffiliateForm } from "@/components/site/PublicForms";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDict();
  return pageMetadata({
    title: t.affiliate.title,
    description: t.affiliate.lead,
    path: "/affiliate-program",
    locale,
  });
}

/**
 * Affiliate program. The commission reads as a telemetry figure beside the
 * title, the three moves run as a stacked ledger, the terms hold the right
 * column, and the application sheet spans the bottom.
 */
export default async function AffiliatePage() {
  const t = await getDict();

  return (
    <div className="page-enter">
      <PageHeader title={t.affiliate.title} lead={t.affiliate.lead}>
        <div className="flex items-end gap-4 border border-line bg-panel px-6 py-4">
          <span className="font-mono-num text-[38px] leading-none font-bold text-gold">
            {t.affiliate.commissionValue}
          </span>
          <span className="pb-1 font-mono-num text-[10.5px] uppercase tracking-[0.14em] text-muted-dim">
            {t.affiliate.commissionLabel}
          </span>
        </div>
      </PageHeader>

      <section className="border-b border-line bg-pit">
        <div className="section grid gap-10 py-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16 lg:py-16">
          {/* ── The three moves ─────────────────────────────────── */}
          <div>
            <Reveal>
              <h2 className="font-display text-[26px] leading-none text-white sm:text-[34px]">
                {t.affiliate.howTitle}
              </h2>
            </Reveal>

            <ul className="mt-9 border-t border-line">
              {t.affiliate.how.map((step, i) => (
                <Reveal as="li" key={step.title} delay={i * 65}>
                  <div className="flex items-start gap-6 border-b border-line py-6">
                    <span className="font-mono-num text-[13px] font-bold tracking-[0.12em] text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-display text-[21px] leading-none text-white">
                        {step.title}
                      </h3>
                      <p className="mt-3 max-w-[56ch] text-[15.5px] leading-[1.7] text-muted">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>

          {/* ── Terms ───────────────────────────────────────────── */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <div className="border border-line bg-panel">
                <div className="flex items-center gap-3 border-b border-line bg-panel-2 px-6 py-4">
                  <i className="fa-solid fa-file-signature text-[14px] text-gold" aria-hidden="true" />
                  <h2 className="font-display text-[16px] tracking-[0.05em] text-white">
                    {t.affiliate.termsTitle}
                  </h2>
                </div>
                <ul>
                  {t.affiliate.terms.map((term) => (
                    <li
                      key={term}
                      className="flex items-start gap-4 border-b border-line-soft px-6 py-5 text-[15px] leading-[1.7] text-muted last:border-b-0"
                    >
                      <i
                        className="fa-solid fa-check mt-[4px] shrink-0 text-[12px] text-success"
                        aria-hidden="true"
                      />
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      {/* ── Application ─────────────────────────────────────────── */}
      <section className="border-b border-line bg-asphalt">
        <div className="section section-pad">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16">
              <div>
                <h2 className="font-display text-[28px] leading-none text-white sm:text-[36px]">
                  {t.affiliate.ctaTitle}
                </h2>
                <p className="mt-5 text-[16px] leading-[1.7] text-muted">
                  {t.affiliate.ctaLead}
                </p>
                <span aria-hidden="true" className="rule-gold mt-7 block w-24" />
              </div>

              <div className="border border-line bg-panel p-7 sm:p-10">
                <AffiliateForm />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
