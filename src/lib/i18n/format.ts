import type { Locale } from "./config";

/**
 * Locale-aware formatting shared by server and client code.
 * Money: EUR everywhere — French grouping for FR, anglophone layout for EN.
 */

export function formatMoney(
  value: number,
  locale: Locale = "fr",
  cents = false,
): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents ? 2 : Number.isInteger(value) && !cents ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

const parseDate = (value: string | Date): Date => {
  if (typeof value === "string") {
    const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnly) {
      return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
    }
  }
  return new Date(value);
};

export function formatShortDate(value: string | Date, locale: Locale = "fr"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parseDate(value));
}

export function formatDateTime(value: string | Date, locale: Locale = "fr"): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parseDate(value));
}

/** Localized `<html lang>` + OpenGraph locale pair. */
export const htmlLang: Record<Locale, string> = { fr: "fr", en: "en" };
export const ogLocale: Record<Locale, string> = { fr: "fr_FR", en: "en_GB" };
