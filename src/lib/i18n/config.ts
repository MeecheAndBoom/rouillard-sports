/**
 * Bilingual (FR/EN) runtime configuration.
 *
 * The locale lives in a cookie (`rs-locale`) with `fr` as the default, so the
 * site keeps the reference project's flat route structure — no /fr /en
 * prefixes, no middleware. Server components read it via `getLocale()`;
 * client components receive it through <LocaleProvider>.
 */

export const LOCALES = ["fr", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_COOKIE = "rs-locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
};

export function isLocale(value: unknown): value is Locale {
  return value === "fr" || value === "en";
}
