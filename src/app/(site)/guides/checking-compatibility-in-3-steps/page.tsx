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
    title: t.resources.guides[1].title,
    description: t.resources.guides[1].body,
    path: "/guides/checking-compatibility-in-3-steps",
    locale,
  });
}

/**
 * Guide 02. A vertical run of three steps, each sitting on a gold rail,
 * with the pre-order checklist parked beside the last step.
 */
export default async function GuideCompatibility3StepsPage() {
  const t = await getDict();

  return (
    <div className="page-enter">
      <PageHeader
        title={t.resources.guides[1].title}
        lead={t.resources.guides[1].body}
      />

      <section className="border-b border-line bg-pit">
        <div className="section section-pad">
          <ol className="relative border-l border-line pl-8 sm:pl-12">
            {t.resources.guideCompatibilitySteps.map((step, i) => (
              <Reveal key={step.title} delay={i * 80} as="li">
                <div className="relative pb-12 last:pb-0">
                  <span
                    aria-hidden="true"
                    className="absolute top-1 -left-[calc(2rem+13px)] grid h-7 w-7 place-items-center border border-gold bg-pit font-mono-num text-[11px] font-bold text-gold sm:-left-[calc(3rem+13px)]"
                  >
                    {i + 1}
                  </span>
                  <h2 className="font-display text-[24px] leading-none text-white sm:text-[30px]">
                    {step.title}
                  </h2>
                  <p className="mt-4 max-w-[64ch] text-[16.5px] leading-[1.75] text-muted">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <div aria-hidden="true" className="flag-band-sm h-[6px] w-full opacity-60" />

      <section className="border-b border-line bg-asphalt">
        <div className="section section-pad">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
            <Reveal>
              <h2 className="font-display text-[26px] leading-none text-white sm:text-[34px]">
                {t.resources.guideCompatibilityCheckTitle}
              </h2>
              <p className="mt-4 max-w-[58ch] text-[16px] leading-[1.7] text-muted">
                {t.resources.guides[1].body}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/shop" className="btn btn-primary">
                  <i className="fa-solid fa-magnifying-glass text-[12px]" aria-hidden="true" />
                  <span>{t.nav.shop}</span>
                </Link>
                <Link href="/contact" className="btn btn-outline">
                  <i className="fa-solid fa-envelope text-[12px]" aria-hidden="true" />
                  <span>{t.common.contactUs}</span>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="border border-line bg-panel">
                <div className="flex items-center gap-3 border-b border-line bg-panel-2 px-6 py-4">
                  <i className="fa-solid fa-clipboard-check text-[14px] text-gold" aria-hidden="true" />
                  <span className="font-display text-[15px] tracking-[0.06em] text-white">
                    {t.resources.guideCompatibilityCheckTitle}
                  </span>
                </div>
                <ul>
                  {t.resources.guideCompatibilityCheckItems.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-4 border-b border-line-soft px-6 py-5 text-[15.5px] leading-[1.7] text-muted last:border-b-0"
                    >
                      <i
                        className="fa-solid fa-square-check mt-[3px] shrink-0 text-[13px] text-gold"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <Reveal className="mt-12">
            <Link href="/guides" className="btn btn-ghost btn-sm">
              <i className="fa-solid fa-arrow-left text-[11px]" aria-hidden="true" />
              <span>{t.resources.backToGuides}</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
