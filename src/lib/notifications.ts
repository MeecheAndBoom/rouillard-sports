import { sendEmail } from "./mailer";
import { resolveSmtp } from "./settings";
import type { OrderRecord } from "./types";
import type { Locale } from "./i18n/config";
import type { Enquiry } from "./types";
import {
  EnquiryConfirmEmail,
  EnquiryNoticeEmail,
  NewOrderEmail,
  OrderReceivedEmail,
  PaymentConfirmedEmail,
  PaymentInstructionsEmail,
  ProofReceivedEmail,
  ProofRejectedEmail,
  StatusUpdateEmail,
} from "@/emails/templates";

export type NotifyResult = { ok: boolean; detail?: string };

async function adminUrl(path: string): Promise<string> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    "https://www.rouillard-sport.com";
  const smtp = await resolveSmtp();
  const origin = smtp ? base : "http://localhost:3000";
  return `${origin.replace(/\/$/, "")}${path}`;
}

/**
 * Sends one transactional email and reports whether it actually left the
 * building — callers surface "saved to outbox" instead of failing silently.
 */
async function deliver(
  to: string | string[],
  message: { subject: string; element: React.ReactElement },
): Promise<NotifyResult> {
  const res = await sendEmail({
    to,
    subject: message.subject,
    react: message.element,
  });
  if (res.delivered) return { ok: true, detail: res.savedPath };
  return { ok: false, detail: res.error ?? res.savedPath };
}

/* ── Order lifecycle ──────────────────────────────────────────── */

export async function notifyOrderReceived(order: OrderRecord): Promise<NotifyResult> {
  const locale = (order.lang ?? "fr") as Locale;
  const customer = await deliver(order.customer.email, OrderReceivedEmail({ order, locale }));
  const admin = await deliver(
    (await resolveSmtp())?.notify ?? process.env.ADMIN_EMAIL ?? order.customer.email,
    await (async () =>
      NewOrderEmail({
        order,
        locale,
        dashboardUrl: await adminUrl(`/admin/orders/${order.reference}`),
      }))(),
  );
  return { ok: customer.ok || admin.ok, detail: customer.detail ?? admin.detail };
}

export async function notifyPaymentInstructions(order: OrderRecord): Promise<NotifyResult> {
  const locale = (order.lang ?? "fr") as Locale;
  const customer = await deliver(
    order.customer.email,
    PaymentInstructionsEmail({ order, locale }),
  );
  // Admin gets a copy so there is a record of what the buyer received.
  const admin = await deliver(
    (await resolveSmtp())?.notify ?? process.env.ADMIN_EMAIL ?? order.customer.email,
    PaymentInstructionsEmail({ order, locale }),
  );
  return { ok: customer.ok || admin.ok, detail: customer.detail ?? admin.detail };
}

export async function notifyPaymentConfirmed(order: OrderRecord): Promise<NotifyResult> {
  const locale = (order.lang ?? "fr") as Locale;
  return deliver(order.customer.email, PaymentConfirmedEmail({ order, locale }));
}

export async function notifyProofReceived(order: OrderRecord): Promise<NotifyResult> {
  const locale = (order.lang ?? "fr") as Locale;
  return deliver(
    (await resolveSmtp())?.notify ?? process.env.ADMIN_EMAIL ?? order.customer.email,
    await (async () =>
      ProofReceivedEmail({
        order,
        locale,
        dashboardUrl: await adminUrl(`/admin/orders/${order.reference}`),
      }))(),
  );
}

export async function notifyProofRejected(order: OrderRecord): Promise<NotifyResult> {
  const locale = (order.lang ?? "fr") as Locale;
  return deliver(order.customer.email, ProofRejectedEmail({ order, locale }));
}

export async function notifyStatusUpdate(
  order: OrderRecord,
  statusLabel: string,
  note?: string,
): Promise<NotifyResult> {
  const locale = (order.lang ?? "fr") as Locale;
  return deliver(
    order.customer.email,
    StatusUpdateEmail({ order, locale, statusLabel, note }),
  );
}

/* ── Enquiries ────────────────────────────────────────────────── */

export async function notifyEnquiry(
  enquiry: Enquiry,
  locale: Locale,
): Promise<NotifyResult> {
  const customer = await deliver(
    enquiry.email,
    EnquiryConfirmEmail({ locale, name: enquiry.name }),
  );
  const smtp = await resolveSmtp();
  const admin = await deliver(
    smtp?.notify ?? process.env.ADMIN_EMAIL ?? enquiry.email,
    await (async () =>
      EnquiryNoticeEmail({
        locale,
        enquiry,
        dashboardUrl: await adminUrl("/admin/enquiries"),
      }))(),
  );
  return { ok: customer.ok || admin.ok, detail: customer.detail ?? admin.detail };
}
