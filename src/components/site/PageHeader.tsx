import Link from "next/link";

/**
 * Page masthead: a pit-lane banner. Gold livery bar on the left of the
 * statement, technical grid behind it, chequered strip at the foot. No
 * eyebrow label above the heading.
 */
export function PageHeader({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-line bg-asphalt">
      <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-70" />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[120px] bg-gradient-to-r from-pit to-transparent"
      />
      <div
        aria-hidden="true"
        className="livery absolute top-0 bottom-0 left-0 w-[3px]"
      />

      <div className="section page-enter relative pt-8 pb-11 sm:pt-14 sm:pb-16">
        <h1 className="max-w-[920px] font-display text-[38px] leading-[0.94] text-white sm:text-[58px]">
          {title}
        </h1>
        {lead ? (
          <p className="mt-5 max-w-[660px] text-[16.5px] leading-[1.7] text-muted sm:text-[17.5px]">
            {lead}
          </p>
        ) : null}
        {children ? <div className="mt-8 flex flex-wrap gap-3">{children}</div> : null}
      </div>
      <div aria-hidden="true" className="flag-band-sm h-[6px] w-full opacity-60" />
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
