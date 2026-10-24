import { connectDB, hasDatabase } from "./db";
import { Settings } from "./models/Settings";
import { readJson } from "./fileStore";
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, PAYMENT_METHODS, SITE } from "./constants";

export type PaymentMethodSetting = {
  id: string;
  label: string;
  labelEn: string;
  hint: string;
  hintEn: string;
  enabled: boolean;
  /** If true, send payment instructions/email after order. If false, show stored payment details to buyer and allow proof upload. */
  sendEmailAfterOrder?: boolean;
  /** Default payment details shown to buyer when not using email. */
  defaultPaymentDetails?: string;
  defaultPaymentDetailsEn?: string;
};

export type SiteHours = { days: string; daysEn: string; time: string };

export type SiteSettings = {
  site: {
    name: string;
    tagline: string;
    taglineEn: string;
    location: string;
    address: string;
    phone: string;
    phoneHref: string;
    email: string;
    announcement: string;
    hours: SiteHours[];
  };
  paymentMethods: PaymentMethodSetting[];
  delivery: { fee: number; freeThreshold: number };
};

const DEFAULT_SETTINGS: SiteSettings = {
  site: {
    name: SITE.name,
    tagline: SITE.tagline,
    taglineEn: SITE.taglineEn,
    location: SITE.location,
    address: SITE.address,
    phone: SITE.phone,
    phoneHref: SITE.phoneHref,
    email: SITE.email,
    announcement: "",
    hours: SITE.hours.map((h) => ({ ...h })),
  },
  paymentMethods: PAYMENT_METHODS.map((m) => ({
    id: m.id,
    label: m.label,
    labelEn: m.labelEn,
    hint: m.hint,
    hintEn: m.hintEn,
    enabled: true,
  })),
  delivery: { fee: DELIVERY_FEE, freeThreshold: FREE_DELIVERY_THRESHOLD },
};

/**
 * Settings resolution order: env → database singleton → data/settings.json →
 * built-in defaults. Rendered per-request so admin edits appear without a
 * redeploy (the reference project's singleton pattern).
 */
export async function getSettings(): Promise<SiteSettings> {
  if (hasDatabase()) {
    try {
      await connectDB();
      const doc = (await Settings.findOne({ key: "site" }).lean()) as
        | (Partial<SiteSettings> & { site?: Partial<SiteSettings["site"]>; paymentMethods?: PaymentMethodSetting[]; delivery?: Partial<SiteSettings["delivery"]> })
        | null;
      if (doc) {
        return mergeSettings(doc);
      }
    } catch {
      /* fall through to file store */
    }
  }

  const stored = await readJson<Partial<SiteSettings> | null>("settings", null);
  if (stored) return mergeSettings(stored);
  return DEFAULT_SETTINGS;
}

function mergeSettings(doc: Partial<SiteSettings>): SiteSettings {
  return {
    site: {
      ...DEFAULT_SETTINGS.site,
      ...(doc.site ?? {}),
      hours:
        doc.site?.hours && doc.site.hours.length
          ? doc.site.hours
          : DEFAULT_SETTINGS.site.hours,
    },
    paymentMethods:
      doc.paymentMethods && doc.paymentMethods.length
        ? doc.paymentMethods
        : DEFAULT_SETTINGS.paymentMethods,
    delivery: {
      ...DEFAULT_SETTINGS.delivery,
      ...(doc.delivery ?? {}),
    },
  };
}

export { DEFAULT_SETTINGS };

/* ── Credentials (env always wins, stored settings as fallback) ── */

export function getCloudinaryCredentials():
  | { cloudName: string; apiKey: string; apiSecret: string }
  | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (cloudName && apiKey && apiSecret) return { cloudName, apiKey, apiSecret };
  return null;
}

/** Async variant: env first, then the admin's saved credentials. */
export async function resolveCloudinaryCredentials(): Promise<
  { cloudName: string; apiKey: string; apiSecret: string } | null
> {
  const fromEnv = getCloudinaryCredentials();
  if (fromEnv) return fromEnv;
  if (!hasDatabase()) return null;
  try {
    await connectDB();
    const doc = (await Settings.findOne({ key: "site" }).lean()) as {
      cloudinary?: { cloudName?: string; apiKey?: string; apiSecret?: string };
    } | null;
    const c = doc?.cloudinary;
    if (c?.cloudName && c?.apiKey && c?.apiSecret) {
      return { cloudName: c.cloudName, apiKey: c.apiKey, apiSecret: c.apiSecret };
    }
  } catch {
    /* not configured */
  }
  return null;
}

export type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  notify: string;
};

/**
 * SMTP settings with env-first override (the user's Gmail app password
 * lives in .env.local and must never depend on database state).
 */
export async function resolveSmtp(): Promise<SmtpConfig | null> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (host && user && pass) {
    return {
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      user,
      pass,
      from: process.env.EMAIL_FROM ?? `${SITE.name} <${user}>`,
      notify: process.env.NOTIFICATION_EMAIL ?? process.env.ADMIN_EMAIL ?? user,
    };
  }
  if (!hasDatabase()) return null;
  try {
    await connectDB();
    const doc = (await Settings.findOne({ key: "site" }).lean()) as {
      smtp?: Partial<SmtpConfig>;
    } | null;
    const s = doc?.smtp;
    if (s?.host && s?.user && s?.pass) {
      return {
        host: s.host,
        port: Number(s.port ?? 587),
        secure: Boolean(s.secure),
        user: s.user,
        pass: s.pass,
        from: s.from ?? `${SITE.name} <${s.user}>`,
        notify: s.notify ?? process.env.ADMIN_EMAIL ?? s.user,
      };
    }
  } catch {
    /* not configured */
  }
  return null;
}
