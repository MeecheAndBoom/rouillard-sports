"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { money } from "@/lib/format";
import type { SearchHit, SearchResponse } from "@/app/api/search/route";

/**
 * Site-wide type-ahead search. Self-contained: owns its trigger button, its
 * overlay and the Cmd/Ctrl-K + "/" shortcuts, and navigates to the hit on
 * Enter or tap. Results stream from /api/search.
 */
export function SearchDialog({ className = "" }: { className?: string }) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{ q: string; hits: SearchHit[] }>({
    q: "",
    hits: [],
  });
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const reqRef = useRef(0);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 40);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) return;
    const id = ++reqRef.current;
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as SearchResponse;
        if (id !== reqRef.current) return;
        setResult({ q, hits: data.hits });
        setActive(0);
      } catch {
        if (id === reqRef.current) setResult({ q, hits: [] });
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [query, open]);

  const q = query.trim();
  const hits = useMemo(() => (result.q === q ? result.hits : []), [result, q]);
  const loading = q.length >= 2 && result.q !== q;
  const parts = useMemo(() => hits.filter((h) => h.type === "part"), [hits]);
  const posts = useMemo(() => hits.filter((h) => h.type === "post"), [hits]);
  const flat = useMemo(() => [...parts, ...posts], [parts, posts]);

  function go(hit: SearchHit) {
    close();
    setQuery("");
    router.push(hit.type === "part" ? `/shop/${hit.slug}` : `/blog/${hit.slug}`);
  }

  function seeAll() {
    const q = query.trim();
    close();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(flat.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flat[active]) go(flat[active]);
      else seeAll();
    }
  }

  const label = (hit: SearchHit) =>
    locale === "en" && hit.titleEn ? hit.titleEn : hit.title;

  const row = (hit: SearchHit, i: number) => (
    <li key={`${hit.type}-${hit.slug}`}>
      <button
        type="button"
        onMouseEnter={() => setActive(i)}
        onClick={() => go(hit)}
        className={`flex w-full items-center gap-3.5 px-3 py-2.5 text-left transition-colors ${
          active === i ? "bg-panel-2" : "hover:bg-panel-2"
        }`}
      >
        <span className="h-11 w-11 shrink-0 overflow-hidden border border-line bg-panel-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hit.image} alt="" className="h-full w-full object-cover" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-[15px] leading-tight text-white">
            {label(hit)}
          </span>
          <span className="mt-0.5 block truncate font-mono-num text-[10.5px] tracking-[0.04em] text-muted-dim">
            {hit.meta}
          </span>
        </span>
        {hit.type === "part" && typeof hit.price === "number" ? (
          <span className="shrink-0 font-mono-num text-[13px] font-bold text-white">
            {money(hit.price, locale)}
          </span>
        ) : null}
      </button>
    </li>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.search.open}
        className={`grid h-9 w-9 place-items-center border border-transparent text-paper transition-all duration-150 hover:border-line hover:text-gold-light active:scale-95 ${className}`}
      >
        <i className="fa-solid fa-magnifying-glass text-[15px]" aria-hidden="true" />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[10vh] sm:pt-[13vh]"
          role="dialog"
          aria-modal="true"
          aria-label={t.search.open}
        >
          <div
            role="presentation"
            onClick={close}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="page-enter relative w-full max-w-[640px] border border-line bg-pit shadow-[0_40px_90px_-30px_rgba(0,0,0,0.95)]">
            <div aria-hidden="true" className="flag-band-sm h-[4px] w-full" />
            <div className="flex items-center gap-3 border-b border-line px-4">
              <i
                className={`fa-solid ${loading ? "fa-circle-notch animate-spin" : "fa-magnifying-glass"} text-[13px] text-gold`}
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                type="text"
                role="combobox"
                aria-expanded={flat.length > 0}
                aria-controls="search-results"
                aria-autocomplete="list"
                placeholder={t.search.placeholder}
                className="h-14 flex-1 bg-transparent text-[16px] text-paper outline-none placeholder:text-muted-dim"
              />
              <button
                type="button"
                onClick={close}
                aria-label={t.search.close}
                className="grid h-7 w-7 shrink-0 place-items-center border border-line text-muted transition-colors hover:border-gold hover:text-gold-light"
              >
                <i className="fa-solid fa-xmark text-[12px]" aria-hidden="true" />
              </button>
            </div>

            <div id="search-results" role="listbox" className="max-h-[54vh] overflow-y-auto px-2 py-2">
              {q.length < 2 ? (
                <p className="px-4 py-10 text-center text-[14px] text-muted-dim">
                  {t.search.idle}
                </p>
              ) : flat.length === 0 ? (
                <p className="px-4 py-10 text-center text-[14px] text-muted-dim">
                  {loading ? t.search.loading : t.search.noResults.replace("{q}", q)}
                </p>
              ) : (
                <>
                  {parts.length ? (
                    <>
                      <p className="px-3 pt-2 pb-1 font-display text-[11px] uppercase tracking-[0.16em] text-gold">
                        {t.search.parts}
                      </p>
                      <ul>{parts.map((hit, i) => row(hit, i))}</ul>
                    </>
                  ) : null}
                  {posts.length ? (
                    <>
                      <p className="px-3 pt-3 pb-1 font-display text-[11px] uppercase tracking-[0.16em] text-gold">
                        {t.search.posts}
                      </p>
                      <ul>{posts.map((hit, i) => row(hit, parts.length + i))}</ul>
                    </>
                  ) : null}
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-line bg-asphalt px-4 py-2.5">
              <span className="font-mono-num text-[10.5px] tracking-[0.04em] text-muted-dim">
                {t.search.hint}
              </span>
              {q.length >= 2 ? (
                <button
                  type="button"
                  onClick={seeAll}
                  className="flex items-center gap-1.5 font-display text-[11px] uppercase tracking-[0.14em] text-gold transition-colors hover:text-gold-light"
                >
                  {t.search.seeAll}
                  <i className="fa-solid fa-arrow-right text-[9px]" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
