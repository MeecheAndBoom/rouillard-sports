"use client";

import { useSyncExternalStore } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { parseTheme, readThemeRaw, subscribeTheme, toggleTheme } from "@/lib/theme";

/**
 * Dark / light switch. The button shows the theme you would move to: a sun in
 * dark mode, a moon in light mode. Square, hairline, gold on hover, matching
 * the rest of the nav controls.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { t } = useLocale();
  const raw = useSyncExternalStore(subscribeTheme, readThemeRaw, () => null);
  const theme = parseTheme(raw) ?? "dark";
  const next = theme === "dark" ? "light" : "dark";
  const label = next === "light" ? t.theme.toLight : t.theme.toDark;

  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center border border-transparent text-paper transition-all duration-150 hover:border-line hover:text-gold-light active:scale-95 ${className}`}
    >
      <i
        className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"} text-[14px]`}
        aria-hidden="true"
      />
    </button>
  );
}
