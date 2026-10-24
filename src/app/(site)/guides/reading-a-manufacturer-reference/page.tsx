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
    title: t.resources.guides[0].title,
    description: t.resources.guides[0].body,
    path: "/guides/reading-a-manufacturer-reference",
    locale,
  });
}

/**
 * Guide 01. A reference is read as a spec sheet: four segments laid out on
 * hairlines, then the garage reflexes underneath.
 */
export default async function GuideReadingReferencePage() {
  const t = await getDict();

  return (
    <div className="page-enter">
      <PageHeader
        title={t.resources.guides[0].title}
        lead={t.resources.guides[0].body}
      />

      {/* ── Intro band ──────────────────────────────────────────── */}
      <section className="border-b border-line bg-pit">
        <div className="section section-pad">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
            <Reveal>
              <p className="max-w-[62ch] text-[18px] leading-[1.7] text-paper">
                {t.resources.guideReferenceIntro}
              </p>
            </Reveal>

            <Reveal delay={80}>
              <div className="relative overflow-hidden border border-line bg-panel">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/editorial/workshop-3.jpg"
                  alt=""
                  className="aspect-[4/3] w-full object-cover opacity-80"
                  loading="lazy"
                />
                <div aria-hidden="true" className="flag-band-sm h-[6px] w-full opacity-70" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Segments ─────────────────────────────────────────────── */}
      <section className="border-b border-line bg-asphalt">
        <div className="section section-pad">
          <Reveal>
            <h2 className="font-display text-[26px] leading-none text-white sm:text-[34px]">
              {t.resources.guideReferenceSegmentsTitle}
            </h2>
          </Reveal>

          <dl className="mt-9 grid gap-px bg-line sm:grid-cols-2">
            {t.resources.guideReferenceSegments.map((segment, i) => (
              <Reveal key={segment.label} delay={i * 60}>
                <div className="h-full bg-asphalt p-7">
                  <dt className="flex items-baseline gap-4">
                    <span className="font-mono-num text-[12px] font-bold tracking-[0.12em] text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-[21px] leading-none text-white">
                      {segment.label}
                    </span>
                  </dt>
                  <dd className="mt-4 border-t border-line-soft pt-4 text-[15.5px] leading-[1.7] text-muted">
                    {segment.body}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Reflexes ─────────────────────────────────────────────── */}
      <section className="border-b border-line bg-pit">
        <div className="section section-pad">
          <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
            <Reveal>
              <h2 className="font-display text-[26px] leading-none text-white sm:text-[32px]">
                {t.resources.guideReferenceTipsTitle}
              </h2>
              <span aria-hidden="true" className="rule-gold mt-6 block w-24" />
            </Reveal>

            <ol className="border-t border-line">
              {t.resources.guideReferenceTips.map((tip, i) => (
                <Reveal key={tip} delay={i * 60} as="li">
                  <div className="flex gap-5 border-b border-line py-5">
                    <span className="font-mono-num text-[12px] font-bold tracking-[0.12em] text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[16px] leading-[1.7] text-muted">{tip}</span>
                  </div>
                </Reveal>
              ))}
            </ol>
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
