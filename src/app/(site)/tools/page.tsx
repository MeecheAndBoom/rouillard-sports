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
    title: t.resources.toolsHubTitle,
    description: t.resources.toolsHubLead,
    path: "/tools",
    locale,
  });
}

const TOOL_HREFS = ["/tools/torque-calculator", "/tools/maintenance-calendar"];
const TOOL_ICONS = ["fa-wrench", "fa-calendar-check"];

/**
 * Tools hub. Two stacked reference panels, each with a workshop still on
 * one side and a large glyph watermark behind the copy.
 */
export default async function ToolsHubPage() {
  const t = await getDict();

  return (
    <div className="page-enter">
      <PageHeader title={t.resources.toolsHubTitle} lead={t.resources.toolsHubLead} />

      <section className="border-b border-line bg-pit">
        <div className="section section-pad">
          <div className="flex flex-col gap-6">
            {t.resources.tools.map((tool, i) => (
              <Reveal key={tool.title} delay={i * 80}>
                <Link
                  href={TOOL_HREFS[i] ?? "/tools"}
                  className="group grid overflow-hidden border border-line bg-panel transition-colors duration-200 hover:border-gold/60 lg:grid-cols-[minmax(0,1fr)_340px]"
                >
                  <div className="relative overflow-hidden p-8 sm:p-10">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-2 -bottom-8 font-display text-[130px] leading-none text-white/[0.035]"
                    >
                      <i className={`fa-solid ${TOOL_ICONS[i] ?? "fa-wrench"}`} />
                    </span>
                    <span className="relative flex items-center gap-4">
                      <span
                        aria-hidden="true"
                        className="grid h-12 w-12 shrink-0 place-items-center border border-line text-[17px] text-gold transition-colors duration-200 group-hover:border-gold/60"
                      >
                        <i className={`fa-solid ${TOOL_ICONS[i] ?? "fa-wrench"}`} />
                      </span>
                      <span className="font-mono-num text-[11px] uppercase tracking-[0.14em] text-muted-dim">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </span>

                    <h2 className="relative mt-6 font-display text-[26px] leading-none text-white transition-colors duration-200 group-hover:text-gold-light sm:text-[34px]">
                      {tool.title}
                    </h2>
                    <p className="relative mt-4 max-w-[52ch] text-[16px] leading-[1.7] text-muted">
                      {tool.body}
                    </p>
                    <span className="relative mt-7 inline-flex items-center gap-2 font-display text-[13px] tracking-[0.08em] text-gold">
                      {t.common.viewDetails}
                      <i
                        className="fa-solid fa-arrow-right text-[11px] transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </div>

                  <div className="relative order-first min-h-[180px] overflow-hidden border-b border-line lg:order-last lg:min-h-0 lg:border-b-0 lg:border-l">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={i === 0 ? "/images/editorial/hero-4.jpg" : "/images/editorial/workshop-2.jpg"}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover opacity-60"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,9,10,0.55)_0%,rgba(8,9,10,0.15)_100%)]"
                    />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-12">
            <Link href="/resources" className="btn btn-ghost btn-sm">
              <i className="fa-solid fa-arrow-left text-[11px]" aria-hidden="true" />
              <span>{t.resources.title}</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
