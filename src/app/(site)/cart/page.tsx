import type { Metadata } from "next";
import { getDict, getLocale } from "@/lib/i18n/server";
import { getSettings } from "@/lib/settings";
import { pageMetadata } from "@/lib/seo";
import { money } from "@/lib/format";
import { PageHeader, Breadcrumbs } from "@/components/site/PageHeader";
import { CartView } from "@/components/site/CartView";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDict();
  return pageMetadata({
    title: t.cart.title,
    description: t.meta.shortDescription,
    path: "/cart",
    locale,
    noIndex: true,
  });
}

/** Pit-lane service board: what happens to the order, what it costs, what is kept. */
export default async function CartPage() {
  const t = await getDict();
  const locale = await getLocale();
  const settings = await getSettings();

  const board = [
    {
      icon: "fa-truck-fast",
      text: t.cart.shippingNote,
    },
    {
      icon: "fa-tag",
      text: t.cart.freeFrom.replace(
        "{amount}",
        money(settings.delivery.freeThreshold, locale),
      ),
    },
    {
      icon: "fa-box-archive",
      text: t.cart.saved,
    },
  ];

  return (
    <div className="page-enter">
      <PageHeader title={t.cart.title} lead={t.cart.emptyHint} / imageSrc="/images/editorial/hero-5.jpg">

      <Breadcrumbs
        items={[
          { label: t.shop.breadcrumbHome, href: "/" },
          { label: t.cart.title },
        ]}
      />

      {/* ── Loading bay: the cart itself ─────────────────────────── */}
      <section className="border-b border-line bg-pit">
        <div className="section section-pad">
          <CartView
            deliveryFee={settings.delivery.fee}
            freeThreshold={settings.delivery.freeThreshold}
          />
        </div>
      </section>

      <div aria-hidden="true" className="flag-band-sm h-[6px] w-full" />

      {/* ── Service board ────────────────────────────────────────── */}
      <section className="bg-asphalt">
        <div className="section py-12 sm:py-14">
          <ul className="grid gap-px bg-line sm:grid-cols-3">
            {board.map((row, i) => (
              <Reveal as="li" key={row.text} delay={i * 70} className="bg-asphalt">
                <div className="flex h-full flex-col p-6 sm:p-7">
                  <span className="font-mono-num text-[11px] font-bold tracking-[0.16em] text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-5 grid h-10 w-10 place-items-center border border-line text-[15px] text-gold"
                  >
                    <i className={`fa-solid ${row.icon}`} />
                  </span>
                  <p className="mt-5 text-[14.5px] leading-[1.7] text-muted">
                    {row.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
