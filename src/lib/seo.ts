import type { Metadata } from "next";
import { SITE } from "./constants";
import type { Product, BlogPost } from "./types";
import type { Locale } from "./i18n/config";
import { dictionaries } from "./i18n/dictionaries";

/**
 * Search terms for the motorsport parts market: head terms around racing
 * spares, brake and suspension components, part-number lookups, plus the
 * long tail that pit crews actually type.
 */
export const SITE_KEYWORDS = [
  // FR — BMW specialist head terms
  "pièces BMW",
  "pièces BMW M",
  "pièces Mini",
  "spécialiste BMW Lyon",
  "pièces détachées BMW",
  "entretien BMW Lyon",
  // FR — broader parts market
  "pièces auto course",
  "pièces détachées compétition",
  "pièces racing",
  "freinage course",
  "suspension rallye",
  "échappement sport",
  "aérodynamique rallye",
  "pièces performances",
  "jantes course",
  "pneus compétition",
  "pièces détachées Peugeot 208 Rallye",
  "pièces détachées Renault Clio",
  "pièces détachées Alpine",
  "pièces détachées Porsche",
  "acheter pièce racing",
  "pièce occasion performance",
  "pièces détachées Lyon",
  "pièces détachées Rhône",
  // EN — BMW specialist + export terms
  "BMW parts",
  "BMW M parts",
  "Mini parts",
  "BMW specialist France",
  "BMW spare parts online",
  "motorsport spare parts",
  "racing parts online",
  "race car parts",
  "performance car parts",
  "motorsport brake components",
  "racing suspension parts",
  "track day parts",
  "rally parts France",
  "OEM racing parts",
  "motorsport parts Lyon",
];

export function absoluteUrl(path: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    "https://www.rouillard-sport.com";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Localized product title — falls back to French when no EN variant exists. */
export function localizedTitle(product: Product, locale: Locale): string {
  return locale === "en" && product.titleEn ? product.titleEn : product.title;
}

export function localizedDescription(product: Product, locale: Locale): string {
  return locale === "en" && product.descriptionEn
    ? product.descriptionEn
    : product.description;
}

export function localizedPost(post: BlogPost, locale: Locale) {
  if (locale === "en" && post.titleEn) {
    return {
      title: post.titleEn,
      excerpt: post.excerptEn ?? post.excerpt,
      body: post.bodyEn ?? post.body,
    };
  }
  return { title: post.title, excerpt: post.excerpt, body: post.body };
}

export function productTitle(product: Product, locale: Locale = "fr"): string {
  const t = dictionaries[locale];
  return `${localizedTitle(product, locale)} | ${t.product.partNumber} ${product.partNumber} | ${t.meta.siteName}`;
}

export function productDescription(product: Product, locale: Locale = "fr"): string {
  const base = localizedDescription(product, locale);
  return base.length > 155 ? `${base.slice(0, 152).trimEnd()}…` : base;
}

export function productKeywords(product: Product): string[] {
  return [
    product.partNumber,
    product.brand,
    product.make,
    product.model,
    product.category,
    ...product.tags,
  ].filter(Boolean);
}

export function pageMetadata({
  title,
  description,
  path,
  locale,
  noIndex = false,
  image,
}: {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  noIndex?: boolean;
  image?: string;
}): Metadata {
  const t = dictionaries[locale];
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      title,
      description,
      url: absoluteUrl(path),
      siteName: t.meta.siteName,
      locale: locale === "fr" ? "fr_FR" : "en_GB",
      images: [
        {
          url: image ?? "/rouillard_sport_open_graph.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image ?? "/rouillard_sport_open_graph.png"],
    },
  };
}

/* ── JSON-LD builders ─────────────────────────────────────────── */

export function organizationJsonLd(locale: Locale) {
  const t = dictionaries[locale];
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: t.meta.siteName,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/logo-icon.png"),
    email: SITE.email,
    telephone: SITE.phoneHref,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address,
      addressLocality: SITE.location,
      addressCountry: "FR",
    },
  };
}

/** Sitewide WebSite schema with a search pointing at the shop filter. */
export function websiteJsonLd(locale: Locale) {
  const t = dictionaries[locale];
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: t.meta.siteName,
    url: absoluteUrl("/"),
    inLanguage: locale,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/shop?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Local-business schema — the workshop is a real address in Décines-Charpieu,
 * north of Lyon, which is what the regional motorsport searches rank on.
 */
export function localBusinessJsonLd(locale: Locale) {
  const t = dictionaries[locale];
  return {
    "@context": "https://schema.org",
    "@type": "AutoPartsStore",
    name: t.meta.siteName,
    description: t.meta.description,
    url: absoluteUrl("/"),
    image: absoluteUrl("/rouillard_sport_open_graph.png"),
    email: SITE.email,
    telephone: SITE.phoneHref,
    priceRange: "€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.address,
      addressLocality: "Décines-Charpieu",
      addressRegion: "Auvergne-Rhône-Alpes",
      postalCode: "69150",
      addressCountry: "FR",
    },
    geo: { "@type": "GeoCoordinates", latitude: 45.9726, longitude: 4.9519 },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "09:00",
        closes: "13:00",
      },
    ],
  };
}

/** BlogPosting schema for articles — feeds Google's article rich results. */
export function blogPostJsonLd(
  post: BlogPost,
  locale: Locale,
  path: string,
) {
  const { title, excerpt } = localizedPost(post, locale);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: excerpt,
    image: post.image
      ? absoluteUrl(post.image)
      : absoluteUrl("/rouillard_sport_open_graph.png"),
    datePublished: post.date,
    dateModified: post.createdAt ?? post.date,
    inLanguage: locale,
    mainEntityOfPage: absoluteUrl(path),
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: dictionaries[locale].meta.siteName,
      logo: { "@type": "ImageObject", url: absoluteUrl("/logo-icon.png") },
    },
  };
}

export function productJsonLd(product: Product, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: localizedTitle(product, locale),
    sku: product.partNumber,
    description: productDescription(product, locale),
    brand: { "@type": "Brand", name: product.brand },
    category: product.category,
    image: product.images.map((img) => absoluteUrl(img)),
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: "EUR",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/shop/${product.slug}`),
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
  locale: Locale,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
    inLanguage: locale,
  };
}

export function faqJsonLd(
  faqs: { q: string; a: string }[],
  locale: Locale,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
