"use client";

import { useId, useState } from "react";

/**
 * Disclosure row used across FAQ, legal and specification sections. Height
 * animates through grid-template-rows; the marker is a square plus/minus.
 */
export function Accordion({
  question,
  children,
  defaultOpen = false,
}: {
  question: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div
      className={`border border-line bg-panel transition-colors duration-200 ${
        open ? "border-gold/50" : "hover:border-line/80"
      }`}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full cursor-pointer items-center justify-between gap-6 px-5 py-5 text-left"
      >
        <span
          className={`font-display text-[17px] leading-[1.15] tracking-[0.01em] transition-colors duration-150 sm:text-[19px] ${
            open ? "text-gold-light" : "text-white group-hover:text-gold-light"
          }`}
        >
          {question}
        </span>
        <span
          aria-hidden="true"
          className={`relative grid h-7 w-7 shrink-0 place-items-center border transition-colors duration-200 ${
            open ? "border-gold bg-gold text-gold-ink" : "border-line text-gold"
          }`}
        >
          <span className="absolute h-[1.5px] w-3 bg-current" />
          <span
            className={`absolute h-[1.5px] w-3 bg-current transition-transform duration-200 ${
              open ? "rotate-0 scale-x-0" : "rotate-90"
            }`}
          />
        </span>
      </button>
      <div
        id={id}
        role="region"
        className={`grid transition-[grid-template-rows,opacity] duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-line-soft px-5 pt-4 pb-6 pr-10 text-[15px] leading-[1.7] text-muted">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
