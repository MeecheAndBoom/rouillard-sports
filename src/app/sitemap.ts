import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { getProducts } from "@/lib/products";
import { getPosts } from "@/lib/blog";
import { LEGAL_PAGES } from "@/lib/legal";

const STATIC_PATHS = [
  "/",
  "/shop",
  "/blog",
  "/about",
  "/contact",
  "/help",
  "/track",
  "/retrieve-quote",
  "/affiliate-program",
  "/resources",
  "/testimonials",
  "/why-buy-from-us",
  "/first-time-buyers",
  "/sitemap",
  "/catalog",
  "/browse",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries = STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));

  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const [products, posts] = await Promise.all([getProducts(), getPosts()]);
    dynamicEntries = [
      ...products.map((product) => ({
        url: absoluteUrl(`/shop/${product.slug}`),
        lastModified: new Date(product.createdAt ?? now),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...posts.map((post) => ({
        url: absoluteUrl(`/blog/${post.slug}`),
        lastModified: new Date(post.date),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...LEGAL_PAGES.map((page) => ({
        url: absoluteUrl(`/legal/${page.slug}`),
        lastModified: new Date(page.updated),
        changeFrequency: "yearly" as const,
        priority: 0.3,
      })),
    ];
  } catch {
    /* store unavailable — static entries still ship */
  }

  return [...staticEntries, ...dynamicEntries];
}
