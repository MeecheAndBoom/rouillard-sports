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
    title: t.resources.title,
    description: t.resources.lead,
    path: "/resources",
    locale,
  });
}

const GUIDE_HREFS = [
  "/guides/reading-a-manufacturer-reference",
  "/guides/checking-compatibility-in-3-steps",
  "/guides/preparing-a-return-shipment",
];

const TOOL_HREFS = ["/tools/torque-calculator", "/tools/maintenance-calendar"];

/**
 * Resources. The guides run as a three-column wall, the tools as a photo
 * rail, and the closing block is a full-width band with a workshop still
 * behind it.
 */
export default async function ResourcesPage() {
  const t = await getDict();

  return (
    <div className="page-enter">
      <PageHeader title={t.resources.title} lead={t.resources.lead} imageSrc="/images/editorial/workshop-2.jpg" />

      {/* ── Guides wall ─────────────────────────────────────────── */}
      <section className="border-b border-line bg-pit">
        <div className="section section-pad">
          <Reveal className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <h2 className="font-display text-[28px] leading-none text-white sm:text-[38px]">
                {t.resources.guidesTitle}
              </h2>
              <p className="mt-4 max-w-[62ch] text-[16.5px] leading-[1.7] text-white/90">
                {t.resources.guidesHubLead}
              </p>
            </div>
            <Link href="/guides" className="btn btn-ghost btn-sm">
              <span>{t.resources.backToGuides}</span>
              <i className="fa-solid fa-arrow-right text-[11px]" aria-hidden="true" />
            </Link>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {t.resources.guides.map((guide, i) => (
              <Reveal key={guide.title} delay={i * 70}>
                <Link
                  href={GUIDE_HREFS[i] ?? "/guides"}
                  className="group relative flex h-full flex-col border border-line bg-panel p-7 transition-colors duration-200 hover:border-gold/60"
                >
                  <span
                    aria-hidden="true"
                    className="livery absolute top-0 bottom-0 left-0 w-[3px] opacity-70"
                  />
                  <span className="font-mono-num text-[12px] font-bold tracking-[0.14em] text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 font-display text-[22px] leading-[1.1] text-white transition-colors duration-200 group-hover:text-gold-light">
                    {guide.title}
                  </h3>
                  <p className="mt-3.5 flex-1 text-[15px] leading-[1.7] text-muted">
                    {guide.body}
                  </p>
                  <span className="mt-7 inline-flex items-center gap-2 font-mono-num text-[11px] uppercase tracking-[0.12em] text-muted-dim">
                    {t.common.readMore}
                    <i
                      className="fa-solid fa-arrow-right text-[10px] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-gold"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tools rail ──────────────────────────────────────────── */}
      <section className="border-b border-line bg-asphalt">
        <div className="section section-pad">
          <Reveal>
            <h2 className="font-display text-[28px] leading-none text-white sm:text-[38px]">
              {t.resources.toolsTitle}
            </h2>
            <p className="mt-4 max-w-[62ch] text-[16.5px] leading-[1.7] text-white/90">
              {t.resources.toolsHubLead}
            </p>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {t.resources.tools.map((tool, i) => (
              <Reveal key={tool.title} delay={i * 70}>
                <Link
                  href={TOOL_HREFS[i] ?? "/tools"}
                  className="group relative flex h-full flex-col justify-end overflow-hidden border border-line bg-pit p-7 pb-0 transition-colors duration-200 hover:border-gold/60"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={i === 0 ? "/images/editorial/hero-5.jpg" : "/images/editorial/paddock-2.jpg"}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-30 transition-opacity duration-500 group-hover:opacity-45"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,10,0.4)_0%,rgba(8,9,10,0.96)_72%)]"
                  />
                  <div className="relative">
                    <span className="font-mono-num text-[11px] uppercase tracking-[0.14em] text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 font-display text-[24px] leading-none text-white transition-colors duration-200 group-hover:text-gold-light">
                      {tool.title}
                    </h3>
                    <p className="mt-3 pb-7 max-w-[44ch] text-[15px] leading-[1.7] text-muted">
                      {tool.body}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Carnet + CTA ────────────────────────────────────────── */}
      <section className="section section-pad">
        <Reveal>
          <Link
            href="/blog"
            className="group flex flex-wrap items-center justify-between gap-5 border border-line bg-panel px-7 py-6 transition-colors duration-200 hover:border-gold/60"
          >
            <span className="flex items-center gap-5">
              <span
                aria-hidden="true"
                className="grid h-11 w-11 shrink-0 place-items-center border border-line text-[15px] text-gold"
              >
                <i className="fa-solid fa-newspaper" />
              </span>
              <span>
                <span className="block font-display text-[20px] leading-none text-white transition-colors duration-200 group-hover:text-gold-light">
                  {t.blog.title}
                </span>
                <span className="mt-2 block text-[15px] leading-[1.6] text-muted">
                  {t.blog.lead}
                </span>
              </span>
            </span>
            <i
              className="fa-solid fa-arrow-right text-[13px] text-muted-dim transition-all duration-200 group-hover:translate-x-1 group-hover:text-gold"
              aria-hidden="true"
            />
          </Link>
        </Reveal>

        <Reveal className="mt-6">
          <div className="relative overflow-hidden border border-line bg-panel">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/editorial/workshop-4.jpg"
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-25"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(100deg,rgba(20,23,26,0.97)_0%,rgba(20,23,26,0.88)_54%,rgba(20,23,26,0.6)_100%)]"
            />
            <div aria-hidden="true" className="flag-band h-[20px] w-full opacity-70" />
            <div className="relative flex flex-wrap items-center justify-between gap-6 p-8 sm:p-11">
              <div className="max-w-[54ch]">
                <h2 className="font-display text-[24px] leading-none text-white sm:text-[32px]">
                  {t.resources.ctaTitle}
                </h2>
                <p className="mt-4 text-[16px] leading-[1.7] text-muted">{t.resources.ctaLead}</p>
              </div>
              <Link href="/contact" className="btn btn-primary btn-lg">
                <i className="fa-solid fa-paper-plane text-[12px]" aria-hidden="true" />
                <span>{t.common.contactUs}</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
