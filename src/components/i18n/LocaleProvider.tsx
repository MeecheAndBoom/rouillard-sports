"use client";

import { createContext, useContext, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_LABELS,
  type Locale,
} from "@/lib/i18n/config";
import { dictionaries, type Dictionary } from "@/lib/i18n/dictionaries";

type LocaleContextValue = {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  t: dictionaries[DEFAULT_LOCALE],
  setLocale: () => {},
});

/**
 * Provides the active locale + dictionary to client components and exposes
 * the switcher. Switching writes the cookie for a year and refreshes the
 * router so server components re-render in the new language — no route
 * change, no lost scroll position.
 */
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function setLocale(next: Locale) {
    if (next === locale) return;
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${maxAge}; samesite=lax`;
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <LocaleContext.Provider
      value={{ locale, t: dictionaries[locale], setLocale }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

/** Current locale + dictionary for client components (Nav, forms, cart…). */
export function useLocale() {
  return useContext(LocaleContext);
}

export { LOCALES, LOCALE_LABELS };
export type { Locale };
