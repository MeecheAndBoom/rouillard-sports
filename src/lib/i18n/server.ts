import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  type Locale,
} from "./config";
import { dictionaries, type Dictionary } from "./dictionaries";

/** Resolves the visitor's locale from the cookie, defaulting to French. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const raw = store.get(LOCALE_COOKIE)?.value;
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

/** The full string dictionary for the active locale. */
export async function getDict(): Promise<Dictionary> {
  const locale = await getLocale();
  return dictionaries[locale];
}

/** Synchronous lookup for server code that already carries the locale. */
export function dictFor(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };
