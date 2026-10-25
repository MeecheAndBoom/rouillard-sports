"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { COOKIE_MANAGE_EVENT } from "@/components/site/CookieConsent";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { LogoMark } from "@/components/site/Logo";
import { categoryLabel, SITE } from "@/lib/constants";

const LEGAL_SLUGS = [
  "privacy",
  "terms",
  "notice",
  "returns",
  "cancellation",
  "shipping",
  "delivery",
  "compliance",
] as const;

const DISCIPLINES = [
  "Brakes",
  "Suspension",
  "Engine",
  "Transmission",
  "Aero",
  "Cooling",
  "Electronics",
  "Wheels",
  "Tires",
  "Tools",
] as const;

export function Footer() {
  const { locale, t } = useLocale();
  const year = new Date().getFullYear();

  const columns: { heading: string; links: { href: string; label: string }[] }[] = [
    {
      heading: t.footer.shop,
      links: [
        { href: "/shop", label: t.footer.allParts },
        { href: "/cart", label: t.footer.cart },
        { href: "/track", label: t.footer.trackOrder },
        { href: "/retrieve-quote", label: t.footer.retrieveQuote },
      ],
    },
    {
      heading: t.footer.company,
      links: [
        { href: "/about", label: t.footer.aboutUs },
        { href: "/blog", label: t.footer.blogGuides },
        { href: "/guides", label: locale === "en" ? "Practical guides" : "Guides pratiques" },
        { href: "/testimonials", label: t.testimonials.title },
        { href: "/why-buy-from-us", label: t.whyBuy.title },
      ],
    },
    {
      heading: t.footer.support,
      links: [
        { href: "/help", label: t.footer.faq },
        { href: "/contact", label: t.footer.contactUs },
        { href: "/tools", label: locale === "en" ? "Workshop tools" : "Outils d’atelier" },
        { href: "/resources", label: t.footer.resources },
        { href: "/affiliate-program", label: t.footer.affiliate },
        { href: "/sitemap", label: t.sitemapPage.title },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-line bg-asphalt">
      <div aria-hidden="true" className="flag-band-sm h-[5px] w-full opacity-80" />

      <div className="section relative">
        {/* Closing statement */}
        <div className="flex flex-col gap-6 border-b border-line py-12 md:flex-row md:items-end md:justify-between md:py-16">
          <div className="max-w-[560px]">
            <h2 className="font-display text-[34px] leading-[0.95] text-white sm:text-[46px]">
              {locale === "en" ? "Ready for the next session." : "Prêt pour la prochaine session."}
            </h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-muted">
              {t.meta.tagline}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/shop" className="btn btn-primary">
              {t.common.viewAll}
              <i className="fa-solid fa-arrow-right text-[12px]" aria-hidden="true" />
            </Link>
            <a href={`tel:${SITE.phoneHref}`} className="btn btn-outline">
              <i className="fa-solid fa-phone text-[12px]" aria-hidden="true" />
              {SITE.phone}
            </a>
          </div>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark size={40} />
              <span className="font-display text-[20px] leading-none font-extrabold tracking-[0.02em] text-white">
                Rouillard<span className="text-gold"> Sport</span>
              </span>
            </div>
            <p className="mt-5 max-w-[300px] text-[14px] leading-[1.7] text-muted">
              {t.footer.tagline}
            </p>

            <ul className="mt-6 space-y-3 text-[14px] text-muted">
              <li className="flex items-start gap-3">
                <i className="fa-solid fa-location-dot mt-1 w-3.5 text-gold" aria-hidden="true" />
                <span>{SITE.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fa-solid fa-phone w-3.5 text-gold" aria-hidden="true" />
                <a href={`tel:${SITE.phoneHref}`} className="transition-colors hover:text-gold-light">
                  {SITE.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <i className="fa-brands fa-facebook w-3.5 text-gold" aria-hidden="true" />
                <a
                  href="https://www.facebook.com/share/1FDELCtat4/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-gold-light"
                >
                  Facebook
                </a>
              </li>
              <li className="flex items-center gap-3">
                <i className="fa-solid fa-envelope w-3.5 text-gold" aria-hidden="true" />
                <a
                  href={`mailto:${SITE.email}`}
                  className="break-all transition-colors hover:text-gold-light"
                >
                  {SITE.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <i className="fa-solid fa-clock w-3.5 text-gold" aria-hidden="true" />
                <span>
                  {locale === "en" ? SITE.hours[0].daysEn : SITE.hours[0].days}{" "}
                  <span className="font-mono-num">{SITE.hours[0].time}</span>
                </span>
              </li>
            </ul>
          </div>

          {columns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h3 className="font-display text-[13px] uppercase tracking-[0.16em] text-gold">
                {column.heading}
              </h3>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-muted transition-colors duration-150 hover:text-paper"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-t border-line py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-display text-[13px] uppercase tracking-[0.16em] text-gold">
              {t.footer.byCategory}
            </h3>
            <Link
              href="/shop"
              className="font-display text-[11px] uppercase tracking-[0.14em] text-muted transition-colors hover:text-gold-light"
            >
              {t.common.viewAll}
              <i className="fa-solid fa-arrow-right ml-2 text-[10px]" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {DISCIPLINES.map((category) => (
              <Link
                key={category}
                href={`/shop?category=${encodeURIComponent(category)}`}
                className="border border-line px-3 py-1.5 text-[12px] text-muted transition-all duration-150 hover:border-gold hover:text-gold-light active:scale-95"
              >
                {categoryLabel(category, locale)}
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-line py-7">
          <h3 className="font-display text-[13px] uppercase tracking-[0.16em] text-gold">
            {t.footer.legal}
          </h3>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_SLUGS.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/legal/${slug}`}
                  className="text-[13px] text-muted transition-colors hover:text-paper"
                >
                  {t.legal.pages[slug]}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent(COOKIE_MANAGE_EVENT))}
                className="text-[13px] text-muted transition-colors hover:text-paper"
              >
                <i className="fa-solid fa-cookie-bite mr-1.5 text-[11px]" aria-hidden="true" />
                {t.cookies.manage}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line bg-pit">
        <div className="section flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
          <p className="font-mono-num text-[11px] tracking-[0.06em] text-muted-dim">
            © {year} {t.meta.siteName.toUpperCase()} | {t.footer.rights}
          </p>
          <LanguageToggle />
        </div>
      </div>
    </footer>
  );
}
