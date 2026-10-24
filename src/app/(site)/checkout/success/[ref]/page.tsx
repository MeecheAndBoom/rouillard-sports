import type { Metadata } from "next";
import Link from "next/link";
import { getDict, getLocale } from "@/lib/i18n/server";
import { findOrder, redactPaymentDetails } from "@/lib/orders";
import { pageMetadata } from "@/lib/seo";
import { money, shortDate } from "@/lib/format";
import { PageHeader, Breadcrumbs } from "@/components/site/PageHeader";
import { CopyButton } from "@/components/site/CopyButton";
import { PaymentProofUpload } from "@/components/site/PaymentProofUpload";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDict();
  return pageMetadata({
    title: t.success.title,
    description: t.success.lead,
    path: "/checkout/success",
    locale,
    noIndex: true,
  });
}

/**
 * Race control confirmation: the reference is the headline number, the
 * order sheet sits on the right, and the running order of the next steps
 * reads as a vertical pit-lane timeline.
 */
export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref } = await params;
  const t = await getDict();
  const locale = await getLocale();
  const reference = ref.toUpperCase();
  const order = await findOrder(reference);
  // Bank details never leave the server once the payment has landed.
  const safeOrder = order ? redactPaymentDetails(order) : null;

  const email = safeOrder?.customer.email ?? "";

  return (
    <div className="page-enter">
      <PageHeader
        title={t.success.title}
        lead={email ? `${t.success.lead} ${email}.` : t.success.leadFallback}
      />

      <Breadcrumbs
        items={[
          { label: t.shop.breadcrumbHome, href: "/" },
          { label: t.cart.title, href: "/cart" },
          { label: t.checkout.title, href: "/checkout" },
          { label: t.success.title },
        ]}
      />

      <section className="border-b border-line bg-pit">
        <div className="section section-pad">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
            {/* ── Main column ─────────────────────────────────────── */}
            <div className="flex flex-col gap-8">
              {/* Reference panel */}
              <Reveal>
                <div className="relative border border-line bg-panel">
                  <div aria-hidden="true" className="flag-band-sm h-[6px] w-full" />
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-4">
                      <span
                        aria-hidden="true"
                        className="grid h-11 w-11 shrink-0 place-items-center border border-success/45 bg-success/10 text-[18px] text-success"
                      >
                        <i className="fa-solid fa-circle-check" />
                      </span>
                      <p className="font-mono-num text-[11px] uppercase tracking-[0.16em] text-muted-dim">
                        {t.success.yourRef}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                      <p className="font-mono-num text-[30px] font-bold leading-none tracking-[0.06em] text-gold sm:text-[44px]">
                        {reference}
                      </p>
                      <CopyButton value={reference} label={t.common.save} />
                    </div>

                    <p className="mt-5 max-w-[52ch] text-[13.5px] leading-[1.65] text-muted">
                      {t.success.saveRef}
                    </p>
                  </div>
                </div>
              </Reveal>

              {/* Running order of the next steps */}
              <Reveal delay={80}>
                <div className="border border-line bg-panel p-6 sm:p-8">
                  <ol className="flex flex-col">
                    {t.success.steps.map((step, i) => (
                      <li
                        key={step.title}
                        className="relative flex gap-5 pb-7 last:pb-0"
                      >
                        {i < t.success.steps.length - 1 ? (
                          <span
                            aria-hidden="true"
                            className="absolute bottom-0 left-[17px] top-9 w-px bg-line"
                          />
                        ) : null}
                        <span className="relative grid h-9 w-9 shrink-0 place-items-center border border-gold bg-pit font-mono-num text-[13px] font-bold leading-none text-gold">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <h2 className="font-display text-[18px] leading-tight text-white">
                            {step.title}
                          </h2>
                          <p className="mt-2 text-[14px] leading-[1.65] text-muted">
                            {step.body}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>

              {/* Payment details, shown while the payment is open */}
              {safeOrder &&
              safeOrder.payment.proofMethod === "upload" &&
              (safeOrder.payment.paymentDetails || safeOrder.payment.instructions) &&
              safeOrder.payment.status !== "received" &&
              safeOrder.payment.proof?.decision !== "approved" ? (
                <Reveal delay={140}>
                  <div className="border border-line bg-panel-2 p-6">
                    <h2 className="font-display text-[16px] uppercase tracking-[0.08em] text-gold">
                      {t.success.paymentDetails}
                    </h2>
                    <p className="mt-3 whitespace-pre-wrap text-[13.5px] leading-[1.7] text-paper">
                      {safeOrder.payment.paymentDetails ??
                        safeOrder.payment.instructions}
                    </p>
                    <p className="mt-3 text-[12.5px] leading-[1.65] text-muted">
                      {t.success.paymentDetailsHint}
                    </p>
                  </div>
                </Reveal>
              ) : null}

              {/* Payment proof upload */}
              {safeOrder && safeOrder.payment.proofMethod === "upload" ? (
                <Reveal delay={180}>
                  <PaymentProofUpload order={safeOrder} />
                </Reveal>
              ) : null}
            </div>

            {/* ── Order sheet + next actions ─────────────────────── */}
            <aside className="flex flex-col gap-6 lg:sticky lg:top-[92px]">
              <div className="border border-line bg-panel">
                <div aria-hidden="true" className="flag-band-sm h-[4px] w-full" />
                <div className="p-6">
                  <h2 className="font-display text-[19px] leading-none text-white">
                    {t.checkout.orderSummary}
                  </h2>

                  <dl className="mt-5 flex flex-col gap-3 text-[14px]">
                    {safeOrder ? (
                      <>
                        <div className="flex justify-between gap-4">
                          <dt className="text-muted">{t.track.customer}</dt>
                          <dd className="text-right text-paper">
                            {safeOrder.customer.name}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-muted">{t.track.placedOn}</dt>
                          <dd className="font-mono-num text-right text-paper">
                            {safeOrder.createdAt
                              ? shortDate(safeOrder.createdAt, locale)
                              : t.common.none}
                          </dd>
                        </div>
                        <div className="flex justify-between gap-4">
                          <dt className="text-muted">{t.checkout.payment}</dt>
                          <dd className="text-right text-paper">
                            {safeOrder.payment.label ?? t.common.none}
                          </dd>
                        </div>
                        <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-line-soft pt-4">
                          <dt className="font-display text-[15px] uppercase tracking-[0.1em] text-white">
                            {t.cart.total}
                          </dt>
                          <dd className="font-mono-num text-[22px] font-bold text-gold">
                            {money(safeOrder.total, locale)}
                          </dd>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-baseline justify-between gap-4 border-t border-line-soft pt-4">
                        <dt className="font-display text-[15px] uppercase tracking-[0.1em] text-white">
                          {t.success.yourRef}
                        </dt>
                        <dd className="font-mono-num text-[18px] font-bold text-gold">
                          {reference}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {!safeOrder ? (
                    <p className="mt-4 text-[13px] leading-[1.6] text-muted">
                      {t.success.summaryPending}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="border border-line bg-panel p-6">
                <h2 className="font-display text-[19px] leading-none text-white">
                  {t.success.nextActions}
                </h2>
                <div className="mt-5 flex flex-col gap-3">
                  <Link href="/track" className="btn btn-primary w-full">
                    <i
                      className="fa-solid fa-location-crosshairs text-[12px]"
                      aria-hidden="true"
                    />
                    <span>{t.success.track}</span>
                  </Link>
                  <Link href="/shop" className="btn btn-outline w-full">
                    <i
                      className="fa-solid fa-bag-shopping text-[12px]"
                      aria-hidden="true"
                    />
                    <span>{t.success.keepBrowsing}</span>
                  </Link>
                </div>
                <p className="mt-5 text-[13px] leading-[1.6] text-muted">
                  {t.success.questions}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <div aria-hidden="true" className="flag-band-sm h-[6px] w-full" />
    </div>
  );
}
