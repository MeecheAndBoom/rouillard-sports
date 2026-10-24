import type { Metadata } from "next";
import Link from "next/link";
import { getDict, getLocale } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { LEGAL_PAGES, legalTitle } from "@/lib/legal";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDict();
  return pageMetadata({
    title: t.sitemapPage.title,
    description: t.sitemapPage.lead,
    path: "/sitemap",
    locale,
  });
}

type LinkItem = { label: string; href: string };

/**
 * Site map. The sections run as a workshop plan: hairline rows grouped
 * under a gold-ruled header, laid out in two columns on wide screens.
 */
export default async function SitemapPage() {
  const t = await getDict();
  const locale = await getLocale();

  const main: LinkItem[] = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.shop, href: "/shop" },
    { label: t.nav.blog, href: "/blog" },
    { label: t.nav.about, href: "/about" },
    { label: t.nav.contact, href: "/contact" },
    { label: t.nav.track, href: "/track" },
    { label: t.nav.help, href: "/help" },
  ];
  const shop: LinkItem[] = [
    { label: t.footer.allParts, href: "/shop" },
    { label: t.testimonials.title, href: "/testimonials" },
    { label: t.whyBuy.title, href: "/why-buy-from-us" },
    { label: t.firstTime.title, href: "/first-time-buyers" },
    { label: t.affiliate.title, href: "/affiliate-program" },
  ];
  const orders: LinkItem[] = [
    { label: t.nav.cart, href: "/cart" },
    { label: t.checkout.title, href: "/checkout" },
    { label: t.nav.track, href: "/track" },
    { label: t.retrieveQuote.title, href: "/retrieve-quote" },
    { label: t.affiliate.title, href: "/affiliate-program" },
  ];
  const help: LinkItem[] = [
    { label: t.help.title, href: "/help" },
    { label: t.contact.title, href: "/contact" },
    { label: t.nav.track, href: "/track" },
    { label: t.resources.title, href: "/resources" },
  ];
  const guides: LinkItem[] = [
    { label: t.resources.guidesTitle, href: "/guides" },
    ...t.resources.guides.map((guide, i) => ({
      label: guide.title,
      href: [
        "/guides/reading-a-manufacturer-reference",
        "/guides/checking-compatibility-in-3-steps",
        "/guides/preparing-a-return-shipment",
      ][i] ?? "/guides",
    })),
    { label: t.resources.toolsTitle, href: "/tools" },
    ...t.resources.tools.map((tool, i) => ({
      label: tool.title,
      href: ["/tools/torque-calculator", "/tools/maintenance-calendar"][i] ?? "/tools",
    })),
  ];
  const legal: LinkItem[] = LEGAL_PAGES.map((page) => ({
    label: legalTitle(page, locale),
    href: `/legal/${page.slug}`,
  }));
  const company: LinkItem[] = [
    { label: t.about.title, href: "/about" },
    { label: t.blog.title, href: "/blog" },
    { label: t.home.ctaButton, href: "/contact" },
  ];

  const groups: { title: string; links: LinkItem[] }[] = [
    { title: t.sitemapPage.main, links: dedupe(main) },
    { title: t.sitemapPage.shop, links: dedupe(shop) },
    { title: t.sitemapPage.account, links: dedupe(orders) },
    { title: t.sitemapPage.helpCenter, links: dedupe(help) },
    { title: t.sitemapPage.guides, links: dedupe(guides) },
    { title: t.sitemapPage.legalPages, links: legal },
    { title: t.sitemapPage.company, links: dedupe(company) },
  ];

  return (
    <div className="page-enter">
      <PageHeader title={t.sitemapPage.title} lead={t.sitemapPage.lead} />

      <section className="border-b border-line bg-pit">
        <div className="section section-pad">
          <div className="columns-1 gap-12 lg:columns-2">
            {groups.map((group, i) => (
              <Reveal key={group.title} delay={Math.min(i, 8) * 45} className="mb-12 break-inside-avoid">
                <nav aria-label={group.title}>
                  <div className="flex items-center gap-4 border-b border-line pb-3">
                    <h2 className="font-display text-[20px] leading-none text-white">
                      {group.title}
                    </h2>
                    <span
                      aria-hidden="true"
                      className="h-[1px] flex-1 bg-line-soft"
                    />
                    <span className="font-mono-num text-[11px] text-muted-dim">
                      {String(group.links.length).padStart(2, "0")}
                    </span>
                  </div>

                  <ul className="mt-1">
                    {group.links.map((link) => (
                      <li key={`${group.title}-${link.href}-${link.label}`}>
                        <Link
                          href={link.href}
                          className="group flex items-center justify-between gap-4 border-b border-line-soft py-3 text-[15px] text-muted transition-colors duration-150 hover:text-white"
                        >
                          <span>{link.label}</span>
                          <i
                            className="fa-solid fa-arrow-right text-[10px] text-muted-dim opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:text-gold group-hover:opacity-100"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function dedupe(links: LinkItem[]): LinkItem[] {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}
