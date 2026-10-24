"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { Accordion } from "@/components/ui/Accordion";

export type FaqGroup = { key: string; label: string; items: { q: string; a: string }[] };

/**
 * Help-centre explorer: instant client-side search across every answer, with
 * category chips. Falls back to the full list while the query is short.
 */
export function FaqExplorer({ groups }: { groups: FaqGroup[] }) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .filter((g) => !active || g.key === active)
      .map((g) => ({
        ...g,
        items: q
          ? g.items.filter(
              (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
            )
          : g.items,
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query, active]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <label htmlFor="faq-search" className="sr-only">
          {t.help.searchPlaceholder}
        </label>
        <div className="relative">
          <i
            className="fa-solid fa-magnifying-glass pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[13px] text-gold"
            aria-hidden="true"
          />
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.help.searchPlaceholder}
            className="field pl-10"
          />
        </div>

        <div className="rail flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActive("")}
            aria-pressed={active === ""}
            className={`btn btn-sm shrink-0 ${active === "" ? "btn-primary" : "btn-dark"}`}
          >
            {t.common.all}
          </button>
          {groups.map((group) => (
            <button
              key={group.key}
              type="button"
              onClick={() => setActive(active === group.key ? "" : group.key)}
              aria-pressed={active === group.key}
              className={`btn btn-sm shrink-0 ${
                active === group.key ? "btn-primary" : "btn-dark"
              }`}
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-line bg-panel px-6 py-14 text-center">
          <p className="text-[15px] text-paper">{t.help.noResults}</p>
          <p className="mt-2 text-[14px] text-muted">{t.help.contactLead}</p>
          <a href="/contact" className="btn btn-primary btn-sm mt-5">
            <i className="fa-solid fa-paper-plane text-[11px]" aria-hidden="true" />
            <span>{t.common.contactUs}</span>
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {filtered.map((group) => (
            <section key={group.key} id={`faq-${group.key}`} className="scroll-mt-28">
              <div className="mb-4 flex items-center gap-4">
                <h2 className="font-display text-[24px] leading-none text-white">
                  {group.label}
                </h2>
                <span aria-hidden="true" className="h-[1px] flex-1 bg-line" />
                <span className="font-mono-num text-[11px] text-muted-dim">
                  {String(group.items.length).padStart(2, "0")}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <Accordion key={item.q} question={item.q}>
                    <p>{item.a}</p>
                  </Accordion>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
