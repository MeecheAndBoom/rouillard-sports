import Link from "next/link";
import { dictFor, getLocale } from "@/lib/i18n/server";

const SUGGESTIONS = [
  { href: "/shop", icon: "fa-bag-shopping" },
  { href: "/blog", icon: "fa-newspaper" },
  { href: "/guides", icon: "fa-book-open" },
  { href: "/contact", icon: "fa-paper-plane" },
] as const;

export default async function NotFound() {
  const locale = await getLocale();
  const t = dictFor(locale);

  return (
    <main id="main" className="relative overflow-hidden bg-pit">
      <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-70" />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[120px] bg-gradient-to-r from-asphalt to-transparent"
      />
      <div aria-hidden="true" className="livery absolute top-0 bottom-0 left-0 w-[3px]" />

      <div className="section relative py-16 sm:py-24">
        <div className="page-enter max-w-[720px]">
          <div className="flex items-end gap-5">
            <span className="font-mono-num text-[76px] leading-[0.8] font-bold text-gold sm:text-[116px]">
              404
            </span>
            <span
              aria-hidden="true"
              className="mb-2 h-[2px] flex-1 bg-line"
            />
          </div>

          <h1 className="mt-8 font-display text-[34px] leading-[0.98] text-white sm:text-[50px]">
            {t.notFound.title}
          </h1>
          <p className="mt-5 max-w-[52ch] text-[16.5px] leading-[1.7] text-muted">
            {t.notFound.lead}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/" className="btn btn-primary">
              <i className="fa-solid fa-house text-[12px]" aria-hidden="true" />
              <span>{t.notFound.home}</span>
            </Link>
            <Link href="/shop" className="btn btn-outline">
              <i className="fa-solid fa-bag-shopping text-[12px]" aria-hidden="true" />
              <span>{t.notFound.shop}</span>
            </Link>
          </div>

          <div className="mt-14 border-t border-line pt-8">
            <p className="font-mono-num text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-dim">
              {t.notFound.popular}
            </p>
            <ul className="mt-5 grid gap-px bg-line sm:grid-cols-2">
              {SUGGESTIONS.map((item) => (
                <li key={item.href} className="bg-pit">
                  <Link
                    href={item.href}
                    className="group flex items-center justify-between gap-4 border border-line bg-panel px-5 py-4 transition-colors duration-200 hover:border-gold/60"
                  >
                    <span className="flex items-center gap-3 text-[14.5px] text-paper">
                      <i className={`fa-solid ${item.icon} text-[12px] text-gold`} aria-hidden="true" />
                      {item.href.replace("/", "") || "home"}
                    </span>
                    <i
                      className="fa-solid fa-arrow-right text-[11px] text-muted-dim transition-all duration-200 group-hover:translate-x-1 group-hover:text-gold"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="flag-band-sm h-[6px] w-full opacity-60" />
    </main>
  );
}
