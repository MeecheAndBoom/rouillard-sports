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
    title: t.whyBuy.title,
    description: t.whyBuy.lead,
    path: "/why-buy-from-us",
    locale,
  });
}

const ICONS = [
  "fa-puzzle-piece",
  "fa-boxes-stacked",
  "fa-truck-fast",
  "fa-rotate-left",
  "fa-tag",
  "fa-comments",
];

/**
 * Why buy from us. The commitments are read as a ledger: one hairline row
 * per point, index on the left, claim in the middle, detail on the right.
 */
export default async function WhyBuyPage() {
  const t = await getDict();

  return (
    <div className="page-enter">
      <PageHeader title={t.whyBuy.title} lead={t.whyBuy.lead} imageSrc="/images/editorial/hero-4.jpg" />

      <section className="border-b border-line bg-pit">
        <div className="section section-pad">
          <Reveal>
            <h2 className="font-display text-[26px] leading-none text-white sm:text-[34px]">
              {t.whyBuy.pointsTitle}
            </h2>
          </Reveal>

          <ul className="mt-10 border-t border-line">
            {t.whyBuy.points.map((point, i) => (
              <Reveal as="li" key={point.title} delay={Math.min(i, 8) * 50}>
                <div className="group grid gap-4 border-b border-line py-7 transition-colors duration-200 hover:bg-panel/50 sm:grid-cols-[56px_minmax(0,300px)_minmax(0,1fr)] sm:items-start sm:gap-8 lg:grid-cols-[56px_minmax(0,340px)_minmax(0,1fr)]">
                  <span
                    aria-hidden="true"
                    className="grid h-12 w-12 place-items-center border border-line text-[16px] text-gold transition-colors duration-200 group-hover:border-gold/60"
                  >
                    <i className={`fa-solid ${ICONS[i] ?? "fa-check"}`} />
                  </span>

                  <h3 className="font-display text-[21px] leading-[1.1] text-white sm:text-[23px]">
                    {point.title}
                  </h3>

                  <p className="max-w-[64ch] text-[16px] leading-[1.75] text-muted">
                    {point.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Closing band over the paddock ─────────────────────────── */}
      <section className="on-dark relative overflow-hidden border-b border-line bg-asphalt">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/editorial/paddock-3.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          loading="lazy"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,10,0.95)_0%,rgba(8,9,10,0.72)_58%,rgba(8,9,10,0.45)_100%)]"
        />
        <div className="section relative py-16 sm:py-20">
          <Reveal className="max-w-[620px]">
            <h2 className="font-display text-[28px] leading-none text-white sm:text-[40px]">
              {t.whyBuy.ctaTitle}
            </h2>
            <p className="mt-5 max-w-[54ch] text-[16.5px] leading-[1.7] text-white/90">
              {t.whyBuy.ctaLead}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-primary">
                <i className="fa-solid fa-bag-shopping text-[12px]" aria-hidden="true" />
                <span>{t.footer.allParts}</span>
              </Link>
              <Link href="/contact" className="btn btn-outline">
                <i className="fa-solid fa-paper-plane text-[12px]" aria-hidden="true" />
                <span>{t.home.ctaButton}</span>
              </Link>
            </div>
          </Reveal>
        </div>
        <div aria-hidden="true" className="flag-band-sm h-[6px] w-full opacity-70" />
      </section>
    </div>
  );
}
