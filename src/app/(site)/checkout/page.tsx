import type { Metadata } from "next";
import { getDict, getLocale } from "@/lib/i18n/server";
import { getSettings } from "@/lib/settings";
import { pageMetadata } from "@/lib/seo";
import { PageHeader, Breadcrumbs } from "@/components/site/PageHeader";
import { CheckoutForm } from "@/components/site/CheckoutForm";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getDict();
  return pageMetadata({
    title: t.checkout.title,
    description: t.checkout.lead,
    path: "/checkout",
    locale,
    noIndex: true,
  });
}

/**
 * Pit-lane order sheet: a numbered step rail on the left, a sticky summary
 * panel on the right. The whole flow lives in the client component so the
 * delivery fee and the totals stay live while the form is filled.
 */
export default async function CheckoutPage() {
  const t = await getDict();
  const settings = await getSettings();

  return (
    <div className="page-enter">
      <PageHeader title={t.checkout.title} lead={t.checkout.lead} imageSrc="/images/editorial/hero-6.jpg" />

      <Breadcrumbs
        items={[
          { label: t.shop.breadcrumbHome, href: "/" },
          { label: t.cart.title, href: "/cart" },
          { label: t.checkout.title },
        ]}
      />

      <section className="border-b border-line bg-pit">
        <div className="section section-pad">
          <CheckoutForm
            paymentMethods={settings.paymentMethods}
            deliveryFee={settings.delivery.fee}
            freeThreshold={settings.delivery.freeThreshold}
          />
        </div>
      </section>

      <div aria-hidden="true" className="flag-band-sm h-[6px] w-full" />
    </div>
  );
}
