"use client";

/**
 * Cookie consent store (RGPD/ePrivacy).
 *
 * The choice lives in localStorage and is mirrored into a first-party cookie
 * so the server can read it. Everything is exposed through a tiny external
 * store contract so React can subscribe to it with `useSyncExternalStore`
 * instead of copying state into effects.
 */

export const CONSENT_STORAGE_KEY = "rs-cookie-consent-v1";
export const CONSENT_MANAGE_EVENT = "rs:manage-cookies";
export const CONSENT_SAVED_EVENT = "rs:consent-saved";

export type ConsentCategory = "preferences" | "analytics" | "marketing";

export type Consent = Record<ConsentCategory, boolean> & {
  version: number;
  updatedAt: string;
};

export const EMPTY_CONSENT: Consent = {
  version: 1,
  updatedAt: "",
  preferences: false,
  analytics: false,
  marketing: false,
};

const OPTIONAL_KEYS: ConsentCategory[] = ["preferences", "analytics", "marketing"];

/** Parse the raw localStorage payload, or null when there is no valid one. */
export function parseConsent(raw: string | null): Consent | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Consent>;
    if (typeof parsed !== "object" || parsed === null || parsed.version !== 1) return null;
    return {
      version: 1,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : "",
      preferences: Boolean(parsed.preferences),
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
    };
  } catch {
    return null;
  }
}

/** Snapshot for the external store: the raw string, or null when unset. */
export function readConsentRaw(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Persist the choice and mirror it into a first-party cookie. */
export function writeConsent(value: Omit<Consent, "version" | "updatedAt">): Consent {
  const consent: Consent = {
    ...value,
    version: 1,
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  } catch {
    /* private mode: the choice still applies for this visit */
  }
  const granted = OPTIONAL_KEYS.filter((key) => consent[key]).join(",") || "none";
  document.cookie = `rs-consent=${granted}; path=/; max-age=15552000; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(CONSENT_SAVED_EVENT));
  return consent;
}

/** Notify subscribers when the choice changes, in this tab or another one. */
export function subscribeConsent(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === CONSENT_STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CONSENT_SAVED_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CONSENT_SAVED_EVENT, onChange);
  };
}

/** Subscribe to the "manage cookies" request coming from the footer. */
export function subscribeManageRequest(onRequest: () => void): () => void {
  window.addEventListener(CONSENT_MANAGE_EVENT, onRequest);
  return () => window.removeEventListener(CONSENT_MANAGE_EVENT, onRequest);
}
