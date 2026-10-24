import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products";
import { getPosts } from "@/lib/blog";

export type SearchHit = {
  type: "part" | "post";
  slug: string;
  title: string;
  titleEn?: string;
  image: string;
  meta: string;
  price?: number;
};

export type SearchResponse = {
  query: string;
  hits: SearchHit[];
  parts: number;
  posts: number;
};

/**
 * Live type-ahead search. Reads the same catalog the shop renders and scores
 * matches with a light weighting: title/reference hits first, then brand and
 * fitment text. Kept small (top 8) so the dropdown stays scannable.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const limit = Math.min(Number(url.searchParams.get("limit")) || 8, 20);

  if (q.length < 2) {
    return NextResponse.json(
      { query: q, hits: [], parts: 0, posts: 0 } satisfies SearchResponse,
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const needle = q.toLowerCase();
  const [products, posts] = await Promise.all([getProducts(), getPosts()]);

  const scored: { hit: SearchHit; score: number }[] = [];

  for (const p of products) {
    const title = `${p.title} ${p.titleEn ?? ""}`.toLowerCase();
    const ref = `${p.partNumber} ${p.sku ?? ""} ${p.oemNumbers.join(" ")}`.toLowerCase();
    const make = `${p.make} ${p.model}`.toLowerCase();
    const rest = `${p.brand} ${p.category} ${p.subcategory ?? ""} ${p.tags.join(" ")} ${p.fitment.join(" ")}`.toLowerCase();

    let score = 0;
    if (ref.includes(needle)) score += 6;
    if (title.includes(needle)) score += 5;
    if (make.includes(needle)) score += 3;
    if (rest.includes(needle)) score += 1;
    if (title.startsWith(needle)) score += 2;
    if (!score) continue;

    scored.push({
      score,
      hit: {
        type: "part",
        slug: p.slug,
        title: p.title,
        titleEn: p.titleEn,
        image: p.images[0] ?? "/images/placeholder.jpg",
        meta: [p.brand, p.partNumber].filter(Boolean).join(" · "),
        price: p.price,
      },
    });
  }

  for (const post of posts) {
    const title = `${post.title} ${post.titleEn ?? ""}`.toLowerCase();
    const body = `${post.excerpt} ${post.category} ${post.tags.join(" ")}`.toLowerCase();
    let score = 0;
    if (title.includes(needle)) score += 4;
    if (body.includes(needle)) score += 1;
    if (!score) continue;

    scored.push({
      score,
      hit: {
        type: "post",
        slug: post.slug,
        title: post.title,
        titleEn: post.titleEn,
        image: post.image || "/images/placeholder.jpg",
        meta: post.category,
      },
    });
  }

  scored.sort((a, b) => b.score - a.score);
  const hits = scored.slice(0, limit).map((s) => s.hit);

  return NextResponse.json(
    {
      query: q,
      hits,
      parts: scored.filter((s) => s.hit.type === "part").length,
      posts: scored.filter((s) => s.hit.type === "post").length,
    } satisfies SearchResponse,
    { headers: { "Cache-Control": "no-store" } },
  );
}
