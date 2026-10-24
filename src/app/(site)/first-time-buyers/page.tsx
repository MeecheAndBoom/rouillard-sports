import type { Metadata } from "next";
import Link from "next/link";
import { getDict, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDict();
  return pageMetadata({
    title: t.firstTime.title,
    description: t.firstTime.lead,
    path: "/first-time-buyers",
    locale,
  });
}

/**
 * First order. The five steps run left to right along a gold rail, each
 * one a column with its own node, so the page reads as a single gesture.
 */
export default async function FirstTimeBuyersPage() {
  const t = await getDict();

  return (
    <div className="page-enter">
      <PageHeader title={t.firstTime.title} lead={t.firstTime.lead} />

      <section className="border-b border-line bg-pit">
        <div className="section section-pad">
          <Reveal>
            <h2 className="font-display text-[26px] leading-none text-white sm:text-[34px]">
              {t.firstTime.stepsTitle}
            </h2>
          </Reveal>

          <div className="relative mt-12">
            <span
              aria-hidden="true"
              className="absolute top-[23px] right-0 left-0 hidden h-[1px] bg-line lg:block"
            />
            <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
              {t.firstTime.steps.map((step, i) => (
                <Reveal as="li" key={step.title} delay={i * 65} className="relative">
                  <span
                    aria-hidden="true"
                    className="relative z-10 grid h-12 w-12 place-items-center border border-gold bg-pit font-mono-num text-[15px] font-bold text-gold"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-6 font-display text-[19px] leading-[1.1] text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[14.5px] leading-[1.7] text-muted">{step.body}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Guarantees ────────────────────────────────────────────── */}
      <section className="border-b border-line bg-asphalt">
        <div className="section section-pad">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <h2 className="font-display text-[26px] leading-none text-white sm:text-[34px]">
                {t.firstTime.reassureTitle}
              </h2>
              <span aria-hidden="true" className="rule-gold w-24" />
            </div>
          </Reveal>

          <ul className="mt-10 grid gap-px bg-line md:grid-cols-3">
            {t.firstTime.reassure.map((item, i) => (
              <Reveal as="li" key={item} delay={i * 60} className="bg-asphalt">
                <div className="flex h-full gap-4 p-7">
                  <span
                    aria-hidden="true"
                    className="grid h-10 w-10 shrink-0 place-items-center border border-line text-[13px] text-success"
                  >
                    <i className="fa-solid fa-shield-halved" />
                  </span>
                  <span className="text-[15.5px] leading-[1.7] text-muted">{item}</span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Closing ───────────────────────────────────────────────── */}
      <section className="section section-pad">
        <Reveal>
          <div className="relative overflow-hidden border border-line bg-panel">
            <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-70" />
            <div aria-hidden="true" className="livery absolute top-0 bottom-0 left-0 w-[3px]" />
            <div className="relative flex flex-wrap items-center justify-between gap-6 p-8 sm:p-11">
              <div className="max-w-[52ch]">
                <h2 className="font-display text-[26px] leading-none text-white sm:text-[34px]">
                  {t.firstTime.ctaTitle}
                </h2>
                <p className="mt-4 text-[16px] leading-[1.7] text-muted">
                  {t.firstTime.ctaLead}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/shop" className="btn btn-primary">
                  <i className="fa-solid fa-bag-shopping text-[12px]" aria-hidden="true" />
                  <span>{t.home.heroCta}</span>
                </Link>
                <Link href="/contact" className="btn btn-outline">
                  <i className="fa-solid fa-paper-plane text-[12px]" aria-hidden="true" />
                  <span>{t.home.ctaButton}</span>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
