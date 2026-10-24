import type { CSSProperties } from "react";
import { Stars } from "@/components/ui/FormBits";
import { shortDate } from "@/lib/format";
import type { Review } from "@/lib/types";

/**
 * Auto-scrolling review strip. Two identical tracks slide left in a seamless
 * loop; hovering pauses, and reduced motion turns it into a static row.
 */
export function ReviewsMarquee({ reviews, locale }: { reviews: Review[]; locale: "fr" | "en" }) {
  if (!reviews.length) return null;
  const duration = Math.max(44, reviews.length * 14);

  const track = (clone: boolean) => (
    <ul className="flex shrink-0 items-stretch" aria-hidden={clone ? "true" : undefined}>
      {reviews.map((review) => (
        <li
          key={`${review.name}-${review.date}-${clone ? "b" : "a"}`}
          className="w-[320px] shrink-0 pr-4 sm:w-[380px]"
        >
          <figure className="flex h-full flex-col gap-4 border border-line bg-panel p-6 transition-colors duration-300 hover:border-gold/50">
            <div className="flex items-center justify-between">
              <Stars rating={review.rating} />
              <span className="font-mono-num text-[10px] tracking-[0.08em] text-muted-dim">
                {String(review.rating).padStart(2, "0")}/05
              </span>
            </div>
            <blockquote className="text-[14.5px] leading-[1.7] text-muted">
              {review.title ? (
                <span className="mb-1.5 block font-display text-[16px] leading-tight text-white">
                  {review.title}
                </span>
              ) : null}
              <span className="line-clamp-4">{review.body}</span>
            </blockquote>
            <figcaption className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
              <span className="font-display text-[13px] uppercase tracking-[0.08em] text-paper">
                {review.name}
                {review.city ? (
                  <span className="ml-1.5 font-body text-[12px] tracking-normal text-muted-dim normal-case">
                    {review.city}
                  </span>
                ) : null}
              </span>
              <time className="font-mono-num text-[10.5px] text-muted-dim" dateTime={review.date}>
                {shortDate(review.date, locale)}
              </time>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee">
      <div
        className="marquee-group flex"
        style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
      >
        {track(false)}
        {track(true)}
      </div>
    </div>
  );
}
