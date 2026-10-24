"use client";

import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";

/** One-tap clipboard copy with a 1.6s confirmation state. */
export function CopyButton({ value, label }: { value: string; label?: string }) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const text = label ?? t.common.copy;

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard unavailable: text stays selectable */
        }
      }}
      className="btn btn-ghost btn-sm"
      aria-label={`${text}: ${value}`}
    >
      <i
        className={`fa-solid ${copied ? "fa-check text-success" : "fa-copy text-gold"} text-[11px]`}
        aria-hidden="true"
      />
      <span className={copied ? "text-success" : undefined}>
        {copied ? t.common.copied : text}
      </span>
    </button>
  );
}
