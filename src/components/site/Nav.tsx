"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { useCart, cartCount } from "@/store/cart";
import { SearchDialog } from "@/components/site/SearchDialog";
import { CART_OPEN_EVENT } from "@/components/site/CartDrawer";
import { Logo } from "@/components/site/Logo";

const NAV_LINKS = [
  { href: "/", key: "home" },
  { href: "/shop", key: "shop" },
  { href: "/blog", key: "blog" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
  { href: "/track", key: "track" },
] as const;

export function Nav() {
  const { t } = useLocale();
  const pathname = usePathname();
  const lines = useCart((s) => s.lines);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const count = cartCount(lines);

  return (
    <header
      className={`nav-blur fixed inset-x-0 top-0 z-50 border-b transition-colors duration-[240ms] ${
        scrolled || open ? "border-line" : "border-transparent"
      }`}
    >
      <div aria-hidden="true" className="flag-band-sm h-[6px] w-full" />
      <nav
        aria-label="Main"
        className="section flex h-[58px] items-center justify-between gap-6"
      >
        <Logo href="/" size={34} label={t.meta.siteName} />

        <ul className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative font-display text-[12.5px] uppercase tracking-[0.12em] transition-colors duration-150 after:absolute after:-bottom-1.5 after:left-0 after:h-[1px] after:bg-gold after:transition-all after:duration-200 hover:text-gold-light ${
                    active
                      ? "text-gold after:w-full"
                      : "text-paper after:w-0 hover:after:w-full"
                  }`}
                >
                  {t.nav[link.key]}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <LanguageToggle className="hidden sm:flex" />

          <SearchDialog />

          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent(CART_OPEN_EVENT))
            }
            className="relative grid h-9 w-9 place-items-center border border-transparent text-paper transition-all duration-150 hover:border-line hover:text-gold-light active:scale-95"
            aria-label={t.nav.cart}
          >
            <i className="fa-solid fa-bag-shopping text-[15px]" aria-hidden="true" />
            {count > 0 ? (
              <span
                className="absolute -top-1 -right-1 grid h-[16px] min-w-[16px] place-items-center bg-gold px-1 font-mono-num text-[9px] font-bold text-gold-ink"
                aria-hidden="true"
              >
                {count > 9 ? "9+" : count}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid h-9 w-9 place-items-center border border-transparent text-paper transition-all duration-150 hover:border-line hover:text-gold-light active:scale-95 md:hidden"
            aria-label={open ? t.nav.close : t.nav.menu}
          >
            <i
              className={`fa-solid ${open ? "fa-xmark" : "fa-bars"} text-[15px]`}
              aria-hidden="true"
            />
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={`nav-blur overflow-hidden border-b border-line transition-[max-height,opacity] duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
          open ? "max-h-[620px] opacity-100" : "max-h-0 opacity-0 border-b-transparent"
        }`}
      >
        <ul className="section flex flex-col py-4">
          {[...NAV_LINKS, { href: "/help", key: "help" as const }].map((link, i) => (
            <li
              key={link.href}
              className="transition-all duration-300"
              style={{
                transitionDelay: open ? `${40 + i * 30}ms` : "0ms",
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(-6px)",
              }}
            >
              <Link
                href={link.href}
                className="flex items-center justify-between border-b border-line-soft py-3 font-display text-[20px] uppercase tracking-[0.08em] text-paper transition-colors hover:text-gold-light"
              >
                {t.nav[link.key]}
              </Link>
            </li>
          ))}
          <li className="mt-4 flex items-center justify-between">
            <span className="font-display text-[11px] uppercase tracking-[0.16em] text-muted">
              {t.theme.label}
            </span>
            <ThemeToggle />
          </li>
          <li className="mt-2 flex items-center justify-between">
            <span className="font-display text-[11px] uppercase tracking-[0.16em] text-muted">
              {t.nav.language}
            </span>
            <LanguageToggle />
          </li>
        </ul>
      </div>
      <div
        aria-hidden="true"
        className={`h-[1px] w-full transition-opacity duration-[240ms] ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--color-gold) 50%, transparent 100%)",
        }}
      />
    </header>
  );
}
