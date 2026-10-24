"use client";

import { useEffect, useState } from "react";

/**
 * Product image stage with a thumbnail rail. Thumbnails scroll horizontally
 * on mobile so the stage size never shifts.
 */
export function Gallery({
  images,
  alt,
  badge,
  autoRotate = false,
  intervalMs = 3500,
}: {
  images: string[];
  alt: string;
  badge?: React.ReactNode;
  autoRotate?: boolean;
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const list = images.length ? images : ["/images/placeholder.jpg"];
  const current = list[Math.min(index, list.length - 1)];

  useEffect(() => {
    if (!autoRotate || list.length < 2 || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [autoRotate, intervalMs, list.length, paused]);

  return (
    <div
      className="flex flex-col gap-2.5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative overflow-hidden border border-line bg-panel-2">
        <div className="aspect-[4/3] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={current} src={current} alt={alt} className="h-full w-full object-cover" />
        </div>
        {badge ? <span className="absolute top-4 left-4">{badge}</span> : null}
        <span
          aria-hidden="true"
          className="absolute right-0 bottom-0 h-10 w-10 bg-[linear-gradient(135deg,transparent_49%,rgba(201,162,39,0.9)_50%,rgba(201,162,39,0.9)_53%,transparent_54%)]"
        />
      </div>

      {list.length > 1 ? (
        <div role="group" aria-label={alt} className="rail flex gap-2 overflow-x-auto pb-1">
          {list.map((image, i) => (
            <button
              key={image + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-current={i === index ? "true" : undefined}
              className={`relative h-16 w-16 shrink-0 overflow-hidden border transition-all duration-150 sm:h-20 sm:w-20 ${
                i === index
                  ? "border-gold opacity-100"
                  : "border-line opacity-55 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
