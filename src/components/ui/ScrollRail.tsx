"use client";

import { useRef } from "react";

/**
 * Horizontal scroll-snap rail with square arrow controls. Native touch scroll
 * on mobile; arrows are pointer-only and respect reduced motion.
 */
export function ScrollRail({
  children,
  label,
  prevLabel,
  nextLabel,
}: {
  children: React.ReactNode;
  label: string;
  prevLabel: string;
  nextLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: dir * Math.min(el.clientWidth * 0.85, 720),
      behavior: reduce ? "auto" : "smooth",
    });
  };

  const arrowBtn = (dir: 1 | -1, label: string) => (
    <button
      type="button"
      onClick={() => scrollBy(dir)}
      aria-label={label}
      className="grid h-10 w-10 place-items-center border border-line bg-panel text-[13px] text-paper transition-all duration-200 hover:border-gold hover:text-gold-light active:scale-95"
    >
      <i
        className={`fa-solid ${dir === 1 ? "fa-arrow-right" : "fa-arrow-left"}`}
        aria-hidden="true"
      />
    </button>
  );

  return (
    <div className="group/rail relative">
      <div ref={ref} role="region" aria-label={label} className="rail">
        {children}
      </div>
      <div className="mt-4 hidden justify-end gap-2 sm:flex">
        {arrowBtn(-1, prevLabel)}
        {arrowBtn(1, nextLabel)}
      </div>
    </div>
  );
}
