import Link from "next/link";

/** Page title row shared by every admin screen. */
export function AdminHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div className="min-w-0">
        <h1 className="font-display text-[30px] leading-none text-white sm:text-[38px]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 max-w-[62ch] text-[14.5px] leading-[1.7] text-muted">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex flex-wrap items-center gap-2.5">{action}</div> : null}
    </div>
  );
}

/** Headline metric tile: a telemetry readout, not a lifestyle card. */
export function StatCard({
  label,
  value,
  icon,
  tone = "gold",
}: {
  label: string;
  value: string;
  icon: string;
  tone?: "gold" | "success" | "warning" | "danger" | "neutral";
}) {
  const tones = {
    gold: "text-gold",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    neutral: "text-muted",
  } as const;
  return (
    <div className="relative bg-panel p-5">
      <span aria-hidden="true" className="absolute top-0 left-0 h-[2px] w-8 bg-gold" />
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono-num text-[10px] uppercase tracking-[0.16em] text-muted-dim">
          {label}
        </p>
        <i className={`fa-solid ${icon} text-[13px] ${tones[tone]}`} aria-hidden="true" />
      </div>
      <p className="mt-3 font-mono-num text-[26px] leading-none font-bold text-white">
        {value}
      </p>
    </div>
  );
}

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  align?: "left" | "right";
  className?: string;
};

/**
 * Data list that renders as a real table on desktop and as stacked tiles on
 * mobile (no tables on small screens).
 */
export function ResponsiveList<T>({
  rows,
  getKey,
  columns,
  tile,
  empty,
}: {
  rows: T[];
  getKey: (row: T) => string;
  columns: Column<T>[];
  tile: (row: T) => React.ReactNode;
  empty: string;
}) {
  if (!rows.length) {
    return (
      <div className="border border-line bg-panel px-6 py-16 text-center">
        <p className="font-mono-num text-[12px] uppercase tracking-[0.14em] text-muted-dim">
          {empty}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto border border-line bg-panel md:block">
        <table className="w-full border-collapse text-[14.5px]">
          <thead>
            <tr className="border-b border-line">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`bg-asphalt px-5 py-3.5 font-mono-num text-[10px] font-bold uppercase tracking-[0.16em] text-gold ${
                    column.align === "right" ? "text-right" : ""
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={getKey(row)}
                className="border-b border-line-soft transition-colors last:border-0 hover:bg-panel-2"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-5 py-4 align-middle ${
                      column.align === "right" ? "text-right" : ""
                    } ${column.className ?? ""}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile tiles */}
      <ul className="flex flex-col gap-3 md:hidden">
        {rows.map((row) => (
          <li key={getKey(row)}>{tile(row)}</li>
        ))}
      </ul>
    </>
  );
}

/** Square status chip with consistent tones across admin screens. */
export function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "accent";
}) {
  const tones = {
    neutral: "bg-panel-2 text-muted",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
    accent: "bg-gold/10 text-gold",
  } as const;
  return (
    <span
      className={`badge ${tones[tone]} font-mono-num text-[10px] uppercase tracking-[0.1em]`}
    >
      {children}
    </span>
  );
}

/** Back link used at the top of detail screens. */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 font-mono-num text-[11.5px] uppercase tracking-[0.12em] text-gold transition-colors hover:text-gold-light"
    >
      <i className="fa-solid fa-arrow-left text-[10px]" aria-hidden="true" />
      {label}
    </Link>
  );
}
