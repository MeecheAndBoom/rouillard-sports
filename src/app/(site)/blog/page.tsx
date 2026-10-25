import type { Metadata } from "next";
import Link from "next/link";
import { getDict, getLocale } from "@/lib/i18n/server";
import { getPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";
import { shortDate } from "@/lib/format";
import { PageHeader } from "@/components/site/PageHeader";
import { HeroBackground } from "@/components/site/HeroBackground";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDict();
  return pageMetadata({
    title: t.blog.title,
    description: t.meta.blogDescription,
    path: "/blog",
    locale,
  });
}

/**
 * Carnet de bord. The lead entry opens the page as a wide split; the rest
 * read as a work-order log, each row carrying a mono index down the left
 * edge and a thumbnail that surfaces on hover.
 */
export default async function BlogPage() {
  const t = await getDict();
  const locale = await getLocale();
  const posts = await getPosts();

  const [lead, ...rest] = posts;

  const titleOf = (post: (typeof posts)[number]) =>
    locale === "en" && post.titleEn ? post.titleEn : post.title;
  const excerptOf = (post: (typeof posts)[number]) =>
    locale === "en" && post.excerptEn ? post.excerptEn : post.excerpt;

  return (
    <div className="page-enter">
      <PageHeader title={t.blog.title} lead={t.blog.lead} imageSrc="/images/editorial/hero-5.jpg"  />

      {posts.length === 0 ? (
        <section className="section section-pad">
          <p className="border border-line bg-panel px-6 py-16 text-center text-[16px] text-muted">
            {t.blog.empty}
          </p>
        </section>
      ) : (
        <>
          {/* ── Lead entry ─────────────────────────────────────── */}
          <section className="border-b border-line bg-pit">
            <div className="section section-pad">
              <Reveal>
                <Link
                  href={`/blog/${lead.slug}`}
                  className="group grid overflow-hidden border border-line bg-panel transition-colors duration-200 hover:border-gold/60 lg:grid-cols-[1.25fr_1fr]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-panel-2 lg:aspect-auto lg:border-r lg:border-b-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={lead.image || "/images/placeholder.jpg"}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 bg-gold px-3 py-1.5 font-mono-num text-[11px] font-bold tracking-[0.14em] text-gold-ink"
                    >
                      {t.blog.featured.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-col justify-center gap-5 p-7 sm:p-10">
                    <p className="font-mono-num text-[11px] uppercase tracking-[0.12em] text-muted-dim">
                      <span className="text-gold">{lead.category}</span>
                      <span aria-hidden="true" className="mx-2 text-line">
                        /
                      </span>
                      <time dateTime={lead.date}>{shortDate(lead.date, locale)}</time>
                    </p>
                    <h2 className="font-display text-[28px] leading-[1.02] text-white transition-colors duration-200 group-hover:text-gold-light sm:text-[38px]">
                      {titleOf(lead)}
                    </h2>
                    <p className="max-w-[52ch] text-[16px] leading-[1.7] text-muted">
                      {excerptOf(lead)}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-2 font-display text-[14px] tracking-[0.06em] text-gold">
                      {t.common.readMore}
                      <i
                        className="fa-solid fa-arrow-right text-[11px] transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </Link>
              </Reveal>
            </div>
          </section>

          {/* ── Log ────────────────────────────────────────────── */}
          <section className="border-b border-line bg-asphalt">
            <div className="section section-pad">
              <Reveal className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="font-display text-[26px] leading-none text-white sm:text-[34px]">
                  {t.blog.latest}
                </h2>
                <p className="font-mono-num text-[11px] uppercase tracking-[0.14em] text-muted-dim">
                  {rest.length === 1
                    ? t.blog.countOne
                    : t.blog.count.replace("{count}", String(rest.length))}
                </p>
              </Reveal>

              <ul className="mt-10 border-t border-line">
                {rest.map((post, i) => (
                  <li key={post.slug}>
                    <Reveal delay={Math.min(i, 8) * 55}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="group flex items-start gap-4 border-b border-line py-6 transition-colors duration-200 hover:bg-panel/60 sm:gap-8"
                      >
                        <span className="mt-1 w-8 shrink-0 font-mono-num text-[12px] font-bold tracking-[0.1em] text-gold">
                          {String(i + 2).padStart(2, "0")}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono-num text-[11px] uppercase tracking-[0.12em] text-muted-dim">
                            <span className="text-gold">{post.category}</span>
                            <span aria-hidden="true" className="text-line">
                              /
                            </span>
                            <time dateTime={post.date}>{shortDate(post.date, locale)}</time>
                            {post.readMinutes ? (
                              <>
                                <span aria-hidden="true" className="text-line">
                                  /
                                </span>
                                <span>
                                  {post.readMinutes} {t.blog.readMinutes}
                                </span>
                              </>
                            ) : null}
                          </span>
                          <span className="mt-2.5 block font-display text-[20px] leading-[1.1] text-white transition-colors duration-200 group-hover:text-gold-light sm:text-[26px]">
                            {titleOf(post)}
                          </span>
                          <span className="mt-2.5 block max-w-[68ch] text-[15px] leading-[1.7] text-muted">
                            {excerptOf(post)}
                          </span>
                        </span>

                        <span className="hidden h-[86px] w-[132px] shrink-0 overflow-hidden border border-line bg-panel-2 sm:block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.image || "/images/placeholder.jpg"}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                          />
                        </span>

                        <i
                          className="fa-solid fa-arrow-right mt-1 w-4 shrink-0 text-[12px] text-muted-dim transition-all duration-200 group-hover:translate-x-1 group-hover:text-gold"
                          aria-hidden="true"
                        />
                      </Link>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
