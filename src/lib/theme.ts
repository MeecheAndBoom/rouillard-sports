/**
 * Theme store (dark / light).
 *
 * The site ships dark by default: the pit-lane palette is the identity. The
 * light palette is a full token remap in `globals.css`, so every component
 * flips without knowing the theme exists. The choice lives in localStorage,
 * mirrored into a first-party cookie, and is read through
 * `useSyncExternalStore` rather than copied into component state.
 */

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "rs-theme";
export const THEME_COOKIE = "rs-theme";
export const THEME_EVENT = "rs:theme-change";
export const DEFAULT_THEME: Theme = "dark";

/** Browser chrome colours, also used to keep `<meta name="theme-color">` honest. */
export const THEME_COLORS: Record<Theme, string> = {
  dark: "#08090a",
  light: "#f5f3ee",
};

/** Normalise any stored value; anything unknown means "no choice yet". */
export function parseTheme(value: string | null | undefined): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}

/** Snapshot for the external store: the raw localStorage value, or null. */
export function readThemeRaw(): string | null {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function readTheme(): Theme {
  return parseTheme(readThemeRaw()) ?? readThemeCookie() ?? DEFAULT_THEME;
}

function readThemeCookie(): Theme | null {
  try {
    const match = document.cookie.match(/(?:^|;\s*)rs-theme=(light|dark)/);
    return parseTheme(match?.[1]);
  } catch {
    return null;
  }
}

/** Push the theme onto `<html>` without a reload. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLORS[theme]);

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* private mode: the theme still applies for this visit */
  }
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(THEME_EVENT));
}

export function toggleTheme(): Theme {
  const next: Theme = readTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}

/** Notify subscribers when the theme changes, in this tab or another one. */
export function subscribeTheme(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(THEME_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(THEME_EVENT, onChange);
  };
}

/**
 * Runs in `<head>` before the first paint so a visitor who chose light never
 * sees the dark palette flash. Mirrors `applyTheme` without dispatching.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=null;try{t=localStorage.getItem('rs-theme')}catch(e){}if(t!=='light'&&t!=='dark'){var m=document.cookie.match(/(?:^|;\\s*)rs-theme=(light|dark)/);t=m?m[1]:'dark'}var r=document.documentElement;r.dataset.theme=t;r.style.colorScheme=t;var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',t==='light'?'#f5f3ee':'#08090a')}catch(e){document.documentElement.dataset.theme='dark'}})();`;
