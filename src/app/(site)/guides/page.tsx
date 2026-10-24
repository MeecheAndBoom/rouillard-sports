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
    title: t.resources.guidesHubTitle,
    description: t.resources.guidesHubLead,
    path: "/guides",
    locale,
  });
}

const GUIDE_HREFS = [
  "/guides/reading-a-manufacturer-reference",
  "/guides/checking-compatibility-in-3-steps",
  "/guides/preparing-a-return-shipment",
];

const GUIDE_ICONS = ["fa-list-ol", "fa-check-double", "fa-box-open"];

/**
 * Guides hub. The guides read as a work-order board: hairline rows, a mono
 * index on the left. The tools below are two wide panels instead of cards,
 * so the two lists never look alike.
 */
export default async function GuidesHubPage() {
  const t = await getDict();

  return (
    <div className="page-enter">
      <PageHeader title={t.resources.guidesHubTitle} lead={t.resources.guidesHubLead} />

      <section className="border-b border-line bg-pit">
        <div className="section section-pad">
          <Reveal>
            <h2 className="font-display text-[26px] leading-none text-white sm:text-[34px]">
              {t.resources.guidesTitle}
            </h2>
          </Reveal>

          <ul className="mt-9 border-t border-line">
            {t.resources.guides.map((guide, i) => (
              <li key={guide.title}>
                <Reveal delay={i * 60}>
                  <Link
                    href={GUIDE_HREFS[i] ?? "/guides"}
                    className="group flex items-center gap-4 border-b border-line py-6 transition-colors duration-200 hover:bg-panel/60 sm:gap-8"
                  >
                    <span className="font-mono-num text-[13px] font-bold tracking-[0.12em] text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span
                      aria-hidden="true"
                      className="grid h-11 w-11 shrink-0 place-items-center border border-line text-[15px] text-gold transition-colors duration-200 group-hover:border-gold/60"
                    >
                      <i className={`fa-solid ${GUIDE_ICONS[i] ?? "fa-book-open"}`} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-[20px] leading-[1.1] text-white transition-colors duration-200 group-hover:text-gold-light sm:text-[24px]">
                        {guide.title}
                      </span>
                      <span className="mt-2 block max-w-[64ch] text-[15px] leading-[1.7] text-muted">
                        {guide.body}
                      </span>
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

      <div aria-hidden="true" className="flag-band-sm h-[6px] w-full opacity-60" />

      <section className="border-b border-line bg-asphalt">
        <div className="section section-pad">
          <Reveal>
            <h2 className="font-display text-[26px] leading-none text-white sm:text-[34px]">
              {t.resources.toolsTitle}
            </h2>
            <p className="mt-4 max-w-[62ch] text-[16.5px] leading-[1.7] text-muted">
              {t.resources.toolsHubLead}
            </p>
          </Reveal>

          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {t.resources.tools.map((tool, i) => (
              <Reveal key={tool.title} delay={i * 70}>
                <Link
                  href={i === 0 ? "/tools/torque-calculator" : "/tools/maintenance-calendar"}
                  className="group relative flex h-full flex-col justify-between overflow-hidden border border-line bg-panel p-8 transition-colors duration-200 hover:border-gold/60"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-3 -bottom-5 font-display text-[96px] leading-none text-white/[0.04]"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="font-mono-num text-[11px] uppercase tracking-[0.14em] text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-4 block font-display text-[24px] leading-[1.05] text-white transition-colors duration-200 group-hover:text-gold-light">
                      {tool.title}
                    </span>
                    <span className="mt-3 block max-w-[42ch] text-[15px] leading-[1.7] text-muted">
                      {tool.body}
                    </span>
                  </span>
                  <span className="mt-8 inline-flex items-center gap-2 font-display text-[13px] tracking-[0.08em] text-gold">
                    {t.common.learnMore}
                    <i
                      className="fa-solid fa-arrow-right text-[11px] transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-pad">
        <Reveal>
          <div className="relative overflow-hidden border border-line bg-panel">
            <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-60" />
            <div aria-hidden="true" className="livery absolute top-0 bottom-0 left-0 w-[3px]" />
            <div className="relative flex flex-wrap items-center justify-between gap-6 p-8 sm:p-11">
              <div className="max-w-[56ch]">
                <h2 className="font-display text-[24px] leading-none text-white sm:text-[32px]">
                  {t.resources.hubCtaTitle}
                </h2>
                <p className="mt-4 text-[16px] leading-[1.7] text-muted">
                  {t.resources.hubCtaLead}
                </p>
              </div>
              <Link href="/contact" className="btn btn-primary btn-lg">
                <i className="fa-solid fa-paper-plane text-[12px]" aria-hidden="true" />
                <span>{t.resources.hubCtaButton}</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
