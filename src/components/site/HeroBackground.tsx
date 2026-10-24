"use client";

/** Hero background: a single race image with a slow drift and a gold sheen. */
const HERO_IMAGE = "/images/editorial/hero-1.jpg";

export function HeroBackground({ src = HERO_IMAGE }: { src?: string }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="hero-drift absolute inset-0 h-full w-full object-cover"
        loading="eager"
        decoding="async"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,10,0.97)_0%,rgba(8,9,10,0.86)_42%,rgba(8,9,10,0.42)_72%,rgba(8,9,10,0.2)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,10,0.55)_0%,transparent_30%,rgba(8,9,10,0.35)_70%,rgba(8,9,10,1)_100%)]" />
      <div className="absolute inset-y-0 left-0 w-[45%] speed-stripes opacity-60" />
      <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-gold" />
    </div>
  );
}
