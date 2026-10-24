import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { dictFor, getLocale } from "@/lib/i18n/server";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import {
  absoluteUrl,
  localBusinessJsonLd,
  organizationJsonLd,
  SITE_KEYWORDS,
  websiteJsonLd,
} from "@/lib/seo";

/* Type system — condensed display for the motorsport voice, neutral body
   copy, monospaced figures for part numbers, prices and timing data. */
const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = dictFor(locale);

  return {
    metadataBase: absoluteUrl("/"),
    title: {
      default: t.meta.siteName,
      template: `%s | ${t.meta.siteName}`,
    },
    description: t.meta.description,
    keywords: [...t.meta.keywords, ...SITE_KEYWORDS],
    alternates: {
      canonical: absoluteUrl("/"),
      languages: { fr: absoluteUrl("/"), en: absoluteUrl("/") },
    },
    manifest: "/manifest.json",
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      type: "website",
      locale: locale === "fr" ? "fr_FR" : "en_GB",
      siteName: t.meta.siteName,
      title: t.meta.siteName,
      description: t.meta.description,
      url: absoluteUrl("/"),
      images: [
        {
          url: "/rouillard_sport_open_graph.png",
          width: 1200,
          height: 630,
          alt: t.meta.siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.siteName,
      description: t.meta.shortDescription,
      images: ["/rouillard_sport_open_graph.png"],
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#08090a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const t = dictFor(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        {/* Theme before first paint: no flash for visitors who chose light. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="bg-pit text-paper antialiased">
        <a href="#main" className="skip-link">
          {t.nav.skipToContent}
        </a>
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd(locale)),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd(locale)),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd(locale)),
          }}
        />
      </body>
    </html>
  );
}
