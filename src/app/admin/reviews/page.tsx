import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getReviews, averageRating } from "@/lib/reviews";
import { shortDate } from "@/lib/format";
import { AdminHead, ResponsiveList, Pill } from "@/components/admin/AdminUi";
import { ReviewActions } from "@/components/admin/ModerationButtons";
import { Stars } from "@/components/ui/FormBits";

export const metadata: Metadata = {
  title: "Reviews",
  robots: { index: false, follow: false },
};

/**
 * Review moderation. The published average sits in the subtitle, each entry
 * carries its publication state as a chip and moderation runs inline.
 */
export default async function AdminReviewsPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const reviews = await getReviews({ includeUnpublished: true });
  const average = averageRating(reviews.filter((r) => r.published));

  return (
    <>
      <AdminHead
        title="Reviews"
        subtitle={`${reviews.length} reviews. Published average ${average.toFixed(1)} / 5.`}
        action={
          <Link href="/testimonials" target="_blank" className="btn btn-ghost btn-sm">
            <i
              className="fa-solid fa-arrow-up-right-from-square text-[11px]"
              aria-hidden="true"
            />
            <span>Public page</span>
          </Link>
        }
      />

      <ResponsiveList
        rows={reviews}
        getKey={(review) => `${review.name}-${review.date}`}
        empty="No reviews yet. Customers submit them from the testimonials page."
        columns={[
          {
            key: "author",
            header: "Author",
            render: (review) => (
              <span className="flex flex-col">
                <span className="font-medium text-paper">
                  {review.name}
                  {review.city ? (
                    <span className="font-normal text-muted"> / {review.city}</span>
                  ) : null}
                </span>
                {review.email ? (
                  <span className="font-mono-num text-[12.5px] text-muted">{review.email}</span>
                ) : null}
              </span>
            ),
          },
          {
            key: "rating",
            header: "Rating",
            render: (review) => <Stars rating={review.rating} />,
          },
          {
            key: "body",
            header: "Review",
            render: (review) => (
              <span className="flex max-w-[420px] flex-col">
                {review.title ? (
                  <span className="text-[14px] font-medium text-paper">{review.title}</span>
                ) : null}
                <span className="line-clamp-2 text-[13.5px] text-muted">{review.body}</span>
              </span>
            ),
          },
          {
            key: "date",
            header: "Date",
            render: (review) => (
              <span className="font-mono-num text-[13px] text-muted">
                {shortDate(review.date, "fr")}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (review) => (
              <Pill tone={review.published ? "success" : "warning"}>
                {review.published ? "published" : "hidden"}
              </Pill>
            ),
          },
          {
            key: "actions",
            header: "",
            align: "right",
            render: (review) => (
              <ReviewActions date={review.date} published={review.published} />
            ),
          },
        ]}
        tile={(review) => (
          <div className="border border-line bg-panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[15px] font-medium text-paper">{review.name}</span>
              <Pill tone={review.published ? "success" : "warning"}>
                {review.published ? "published" : "hidden"}
              </Pill>
            </div>
            <div className="mt-1.5">
              <Stars rating={review.rating} />
            </div>
            <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-muted">
              {review.body}
            </p>
            <p className="mt-2 font-mono-num text-[12.5px] text-muted-dim">
              {shortDate(review.date, "fr")}
            </p>
            <div className="mt-3 flex justify-end border-t border-line-soft pt-3">
              <ReviewActions date={review.date} published={review.published} />
            </div>
          </div>
        )}
      />
    </>
  );
}
