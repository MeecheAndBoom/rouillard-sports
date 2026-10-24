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
    title: t.resources.tools[1].title,
    description: t.resources.tools[1].body,
    path: "/tools/maintenance-calendar",
    locale,
  });
}

/**
 * Maintenance calendar. Each system gets a row with a load bar, so the
 * page reads as a wear gauge rather than a table.
 */
export default async function MaintenanceCalendarPage() {
  const t = await getDict();

  return (
    <div className="page-enter">
      <PageHeader title={t.resources.tools[1].title} lead={t.resources.tools[1].body} />

      <section className="border-b border-line bg-pit">
        <div className="section section-pad">
          <Reveal>
            <div className="flex flex-wrap items-center gap-6 border-b border-line pb-4">
              <span className="font-mono-num text-[10.5px] font-bold uppercase tracking-[0.14em] text-paper">
                {t.resources.maintenanceHeaders.system}
              </span>
              <span className="font-mono-num text-[10.5px] font-bold uppercase tracking-[0.14em] text-paper">
                {t.resources.maintenanceHeaders.interval}
              </span>
              <span className="ml-auto font-mono-num text-[10.5px] font-bold uppercase tracking-[0.14em] text-paper">
                {t.resources.maintenanceHeaders.note}
              </span>
            </div>
          </Reveal>

          <ul>
            {t.resources.maintenanceRows.map((row, i) => (
              <Reveal key={row.system} delay={Math.min(i, 8) * 45} as="li">
                <div className="grid gap-3 border-b border-line-soft py-5 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)_minmax(0,180px)] sm:items-center sm:gap-6">
                  <span className="font-display text-[18px] leading-[1.15] text-white">
                    {row.system}
                  </span>

                  <span className="flex items-center gap-4">
                    <span className="font-mono-num text-[14px] text-paper">{row.interval}</span>
                    <span
                      aria-hidden="true"
                      className="hidden h-[6px] min-w-[70px] flex-1 bg-panel-2 sm:block"
                    >
                      <span
                        className="block h-full bg-gold"
                        style={{ width: `${row.bar}%` }}
                      />
                    </span>
                  </span>

                  <span className="text-[14px] leading-[1.6] text-muted sm:text-right">
                    {row.note}
                  </span>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal className="mt-6">
            <div className="flex items-start gap-4 border-l-[3px] border-gold bg-panel px-6 py-5">
              <i className="fa-solid fa-triangle-exclamation mt-[3px] text-[15px] text-gold" aria-hidden="true" />
              <p className="max-w-[76ch] text-[15px] leading-[1.7] text-muted">
                {t.resources.maintenanceNote}
              </p>
            </div>
          </Reveal>

          <Reveal className="mt-10">
            <Link href="/tools" className="btn btn-ghost btn-sm">
              <i className="fa-solid fa-arrow-left text-[11px]" aria-hidden="true" />
              <span>{t.resources.backToTools}</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
