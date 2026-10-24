import { Text } from "@react-email/components";
import * as React from "react";
import { EmailShell, SummaryRows, styles } from "./Shell";
import { SITE } from "@/lib/constants";
import type { OrderRecord } from "@/lib/types";
import type { Locale } from "@/lib/i18n/config";

const EMAIL_DICTS = {
  fr: {
    viewOrder: "Voir la commande",
    viewProof: "Voir la preuve",
    items: "Articles",
    total: "Total",
    amount: "Montant dû",
    paymentMethod: "Mode de paiement",
    dueDate: "Échéance",
    payInstructions: "Instructions",
    status: "Nouvel état",
    customer: "Client",
    reference: "Référence",
    greeting: "Bonjour",
    hello: "Bonjour,",
    signature: "L'équipe Rouillard Sport",
    newOrder: "Nouvelle commande",
    proofNote: "Note du client",
    proofRejectedReason: "Motif du refus",
    anyQuestion:
      "Une question ? Répondez à cet e-mail ou appelez le " + SITE.phone + ".",
  },
  en: {
    viewOrder: "View order",
    viewProof: "View proof",
    items: "Items",
    total: "Total",
    amount: "Amount due",
    paymentMethod: "Payment method",
    dueDate: "Due date",
    payInstructions: "Instructions",
    status: "New status",
    customer: "Customer",
    reference: "Reference",
    greeting: "Hello",
    hello: "Hello,",
    signature: "The Rouillard Sport team",
    newOrder: "New order",
    proofNote: "Customer note",
    proofRejectedReason: "Reason",
    anyQuestion:
      "A question? Reply to this email or call " + SITE.phone + ".",
  },
} as const;

/** Locale-bound email strings. */
const M = (locale: Locale) => EMAIL_DICTS[locale];

function siteUrl(path: string) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    "https://www.rouillard-sport.com";
  return `${base.replace(/\/$/, "")}${path}`;
}

function orderRows(order: OrderRecord, locale: Locale) {
  const m = M(locale);
  const fmt = (v: number) =>
    new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      style: "currency",
      currency: "EUR",
    }).format(v);
  return {
    rows: [
      ...order.items.map((item) => ({
        label: `${item.title} × ${item.qty}`,
        value: fmt(item.price * item.qty),
      })),
      { label: m.items, value: "" },
    ],
    total: { label: m.total, value: fmt(order.total) },
    fmt,
  };
}

/* ── 1. Order received (customer) ─────────────────────────────── */

export function OrderReceivedEmail({
  order,
  locale,
}: {
  order: OrderRecord;
  locale: Locale;
}) {
  const t = M(locale);
  const dict =
    locale === "fr"
      ? {
          subject: `Commande reçue | ${order.reference}`,
          heading: "Commande reçue.",
          body: "Merci ! Nous avons bien reçu votre commande. Les instructions de paiement arrivent par e-mail séparé sous peu.",
        }
      : {
          subject: `Order received | ${order.reference}`,
          heading: "Order received.",
          body: "Thank you! We have received your order. Payment instructions arrive in a separate email shortly.",
        };
  const { rows, total } = orderRows(order, locale);

  return {
    subject: dict.subject,
    element: (
      <EmailShell
        lang={locale}
        preview={dict.subject}
        heading={dict.heading}
        reference={order.reference}
        cta={{ label: t.viewOrder, href: siteUrl(`/track?ref=${order.reference}`) }}
      >
        <Text style={styles.text}>{dict.body}</Text>
        <Text style={styles.text}>
          <strong>{t.customer}:</strong> {order.customer.name} · {order.customer.email}
        </Text>
        <SummaryRows rows={rows.filter((r) => r.value)} totalRow={total} />
        <Text style={styles.muted}>{t.anyQuestion}</Text>
      </EmailShell>
    ),
  };
}

/* ── 2. New order (admin notice) ──────────────────────────────── */

export function NewOrderEmail({
  order,
  locale,
  dashboardUrl,
}: {
  order: OrderRecord;
  locale: Locale;
  dashboardUrl: string;
}) {
  const t = M(locale);
  const subject =
    locale === "fr"
      ? `Nouvelle commande ${order.reference} | ${order.customer.name}`
      : `New order ${order.reference} | ${order.customer.name}`;
  const { rows, total } = orderRows(order, locale);

  return {
    subject,
    element: (
      <EmailShell
        lang={locale}
        preview={subject}
        heading={t.newOrder}
        reference={order.reference}
        cta={{ label: t.viewOrder, href: dashboardUrl }}
      >
        <Text style={styles.text}>
          <strong>{t.customer}:</strong> {order.customer.name} · {order.customer.email}
        </Text>
        {order.customer.phone ? (
          <Text style={styles.text}>
            <strong>Phone:</strong> {order.customer.phone}
          </Text>
        ) : null}
        <Text style={styles.text}>
          <strong>{t.paymentMethod}:</strong> {order.payment.label}
          {order.payment.methodOther ? ` (${order.payment.methodOther})` : ""}
        </Text>
        <SummaryRows rows={rows.filter((r) => r.value)} totalRow={total} />
      </EmailShell>
    ),
  };
}

/* ── 3. Payment instructions (customer) ───────────────────────── */

export function PaymentInstructionsEmail({
  order,
  locale,
}: {
  order: OrderRecord;
  locale: Locale;
}) {
  const t = M(locale);
  const subject =
    locale === "fr"
      ? `Instructions de paiement | ${order.reference}`
      : `Payment instructions | ${order.reference}`;
  const heading =
    locale === "fr" ? "Instructions de paiement." : "Payment instructions.";
  const intro =
    locale === "fr"
      ? "Voici les détails pour régler votre commande. Une fois le paiement effectué, envoyez la preuve si cela vous est demandé."
      : "Here are the details to settle your order. Once paid, upload the proof if we have asked you to.";
  const fmt = (v: number) =>
    new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
      style: "currency",
      currency: "EUR",
    }).format(v);

  const rows = [
    { label: t.paymentMethod, value: order.payment.label },
    ...(order.payment.amountDue
      ? [{ label: t.amount, value: fmt(order.payment.amountDue) }]
      : []),
    ...(order.payment.dueDate
      ? [{ label: t.dueDate, value: String(order.payment.dueDate).slice(0, 10) }]
      : []),
  ];

  return {
    subject,
    element: (
      <EmailShell
        lang={locale}
        preview={subject}
        heading={heading}
        reference={order.reference}
        cta={{
          label: t.viewOrder,
          href: siteUrl(`/track?ref=${order.reference}`),
        }}
      >
        <Text style={styles.text}>{intro}</Text>
        <SummaryRows rows={rows} />
        {order.payment.paymentDetails || order.payment.instructions ? (
          <>
            <Text style={{ ...styles.text, fontWeight: 600, marginBottom: 4 }}>
              {t.payInstructions}
            </Text>
            {/* pre-line keeps the admin's line breaks (IBAN / BIC / holder) */}
            <Text style={{ ...styles.text, whiteSpace: "pre-line" }}>
              {order.payment.paymentDetails ?? order.payment.instructions}
            </Text>
          </>
        ) : null}
      </EmailShell>
    ),
  };
}

/* ── 4. Payment confirmed / proof approved (customer) ─────────── */

export function PaymentConfirmedEmail({
  order,
  locale,
}: {
  order: OrderRecord;
  locale: Locale;
}) {
  const subject =
    locale === "fr"
      ? `Paiement confirmé | ${order.reference}`
      : `Payment confirmed | ${order.reference}`;
  const heading =
    locale === "fr" ? "Paiement confirmé." : "Payment confirmed.";
  const body =
    locale === "fr"
      ? "Votre paiement est confirmé. La commande passe en préparation et vous serez informé(e) dès l'expédition."
      : "Your payment is confirmed. The order moves into preparation and you will be notified at dispatch.";

  return {
    subject,
    element: (
      <EmailShell
        lang={locale}
        preview={subject}
        heading={heading}
        reference={order.reference}
        cta={{
          label: locale === "fr" ? "Suivre la commande" : "Track order",
          href: siteUrl(`/track?ref=${order.reference}`),
        }}
      >
        <Text style={styles.text}>{body}</Text>
      </EmailShell>
    ),
  };
}

/* ── 5. Proof received (admin notice) ─────────────────────────── */

export function ProofReceivedEmail({
  order,
  locale,
  dashboardUrl,
}: {
  order: OrderRecord;
  locale: Locale;
  dashboardUrl: string;
}) {
  const t = M(locale);
  const subject =
    locale === "fr"
      ? `Preuve de paiement reçue | ${order.reference}`
      : `Payment proof received | ${order.reference}`;
  const body =
    locale === "fr"
      ? "Le client a téléversé une preuve de paiement. Vérifiez-la et validez ou refusez-la dans le tableau de bord."
      : "The customer uploaded a payment proof. Review it and approve or reject it in the dashboard.";
  const note = order.payment.proof?.note;

  return {
    subject,
    element: (
      <EmailShell
        lang={locale}
        preview={subject}
        heading={
          locale === "fr" ? "Preuve de paiement reçue." : "Payment proof received."
        }
        reference={order.reference}
        cta={{ label: t.viewProof, href: dashboardUrl }}
      >
        <Text style={styles.text}>{body}</Text>
        <Text style={styles.text}>
          <strong>{t.customer}:</strong> {order.customer.name} · {order.customer.email}
        </Text>
        {note ? (
          <Text style={styles.text}>
            <strong>{t.proofNote}:</strong> {note}
          </Text>
        ) : null}
      </EmailShell>
    ),
  };
}

/* ── 6. Proof rejected (customer) ─────────────────────────────── */

export function ProofRejectedEmail({
  order,
  locale,
}: {
  order: OrderRecord;
  locale: Locale;
}) {
  const t = M(locale);
  const subject =
    locale === "fr"
      ? `Preuve à renvoyer | ${order.reference}`
      : `Please resend your proof | ${order.reference}`;
  const heading =
    locale === "fr" ? "Preuve à renvoyer." : "Proof needs resending.";
  const body =
    locale === "fr"
      ? "Nous ne pouvons pas valider la preuve de paiement envoyée. Le motif figure ci-dessous, corrigez puis renvoyez une nouvelle capture depuis la page de suivi."
      : "We cannot validate the proof you sent. The reason is below. Fix it and send a new screenshot from the track page.";
  const reason = order.payment.proof?.decisionNote;

  return {
    subject,
    element: (
      <EmailShell
        lang={locale}
        preview={subject}
        heading={heading}
        reference={order.reference}
        cta={{
          label: locale === "fr" ? "Renvoyer la preuve" : "Resend proof",
          href: siteUrl(`/track?ref=${order.reference}`),
        }}
      >
        <Text style={styles.text}>{body}</Text>
        {reason ? (
          <Text style={styles.text}>
            <strong>{t.proofRejectedReason}:</strong> {reason}
          </Text>
        ) : null}
      </EmailShell>
    ),
  };
}

/* ── 7. Status update (customer) ──────────────────────────────── */

export function StatusUpdateEmail({
  order,
  locale,
  statusLabel,
  note,
}: {
  order: OrderRecord;
  locale: Locale;
  statusLabel: string;
  note?: string;
}) {
  const t = M(locale);
  const subject =
    locale === "fr"
      ? `Mise à jour de commande | ${order.reference}`
      : `Order update | ${order.reference}`;

  return {
    subject,
    element: (
      <EmailShell
        lang={locale}
        preview={subject}
        heading={locale === "fr" ? "Commande mise à jour." : "Order updated."}
        reference={order.reference}
        cta={{
          label: locale === "fr" ? "Suivre la commande" : "Track order",
          href: siteUrl(`/track?ref=${order.reference}`),
        }}
      >
        <Text style={styles.text}>
          <strong>{t.status}:</strong> {statusLabel}
        </Text>
        {note ? <Text style={styles.text}>{note}</Text> : null}
      </EmailShell>
    ),
  };
}

/* ── 8. Enquiry confirmation (customer) ───────────────────────── */

export function EnquiryConfirmEmail({
  locale,
  name,
}: {
  locale: Locale;
  name: string;
}) {
  const t = M(locale);
  const subject =
    locale === "fr" ? "Votre message a bien été reçu" : "Your message was received";
  const heading =
    locale === "fr" ? "Message bien reçu." : "Message received.";
  const body =
    locale === "fr"
      ? `Merci ${name}. Un membre de l'équipe vous répond sous 24 h ouvrées.`
      : `Thank you, ${name}. A team member replies within 24 working hours.`;

  return {
    subject,
    element: (
      <EmailShell
        lang={locale}
        preview={subject}
        heading={heading}
        cta={{
          label: locale === "fr" ? "Voir le site" : "Visit the site",
          href: siteUrl("/"),
        }}
      >
        <Text style={styles.text}>{body}</Text>
        <Text style={styles.muted}>{t.anyQuestion}</Text>
      </EmailShell>
    ),
  };
}

/* ── 9. Enquiry notice (admin) ────────────────────────────────── */

export function EnquiryNoticeEmail({
  locale,
  enquiry,
  dashboardUrl,
}: {
  locale: Locale;
  enquiry: { name: string; email: string; subject?: string; message?: string };
  dashboardUrl: string;
}) {
  const subject =
    locale === "fr"
      ? `Nouvelle demande | ${enquiry.name}`
      : `New enquiry | ${enquiry.name}`;

  return {
    subject,
    element: (
      <EmailShell
        lang={locale}
        preview={subject}
        heading={locale === "fr" ? "Nouvelle demande." : "New enquiry."}
        cta={{
          label: locale === "fr" ? "Voir les demandes" : "View enquiries",
          href: dashboardUrl,
        }}
      >
        <Text style={styles.text}>
          <strong>{enquiry.name}</strong> · {enquiry.email}
        </Text>
        {enquiry.subject ? (
          <Text style={styles.text}>
            <strong>Sujet / Subject:</strong> {enquiry.subject}
          </Text>
        ) : null}
        {enquiry.message ? (
          <Text style={styles.text}>{enquiry.message}</Text>
        ) : null}
      </EmailShell>
    ),
  };
}
