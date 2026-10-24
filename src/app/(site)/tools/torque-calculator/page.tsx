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
    title: t.resources.tools[0].title,
    description: t.resources.tools[0].body,
    path: "/tools/torque-calculator",
    locale,
  });
}

/**
 * Torque reference. A spec sheet: hairline rows, the Nm column carried in
 * gold mono type, the imperial conversion set beside it.
 */
export default async function TorqueCalcPage() {
  const t = await getDict();

  return (
    <div className="page-enter">
      <PageHeader title={t.resources.tools[0].title} lead={t.resources.tools[0].body} />

      <section className="border-b border-line bg-pit">
        <div className="section section-pad">
          <Reveal>
            <div className="overflow-x-auto border border-line">
              <table className="w-full min-w-[680px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-panel-2">
                    <th
                      scope="col"
                      className="px-6 py-4 font-mono-num text-[10.5px] font-bold uppercase tracking-[0.14em] text-paper"
                    >
                      {t.resources.torqueHeaders.fastener}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-right font-mono-num text-[10.5px] font-bold uppercase tracking-[0.14em] text-paper"
                    >
                      {t.resources.torqueHeaders.nm}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-right font-mono-num text-[10.5px] font-bold uppercase tracking-[0.14em] text-paper"
                    >
                      {t.resources.torqueHeaders.lbf}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 font-mono-num text-[10.5px] font-bold uppercase tracking-[0.14em] text-paper"
                    >
                      {t.resources.torqueHeaders.note}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {t.resources.torqueRows.map((row) => (
                    <tr key={row.fastener} className="border-b border-line-soft last:border-b-0">
                      <th
                        scope="row"
                        className="px-6 py-4 text-left text-[15px] font-normal leading-[1.5] text-paper"
                      >
                        {row.fastener}
                      </th>
                      <td className="px-6 py-4 text-right font-mono-num text-[19px] font-bold text-gold">
                        {row.nm}
                      </td>
                      <td className="px-6 py-4 text-right font-mono-num text-[15px] text-muted">
                        {row.lbf}
                      </td>
                      <td className="px-6 py-4 text-[14.5px] leading-[1.6] text-muted">
                        {row.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          <Reveal className="mt-6">
            <div className="flex items-start gap-4 border-l-[3px] border-gold bg-panel px-6 py-5">
              <i className="fa-solid fa-triangle-exclamation mt-[3px] text-[15px] text-gold" aria-hidden="true" />
              <p className="max-w-[76ch] text-[15px] leading-[1.7] text-muted">
                {t.resources.torqueNote}
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
