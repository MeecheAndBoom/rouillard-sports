import type { Metadata } from "next";
import { getDict, getLocale } from "@/lib/i18n/server";
import { getReviews, averageRating } from "@/lib/reviews";
import { pageMetadata } from "@/lib/seo";
import { shortDate } from "@/lib/format";
import { PageHeader } from "@/components/site/PageHeader";
import { HeroBackground } from "@/components/site/HeroBackground";
import { ReviewForm } from "@/components/site/PublicForms";
import { Stars } from "@/components/ui/FormBits";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDict();
  return pageMetadata({
    title: t.testimonials.title,
    description: t.testimonials.lead,
    path: "/testimonials",
    locale,
  });
}

/**
 * Testimonials. The reviews run as a two-column wall of panels, each with a
 * machined corner mark, and the form opens as a full-width sheet below.
 */
export default async function TestimonialsPage() {
  const t = await getDict();
  const locale = await getLocale();
  const reviews = await getReviews();
  const average = averageRating(reviews);
  const summary =
    reviews.length === 1
      ? t.testimonials.summaryOne
      : t.testimonials.summary
          .replace("{rating}", average.toFixed(1))
          .replace("{count}", String(reviews.length));

  return (
    <div className="page-enter">
      <PageHeader title={t.testimonials.title} lead={t.testimonials.lead}>
        {reviews.length ? (
          <span className="flex items-center gap-4 border border-line bg-panel px-5 py-3">
            <Stars rating={average} />
            <span className="font-mono-num text-[12.5px] text-paper">{summary}</span>
          </span>
        ) : null}
      </PageHeader>

      <section className="border-b border-line bg-pit">
        <div className="section section-pad">
          {reviews.length === 0 ? (
            <p className="border border-line bg-panel px-6 py-16 text-center text-[16px] text-muted">
              {t.testimonials.empty}
            </p>
          ) : (
            <ul className="grid gap-px bg-line md:grid-cols-2">
              {reviews.map((review, i) => (
                <Reveal
                  as="li"
                  key={`${review.name}-${review.date}`}
                  delay={Math.min(i, 8) * 55}
                  className="bg-pit"
                >
                  <figure className="relative flex h-full flex-col border border-line bg-panel p-7 sm:p-8">
                    <span
                      aria-hidden="true"
                      className="absolute top-0 right-0 h-6 w-6 border-b border-l border-gold/50 bg-gold/10"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Stars rating={review.rating} />
                      <span className="badge badge-quiet">
                        <i
                          className="fa-solid fa-circle-check text-[11px] text-success"
                          aria-hidden="true"
                        />
                        {t.testimonials.verified}
                      </span>
                    </div>

                    {review.title ? (
                      <h2 className="mt-4 font-display text-[20px] leading-[1.15] text-white">
                        {review.title}
                      </h2>
                    ) : null}

                    <blockquote className="mt-3 flex-1 text-[15.5px] leading-[1.75] text-muted">
                      {review.body}
                    </blockquote>

                    <figcaption className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-5">
                      <span className="font-display text-[15px] tracking-[0.02em] text-paper">
                        {review.name}
                        {review.city ? (
                          <span className="ml-2 font-body text-[13.5px] text-muted-dim">
                            {review.city}
                          </span>
                        ) : null}
                      </span>
                      <span className="flex items-center gap-4 font-mono-num text-[11.5px] text-muted-dim">
                        {review.purchased ? (
                          <span className="text-muted">{review.purchased}</span>
                        ) : null}
                        <time dateTime={review.date}>{shortDate(review.date, locale)}</time>
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── Write a review ──────────────────────────────────────── */}
      <section className="border-b border-line bg-asphalt">
        <div className="section section-pad">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-16">
              <div>
                <h2 className="font-display text-[28px] leading-none text-white sm:text-[36px]">
                  {t.testimonials.writeTitle}
                </h2>
                <p className="mt-5 text-[16px] leading-[1.7] text-muted">
                  {t.testimonials.writeLead}
                </p>
                <span aria-hidden="true" className="rule-gold mt-7 block w-24" />
              </div>

              <div className="border border-line bg-panel p-7 sm:p-9">
                <h3 className="font-display text-[19px] leading-none text-white">
                  {t.testimonials.formTitle}
                </h3>
                <div className="mt-7">
                  <ReviewForm />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
