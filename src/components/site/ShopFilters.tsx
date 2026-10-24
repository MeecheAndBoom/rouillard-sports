"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { ShopViewToggle } from "@/components/ui/ShopResults";
import { PART_CONDITIONS } from "@/lib/constants";

type Facets = {
  makes: string[];
  models: string[];
  brands: string[];
  categories: string[];
};

const CHEVRON =
  "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23c9a227%22 stroke-width=%222%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-[length:13px] bg-[right_0.8rem_center] bg-no-repeat";

const selectBase = `${CHEVRON} field cursor-pointer appearance-none pr-9 text-[14px]`;

/**
 * Catalogue control bar. Every change writes straight to the query string
 * (the server re-filters), so a filtered view stays linkable and
 * back/forward keeps working. On mobile the facet grid collapses behind a
 * disclosure instead of a modal.
 */
export function ShopFilters({ facets }: { facets: Facets }) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(params.get("q") ?? "");

  useEffect(() => {
    const raf = requestAnimationFrame(() => setQuery(params.get("q") ?? ""));
    return () => cancelAnimationFrame(raf);
  }, [params]);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function clear() {
    setQuery("");
    router.replace(pathname, { scroll: false });
  }

  const sort = params.get("sort") ?? "";
  const activeCount = [...params.keys()].filter((k) => k !== "sort").length;

  const chips: { key: string; value: string; label: string }[] = [];
  const addChip = (key: string, value: string, label: string) => {
    if (value) chips.push({ key, value, label });
  };
  addChip("make", params.get("make") ?? "", params.get("make") ?? "");
  addChip("brand", params.get("brand") ?? "", params.get("brand") ?? "");
  addChip("category", params.get("category") ?? "", params.get("category") ?? "");
  addChip("condition", params.get("condition") ?? "", params.get("condition") ?? "");
  addChip("q", params.get("q") ?? "", params.get("q") ?? "");
  const min = params.get("min") ?? "";
  const max = params.get("max") ?? "";
  if (min || max) {
    chips.push({
      key: "price",
      value: "price",
      label: `${t.shop.filterPrice} ${min || "0"} - ${max || "∞"}`,
    });
  }
  if (params.get("stock") === "1") {
    chips.push({ key: "stock", value: "1", label: t.shop.filterInStock });
  }

  const facetGrid = (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="f-make" className="field-label">
            {t.shop.filterMake}
          </label>
          <select
            id="f-make"
            className={selectBase}
            value={params.get("make") ?? ""}
            onChange={(e) => update("make", e.target.value)}
          >
            <option value="">{t.common.all}</option>
            {facets.makes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-brand" className="field-label">
            {t.shop.filterBrand}
          </label>
          <select
            id="f-brand"
            className={selectBase}
            value={params.get("brand") ?? ""}
            onChange={(e) => update("brand", e.target.value)}
          >
            <option value="">{t.common.all}</option>
            {facets.brands.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-category" className="field-label">
            {t.shop.filterCategory}
          </label>
          <select
            id="f-category"
            className={selectBase}
            value={params.get("category") ?? ""}
            onChange={(e) => update("category", e.target.value)}
          >
            <option value="">{t.common.all}</option>
            {facets.categories.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-condition" className="field-label">
            {t.shop.filterCondition}
          </label>
          <select
            id="f-condition"
            className={selectBase}
            value={params.get("condition") ?? ""}
            onChange={(e) => update("condition", e.target.value)}
          >
            <option value="">{t.common.all}</option>
            {PART_CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {t.shop.conditions[c]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="f-min" className="field-label">
            {t.shop.filterPrice} / {t.shop.priceMin}
          </label>
          <input
            id="f-min"
            type="number"
            min={0}
            inputMode="numeric"
            defaultValue={min}
            onBlur={(e) => update("min", e.target.value)}
            className="field font-mono-num text-[14px]"
            placeholder="0"
          />
        </div>
        <div>
          <label htmlFor="f-max" className="field-label">
            {t.shop.filterPrice} / {t.shop.priceMax}
          </label>
          <input
            id="f-max"
            type="number"
            min={0}
            inputMode="numeric"
            defaultValue={max}
            onBlur={(e) => update("max", e.target.value)}
            className="field font-mono-num text-[14px]"
            placeholder="500"
          />
        </div>
        <div className="flex items-end">
          <label className="flex w-full cursor-pointer items-center gap-3 border border-line bg-pit px-3.5 py-3 text-[13.5px] text-paper transition-colors hover:border-gold/50">
            <input
              type="checkbox"
              checked={params.get("stock") === "1"}
              onChange={(e) => update("stock", e.target.checked ? "1" : "")}
              className="h-4 w-4 accent-[#c9a227]"
            />
            {t.shop.filterInStock}
          </label>
        </div>
      </div>
    </>
  );

  return (
    <div className="border border-line bg-panel">
      <div aria-hidden="true" className="flag-band-sm h-[4px] w-full" />

      {/* Command row: search, sort, view */}
      <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-end sm:p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            update("q", query.trim());
          }}
          className="flex flex-1 gap-2"
        >
          <label htmlFor="shop-q" className="sr-only">
            {t.common.search}
          </label>
          <div className="relative flex-1">
            <i
              className="fa-solid fa-magnifying-glass pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[12px] text-gold"
              aria-hidden="true"
            />
            <input
              id="shop-q"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.common.searchPlaceholder}
              className="field pl-10 text-[14px]"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm shrink-0" aria-label={t.common.search}>
            <i className="fa-solid fa-arrow-right text-[11px]" aria-hidden="true" />
          </button>
        </form>

        <div className="flex items-end gap-3">
          <div className="min-w-[170px] flex-1 sm:flex-none">
            <label htmlFor="f-sort" className="field-label">
              {t.shop.sort}
            </label>
            <select
              id="f-sort"
              className={selectBase}
              value={sort}
              onChange={(e) => update("sort", e.target.value)}
            >
              <option value="">{t.shop.sortFeatured}</option>
              <option value="price-asc">{t.shop.sortPriceAsc}</option>
              <option value="price-desc">{t.shop.sortPriceDesc}</option>
              <option value="newest">{t.shop.sortNewest}</option>
              <option value="name">{t.shop.sortName}</option>
            </select>
          </div>
          <ShopViewToggle />
        </div>
      </div>

      {/* Facets */}
      <div className="hidden p-5 sm:block">{facetGrid}</div>

      {/* Mobile disclosure */}
      <div className="border-t border-line sm:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
        >
          <span className="flex items-center gap-2.5 font-display text-[13px] uppercase tracking-[0.14em] text-white">
            <i className="fa-solid fa-sliders text-[12px] text-gold" aria-hidden="true" />
            {t.shop.filters}
            {activeCount ? (
              <span className="font-mono-num text-[11px] text-gold">({activeCount})</span>
            ) : null}
          </span>
          <i
            className={`fa-solid fa-chevron-down text-[11px] text-muted transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>
        {open ? <div className="flex flex-col gap-4 px-4 pb-5">{facetGrid}</div> : null}
      </div>

      {/* Active filter chips */}
      {chips.length ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-line bg-asphalt px-4 py-3 sm:px-5">
          <span className="font-mono-num text-[10px] uppercase tracking-[0.14em] text-muted-dim">
            {t.shop.filters}
          </span>
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => update(chip.key, "")}
              className="flex items-center gap-2 border border-line bg-pit px-2.5 py-1 text-[12px] text-paper transition-colors hover:border-gold/60"
            >
              <span className="max-w-[190px] truncate">{chip.label}</span>
              <i className="fa-solid fa-xmark text-[9px] text-muted" aria-hidden="true" />
            </button>
          ))}
          <button
            type="button"
            onClick={clear}
            className="ml-auto text-[12px] text-gold transition-colors hover:text-gold-light"
          >
            {t.common.clearFilters}
          </button>
        </div>
      ) : null}
    </div>
  );
}
