"use client";

import { useLocale } from "./LocaleProvider";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/config";

/**
 * Square FR / EN switch. The active locale is a gold block; the inactive one
 * is a hairline. Motion is a 200ms border/colour swap, no sliding thumb.
 */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <div
      role="group"
      aria-label="Langue / Language"
      className={`flex items-stretch border border-line select-none ${className}`}
    >
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={active}
            onClick={() => setLocale(code)}
            className={`h-7 min-w-[34px] px-2 font-mono-num text-[10px] font-bold tracking-[0.1em] transition-colors duration-150 ${
              active
                ? "bg-gold text-gold-ink"
                : "text-muted hover:bg-panel-2 hover:text-paper"
            }`}
          >
            {LOCALE_LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
