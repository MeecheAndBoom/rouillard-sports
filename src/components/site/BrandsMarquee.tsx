import type { CSSProperties } from "react";

/**
 * Brand logo marquee: sponsor-board trust band. Logos render as white
 * silhouettes on the dark surface, separated by hairlines. Pure CSS loop,
 * pauses on hover, static under reduced motion.
 */
const BRANDS = [
  { name: "Brembo", image: "/images/brands/brembo.webp" },
  { name: "Bosch", image: "/images/brands/Bosch_logo.png" },
  { name: "Sachs", image: "/images/brands/Sachs-Logo.png" },
  { name: "LuK", image: "/images/brands/luk.svg" },
  { name: "Valeo", image: "/images/brands/valeo.svg" },
  { name: "SKF", image: "/images/brands/skf.jpeg" },
  { name: "NGK", image: "/images/brands/ngk.jpeg" },
  { name: "Mann-Filter", image: "/images/brands/mann-filter.png" },
  { name: "Febi Bilstein", image: "/images/brands/febi-bilstein.jpeg" },
  { name: "TRW", image: "/images/brands/trw.png" },
  { name: "Denso", image: "/images/brands/denso.png" },
  { name: "Hella", image: "/images/brands/Hella.jpeg" },
  { name: "ATE", image: "/images/brands/ATE.png" },
  { name: "Continental", image: "/images/brands/Continental.png" },
];

export function BrandsMarquee() {
  const track = (clone: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={clone ? "true" : undefined}>
      {BRANDS.map((brand) => (
        <li
          key={`${brand.name}-${clone ? "b" : "a"}`}
          className="flex items-center border-r border-line"
        >
          <div className="flex h-16 items-center px-7 sm:h-20 sm:px-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.image}
              alt=""
              aria-hidden="true"
              className="h-6 max-h-6 w-auto object-contain opacity-45 transition-opacity duration-300 hover:opacity-90 sm:h-7 sm:max-h-7"
              style={{ filter: "grayscale(1) brightness(0) invert(1)" }}
              loading="lazy"
            />
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee">
      <div className="marquee-group flex" style={{ "--marquee-duration": "52s" } as CSSProperties}>
        {track(false)}
        {track(true)}
      </div>
    </div>
  );
}
