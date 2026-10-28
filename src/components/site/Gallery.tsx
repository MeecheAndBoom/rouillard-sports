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
  autoRotate = true,
  intervalMs = 2500,
}: {
  images: string[];
  alt: string;
  badge?: React.ReactNode;
  autoRotate?: boolean;
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const list = images.length ? images : ["/images/placeholder.jpg"];
  const current = list[Math.min(index, list.length - 1)];

  useEffect(() => {
    if (!autoRotate || list.length < 2 || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [autoRotate, intervalMs, list.length, paused]);

  useEffect(() => {
    if (list.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % list.length);
    }, 2500);
    return () => window.clearInterval(id);
  }, [list.length]);

  useEffect(() => {
    if (!fullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowRight" && list.length > 1) setIndex((i) => (i + 1) % list.length);
      if (e.key === "ArrowLeft" && list.length > 1) setIndex((i) => (i - 1 + list.length) % list.length);
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [fullscreen, list.length]);

  return (
    <>
      <div
        className="flex flex-col gap-2.5"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className="relative overflow-hidden border border-line bg-panel-2">
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="group relative block aspect-[4/3] w-full"
            aria-label="View full screen"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={current} src={current} alt={alt} className="h-full w-full object-cover" />
            <span className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-pit/80 px-2 py-1 font-mono-num text-[9px] uppercase tracking-[0.12em] text-paper opacity-0 transition-opacity group-hover:opacity-100">
              <i className="fa-solid fa-expand" aria-hidden="true" /> Full screen
            </span>
          </button>
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

      {fullscreen ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
          onClick={() => setFullscreen(false)}
        >
          <button
            type="button"
            onClick={() => setFullscreen(false)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center border border-line text-paper transition-colors hover:border-gold hover:text-gold"
            aria-label="Close full screen"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
          {list.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i - 1 + list.length) % list.length);
                }}
                className="absolute left-4 flex h-12 w-12 items-center justify-center border border-line bg-pit/60 text-paper transition-colors hover:border-gold hover:text-gold"
                aria-label="Previous image"
              >
                <i className="fa-solid fa-chevron-left" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((i) => (i + 1) % list.length);
                }}
                className="absolute right-4 flex h-12 w-12 items-center justify-center border border-line bg-pit/60 text-paper transition-colors hover:border-gold hover:text-gold"
                aria-label="Next image"
              >
                <i className="fa-solid fa-chevron-right" aria-hidden="true" />
              </button>
            </>
          ) : null}
          <div className="max-h-[90vh] max-w-[95vw] p-4" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current} alt={alt} className="max-h-[88vh] max-w-[93vw] object-contain" />
          </div>
          {list.length > 1 ? (
            <div className="absolute bottom-4 flex gap-1.5">
              {list.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(i);
                  }}
                  className={`h-1.5 w-6 transition-colors ${i === index ? "bg-gold" : "bg-line"}`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
