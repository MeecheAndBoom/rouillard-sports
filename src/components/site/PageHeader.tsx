import Link from "next/link";
import { HeroBackground } from "@/components/site/HeroBackground";

/**
 * Page masthead: a pit-lane banner. Gold livery bar on the left of the
 * statement, technical grid behind it, chequered strip at the foot. No
 * eyebrow label above the heading.
 */
export function PageHeader({
  title,
  lead,
  children,
  image,
  imageSrc,
}: {
  title: string;
  lead?: string;
  children?: React.ReactNode;
  image?: string;
  imageSrc?: string;
}) {
  const bgSrc = imageSrc || image;

  return (
    <header className="on-dark relative overflow-hidden border-b border-line bg-pit">
      {bgSrc ? <HeroBackground src={bgSrc} /> : null}
      {!bgSrc ? (
        <>
          <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-70" />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-[120px] bg-gradient-to-r from-pit to-transparent"
          />
          <div
            aria-hidden="true"
            className="livery absolute top-0 bottom-0 left-0 w-[3px]"
          />
        </>
      ) : null}

      <div className="section page-enter relative pt-24 pb-14 sm:pt-32 sm:pb-20">
        <h1 className="max-w-[920px] font-display text-[44px] leading-[0.92] text-white sm:text-[74px] lg:text-[86px]">
          {title}
        </h1>
        {lead ? (
          <p className="mt-6 max-w-[660px] text-[16.5px] leading-[1.7] text-muted sm:text-[18px]">
            {lead}
          </p>
        ) : null}
        {children ? <div className="mt-9 flex flex-wrap gap-3">{children}</div> : null}
      </div>
      {!bgSrc ? (
        <div aria-hidden="true" className="flag-band-sm h-[6px] w-full opacity-60" />
      ) : null}
    </header>
  );
}

/** Breadcrumb rail under the header: mono, hairline separators. */
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="section flex flex-wrap items-center gap-2 pt-6 font-mono-num text-[11px] tracking-[0.04em] text-muted-dim"
    >
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-2">
          {i > 0 ? (
            <span aria-hidden="true" className="text-line">
              /
            </span>
          ) : null}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-gold-light">
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="text-muted">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
