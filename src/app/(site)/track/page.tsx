import type { Metadata } from "next";
import Link from "next/link";
import { getDict, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { PageHeader, Breadcrumbs } from "@/components/site/PageHeader";
import { HeroBackground } from "@/components/site/HeroBackground";
import { TrackLookupForm } from "@/components/site/TrackLookup";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDict();
  return pageMetadata({
    title: t.track.title,
    description: t.track.lead,
    path: "/track",
    locale,
    noIndex: true,
  });
}

/**
 * Race control desk: the lookup form sits on the pit-wall side, the
 * assistance line runs underneath it.
 */
export default async function TrackPage() {
  const t = await getDict();

  return (
    <div className="page-enter">
      <PageHeader title={t.track.title} lead={t.track.lead} imageSrc="/images/editorial/paddock-1.jpg">

      <Breadcrumbs
        items={[
          { label: t.shop.breadcrumbHome, href: "/" },
          { label: t.track.title },
        ]}
      />

      <section className="border-b border-line bg-pit">
        <div className="section section-pad">
          <TrackLookupForm />
        </div>
      </section>

      <div aria-hidden="true" className="flag-band-sm h-[6px] w-full" />

      {/* ── Assistance line ────────────────────────────────────────── */}
      <section className="bg-asphalt">
        <div className="section py-12 sm:py-14">
          <Reveal>
            <div className="grid gap-px border border-line bg-line md:grid-cols-[1fr_auto]">
              <div className="bg-panel p-6 sm:p-8">
                <span
                  aria-hidden="true"
                  className="grid h-11 w-11 place-items-center border border-line text-[16px] text-gold"
                >
                  <i className="fa-solid fa-headset" />
                </span>
                <p className="mt-5 font-display text-[20px] leading-none text-white">
                  {t.common.questions}
                </p>
                <p className="mt-3 max-w-[52ch] text-[14.5px] leading-[1.7] text-muted">
                  {t.track.needHelp}
                </p>
              </div>

              <div className="flex flex-col justify-center gap-3 bg-panel p-6 sm:p-8 md:min-w-[280px]">
                <a
                  href={`tel:${SITE.phoneHref}`}
                  className="btn btn-outline w-full justify-center"
                >
                  <i className="fa-solid fa-phone text-[12px]" aria-hidden="true" />
                  <span className="font-mono-num">{SITE.phone}</span>
                </a>
                <Link href="/help" className="btn btn-ghost w-full justify-center">
                  <i
                    className="fa-solid fa-circle-question text-[12px]"
                    aria-hidden="true"
                  />
                  <span>{t.nav.help}</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
