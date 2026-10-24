"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Thin indeterminate progress line under the nav during route changes —
 * app-style feedback that never blocks the page. Disabled for reduced motion.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Activate one frame later so the CSS animation starts from a real state
    // change; the keyed inner element replays the bar on every navigation.
    const raf = requestAnimationFrame(() => setActive(true));
    const timer = window.setTimeout(() => setActive(false), 440);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-x-0 top-0 z-[90] h-[2px] overflow-hidden transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      <div key={pathname} className="h-full w-full origin-left animate-[routebar_420ms_cubic-bezier(0.22,1,0.36,1)_forwards] bg-gold" />
    </div>
  );
}
