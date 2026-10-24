"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Route transition veil — a soft fade on navigation, kept under 260ms so it
 * reads as feedback rather than a wait. Fully bypassed under
 * prefers-reduced-motion (mirrors the reference's PageFade).
 */
export function PageFade() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    // Kick off one frame later so React sees the visible state as a change.
    const raf = requestAnimationFrame(() => setVisible(true));
    const timer = window.setTimeout(() => setVisible(false), 220);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[80] bg-pit transition-opacity duration-[200ms] ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
