import Link from "next/link";

/**
 * Rouillard Sport lockup: gold speed chevron with a chequered-flag corner,
 * set against a typographic wordmark. Drawn in the display face so the
 * identity scales crisply and never depends on a raster asset.
 */
export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      <rect width="64" height="64" fill="#08090a" />
      <g fill="#f2f3f4">
        <rect x="32" y="0" width="16" height="16" />
        <rect x="48" y="16" width="16" height="16" />
      </g>
      <path
        d="M11 13 L35 32 L11 51"
        fill="none"
        stroke="#c9a227"
        strokeWidth="9"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export function Logo({
  href = "/",
  size = 34,
  label,
  showWordmark = true,
  className = "",
}: {
  href?: string | null;
  size?: number;
  label: string;
  showWordmark?: boolean;
  className?: string;
}) {
  const inner = (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/full-logo.png"
        alt={label || "Rouillard Sport"}
        className="h-8 w-auto sm:h-9"
        loading="lazy"
      />
    </span>
  );

  if (!href) return inner;

  return (
    <Link href={href} aria-label={label} className="group inline-flex">
      {inner}
    </Link>
  );
}
