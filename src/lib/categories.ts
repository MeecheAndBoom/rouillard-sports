import { connectDB, hasDatabase } from "./db";
import { Category } from "./models/Category";
import { readJson, writeJson } from "./fileStore";
import { PART_CATEGORIES } from "./constants";
import type { TaxonomyTile } from "./types";

const COOL_DOWN = 30_000;
let localFallbackUntil = 0;

async function fromDb<T>(query: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  if (hasDatabase() && Date.now() > localFallbackUntil) {
    try {
      await connectDB();
      return await query();
    } catch {
      localFallbackUntil = Date.now() + COOL_DOWN;
    }
  }
  return fallback();
}

const toRecord = (doc: unknown): TaxonomyTile =>
  JSON.parse(JSON.stringify(doc)) as TaxonomyTile;

/**
 * Real photography per part category, shipped with the site so the tiles
 * render identically in production and in the no-database fallback.
 * One still per discipline, taken from `public/images/categories/`.
 */
const CATEGORY_IMAGES: Record<string, string> = {
  Brakes: "/images/categories/brakes-1.jpg",
  Suspension: "/images/categories/suspension-1.jpg",
  Engine: "/images/categories/engine-1.jpg",
  Transmission: "/images/categories/transmission-1.jpg",
  Exhaust: "/images/categories/exhaust-1.jpg",
  Aero: "/images/categories/aero-1.jpg",
  Cooling: "/images/categories/cooling-1.jpg",
  Electronics: "/images/categories/electronics-1.jpg",
  Safety: "/images/categories/safety-1.jpg",
  Wheels: "/images/categories/wheels-1.jpg",
  Tires: "/images/categories/tires-1.jpg",
  Fluids: "/images/categories/fluids-1.jpg",
  Interior: "/images/categories/interior-1.jpg",
  Tools: "/images/categories/tools-1.jpg",
};

/** Fallback tiles — part categories + the makes present in the seed catalog. */
export const SEED_TILES: TaxonomyTile[] = [
  ...PART_CATEGORIES.map((category, i) => ({
    id: `category-${category.toLowerCase()}`,
    name: category,
    type: "category" as const,
    image: CATEGORY_IMAGES[category] ?? "/images/categories/engine-1.jpg",
    order: i,
  })),
  { id: "make-peugeot", name: "Peugeot", type: "make" as const, image: "/images/makes/peugeot.jpg", order: 20 },
  { id: "make-citroen", name: "Citroën", type: "make" as const, image: "/images/makes/citroen.jpg", order: 21 },
  { id: "make-renault", name: "Renault", type: "make" as const, image: "/images/makes/renault.jpg", order: 22 },
  { id: "make-volkswagen", name: "Volkswagen", type: "make" as const, image: "/images/makes/volkswagen.jpg", order: 23 },
  { id: "make-bmw", name: "BMW", type: "make" as const, image: "/images/makes/bmw.jpg", order: 24 },
  { id: "make-ford", name: "Ford", type: "make" as const, image: "/images/makes/ford.jpg", order: 25 },
  { id: "brand-brembo", name: "Brembo", type: "brand" as const, image: "/images/brands/brembo.webp", order: 30 },
  { id: "brand-bosch", name: "Bosch", type: "brand" as const, image: "/images/brands/Bosch_logo.png", order: 31 },
  { id: "brand-sachs", name: "Sachs", type: "brand" as const, image: "/images/brands/Sachs-Logo.png", order: 32 },
  { id: "brand-luk", name: "LuK", type: "brand" as const, image: "/images/brands/luk.svg", order: 33 },
];

export async function getTiles(type?: TaxonomyTile["type"]): Promise<TaxonomyTile[]> {
  return fromDb(
    async () => {
      const docs = await Category.find(type ? { type } : {})
        .sort({ order: 1, name: 1 })
        .lean();
      return (docs as unknown[]).map(toRecord);
    },
    async () => {
      const local = await readJson<TaxonomyTile[] | null>("categories", null);
      const base = local && local.length ? local : SEED_TILES;
      return type ? base.filter((t) => t.type === type) : base;
    },
  );
}

export async function upsertTile(tile: TaxonomyTile): Promise<TaxonomyTile> {
  if (hasDatabase()) {
    try {
      await connectDB();
      const doc = await Category.findOneAndUpdate(
        { name: tile.name, type: tile.type },
        { $set: tile },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      ).lean();
      return toRecord(doc);
    } catch {
      /* fall through */
    }
  }
  const tiles = await readJson<TaxonomyTile[]>("categories", [...SEED_TILES]);
  const idx = tiles.findIndex((t) => t.id === tile.id);
  if (idx >= 0) tiles[idx] = tile;
  else tiles.push(tile);
  await writeJson("categories", tiles);
  return tile;
}

export async function deleteTile(id: string): Promise<boolean> {
  if (hasDatabase()) {
    try {
      await connectDB();
      const res = await Category.deleteOne({ id });
      return Boolean(res.deletedCount);
    } catch {
      /* fall through */
    }
  }
  const tiles = await readJson<TaxonomyTile[]>("categories", [...SEED_TILES]);
  const next = tiles.filter((t) => t.id !== id);
  if (next.length === tiles.length) return false;
  await writeJson("categories", next);
  return true;
}

/* ── Derived filter facets (always from live products) ────────── */

export async function getFacets(products: { make: string; brand: string; category: string; model: string }[]) {
  const uniq = (values: string[]) =>
    [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr"));
  return {
    makes: uniq(products.map((p) => p.make)),
    models: uniq(products.map((p) => p.model)),
    brands: uniq(products.map((p) => p.brand)),
    categories: uniq(products.map((p) => p.category)),
  };
}
