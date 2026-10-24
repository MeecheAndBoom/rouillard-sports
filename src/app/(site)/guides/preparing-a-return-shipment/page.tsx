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
    title: t.resources.guides[2].title,
    description: t.resources.guides[2].body,
    path: "/guides/preparing-a-return-shipment",
    locale,
  });
}

/**
 * Guide 03. Three parallel columns, one per preparation step, sitting under
 * a deadline banner. The columns are the only place on the site where the
 * content splits three ways.
 */
export default async function GuideReturnsPage() {
  const t = await getDict();

  return (
    <div className="page-enter">
      <PageHeader title={t.resources.guides[2].title} lead={t.resources.guides[2].body} />

      <section className="border-b border-line bg-pit">
        <div className="section section-pad">
          <Reveal>
            <div className="flex flex-wrap items-center gap-5 border border-gold/40 bg-panel px-7 py-6">
              <i className="fa-solid fa-hourglass-half text-[18px] text-gold" aria-hidden="true" />
              <p className="max-w-[74ch] text-[16.5px] leading-[1.7] text-paper">
                {t.resources.guideReturnsDeadline}
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-px bg-line md:grid-cols-3">
            {t.resources.guideReturnsSections.map((section, i) => (
              <Reveal key={section.title} delay={i * 70}>
                <div className="flex h-full flex-col bg-pit p-7">
                  <div className="flex items-center gap-4">
                    <span className="font-mono-num text-[12px] font-bold tracking-[0.12em] text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="font-display text-[21px] leading-none text-white">
                      {section.title}
                    </h2>
                  </div>

                  <ul className="mt-6 flex flex-col gap-4">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3.5">
                        <span
                          aria-hidden="true"
                          className="mt-[9px] h-[5px] w-[5px] shrink-0 bg-gold"
                        />
                        <span className="text-[15px] leading-[1.7] text-muted">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12 flex flex-wrap items-center gap-4">
            <Link href="/guides" className="btn btn-ghost btn-sm">
              <i className="fa-solid fa-arrow-left text-[11px]" aria-hidden="true" />
              <span>{t.resources.backToGuides}</span>
            </Link>
            <Link href="/track" className="btn btn-dark btn-sm">
              <i className="fa-solid fa-location-dot text-[11px]" aria-hidden="true" />
              <span>{t.nav.track}</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
