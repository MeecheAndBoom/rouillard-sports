import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, getLocale } from "@/lib/i18n/server";
import { getPost, getPosts } from "@/lib/blog";
import {
  absoluteUrl,
  blogPostJsonLd,
  breadcrumbJsonLd,
  localizedPost,
  pageMetadata,
} from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { shortDate } from "@/lib/format";
import { SITE } from "@/lib/constants";
import { Breadcrumbs } from "@/components/site/PageHeader";
import { PostBody } from "@/components/site/PostBody";
import { CopyButton } from "@/components/site/CopyButton";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const post = await getPost(slug);
  if (!post) return { title: "404" };
  const { title, excerpt } = localizedPost(post, locale);
  return pageMetadata({
    title,
    description: excerpt,
    path: `/blog/${post.slug}`,
    locale,
    image: post.image,
  });
}

/**
 * Article sheet. A sticky specification rail carries the metadata, the body
 * sits in a single reading column, and the cover is cut as a wide band with
 * a chequered foot.
 */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getDict();
  const locale = await getLocale();
  const post = await getPost(slug);
  if (!post || post.status === "draft") notFound();

  const { title, excerpt, body } = localizedPost(post, locale);
  const all = await getPosts();
  const related = all.filter((p) => p.slug !== post.slug).slice(0, 2);

  const facts: { label: string; value: string }[] = [
    { label: t.blog.category, value: post.category },
    { label: t.blog.latest, value: shortDate(post.date, locale) },
    { label: t.blog.byAuthor, value: post.author || SITE.name },
  ];
  if (post.readMinutes) {
    facts.push({
      label: t.blog.readMinutes,
      value: `${post.readMinutes} min`,
    });
  }

  return (
    <article className="page-enter">
      <Breadcrumbs
        items={[
          { label: t.shop.breadcrumbHome, href: "/" },
          { label: t.blog.title, href: "/blog" },
          { label: title },
        ]}
      />

      <JsonLd data={blogPostJsonLd(post, locale, `/blog/${post.slug}`)} />
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: t.shop.breadcrumbHome, path: "/" },
            { name: t.blog.title, path: "/blog" },
            { name: title, path: `/blog/${post.slug}` },
          ],
          locale,
        )}
      />

      {/* ── Header band ─────────────────────────────────────────── */}
      <header className="border-b border-line bg-asphalt">
        <div className="section pt-8 pb-10 sm:pt-12 sm:pb-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-16">
            <div>
              <h1 className="max-w-[820px] font-display text-[34px] leading-[0.96] text-white sm:text-[52px]">
                {title}
              </h1>
              <p className="mt-6 max-w-[62ch] text-[17px] leading-[1.7] text-muted">
                {excerpt}
              </p>
            </div>

            {/* Specification rail */}
            <aside className="border-t border-line lg:border-t-0 lg:border-l lg:border-line lg:pl-8">
              <dl className="divide-y divide-line-soft">
                {facts.map((fact) => (
                  <div key={fact.label} className="py-3.5">
                    <dt className="font-mono-num text-[10.5px] uppercase tracking-[0.14em] text-muted-dim">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 font-mono-num text-[14px] text-paper">{fact.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 border-t border-line-soft pt-4">
                <CopyButton value={absoluteUrl(`/blog/${post.slug}`)} />
              </div>
            </aside>
          </div>
        </div>
      </header>

      {/* ── Cover ───────────────────────────────────────────────── */}
      <div className="border-b border-line bg-pit">
        <div className="section py-8 sm:py-10">
          <div className="relative aspect-[16/8] w-full overflow-hidden border border-line bg-panel-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image || "/images/placeholder.jpg"}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
          <div aria-hidden="true" className="flag-band-sm mt-6 h-[6px] w-full opacity-60" />
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="border-b border-line bg-pit">
        <div className="section-narrow section-pad">
          <div className="max-w-[740px]">
            <PostBody markdown={body} />
          </div>

          {post.tags.length ? (
            <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-line pt-7">
              <span className="mr-1 font-mono-num text-[10.5px] uppercase tracking-[0.14em] text-muted-dim">
                {t.blog.tags}
              </span>
              {post.tags.map((tag) => (
                <span key={tag} className="badge badge-quiet">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Related ─────────────────────────────────────────────── */}
      {related.length ? (
        <section className="border-b border-line bg-asphalt">
          <div className="section section-pad">
            <Reveal className="mb-9 flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-[26px] leading-none text-white sm:text-[34px]">
                {t.blog.related}
              </h2>
              <Link href="/blog" className="btn btn-ghost btn-sm">
                <i className="fa-solid fa-arrow-left text-[11px]" aria-hidden="true" />
                <span>{t.blog.backToBlog}</span>
              </Link>
            </Reveal>

            <ul className="grid gap-px bg-line md:grid-cols-2">
              {related.map((item, i) => {
                const itemTitle =
                  locale === "en" && item.titleEn ? item.titleEn : item.title;
                const itemExcerpt =
                  locale === "en" && item.excerptEn ? item.excerptEn : item.excerpt;
                return (
                  <li key={item.slug} className="bg-asphalt">
                    <Reveal delay={i * 70}>
                      <Link
                        href={`/blog/${item.slug}`}
                        className="group flex h-full flex-col p-7 transition-colors duration-200 hover:bg-panel"
                      >
                        <span className="font-mono-num text-[11px] font-bold tracking-[0.14em] text-gold">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="mt-4 font-display text-[21px] leading-[1.1] text-white transition-colors duration-200 group-hover:text-gold-light">
                          {itemTitle}
                        </span>
                        <span className="mt-3 text-[15px] leading-[1.7] text-muted">
                          {itemExcerpt}
                        </span>
                        <span className="mt-6 inline-flex items-center gap-2 font-mono-num text-[11px] uppercase tracking-[0.12em] text-muted-dim">
                          <time dateTime={item.date}>{shortDate(item.date, locale)}</time>
                          <i
                            className="fa-solid fa-arrow-right text-[10px] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-gold"
                            aria-hidden="true"
                          />
                        </span>
                      </Link>
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : null}
    </article>
  );
}
