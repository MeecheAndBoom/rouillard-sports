import { connectDB, hasDatabase } from "./db";
import { Product } from "./models/Product";
import { SEED_PRODUCTS } from "./catalog";
import { readJson, writeJson } from "./fileStore";
import type { Product as ProductRecord, ProductInput } from "./types";
import { slugify } from "./fileStore";

const COOL_DOWN = 30_000;
let localFallbackUntil = 0;

/**
 * DB-first product reads with a 30s cool-down after a failure, so a dead
 * cluster degrades to the JSON store instead of slowing every request.
 */
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

const toRecord = (doc: unknown): ProductRecord =>
  JSON.parse(JSON.stringify(doc)) as ProductRecord;

export async function getProducts(opts?: { includeDrafts?: boolean }): Promise<ProductRecord[]> {
  return fromDb(
    async () => {
      const docs = await Product.find(opts?.includeDrafts ? {} : { status: "live" })
        .sort({ createdAt: -1 })
        .lean();
      return (docs as unknown[]).map(toRecord);
    },
    async () => {
      const local = await readJson<ProductRecord[] | null>("products", null);
      const base = local && local.length ? local : SEED_PRODUCTS;
      return opts?.includeDrafts ? base : base.filter((p) => p.status === "live");
    },
  );
}

export async function getProduct(slug: string): Promise<ProductRecord | null> {
  return fromDb(
    async () => {
      const doc = await Product.findOne({ slug }).lean();
      return doc ? toRecord(doc) : null;
    },
    async () => {
      const local = await readJson<ProductRecord[] | null>("products", null);
      const base = local && local.length ? local : SEED_PRODUCTS;
      return base.find((p) => p.slug === slug) ?? null;
    },
  );
}

/** Lookup by SKU/part-number reference (used in search + order seeding). */
export async function getProductByReference(reference: string): Promise<ProductRecord | null> {
  const ref = reference.trim().toLowerCase();
  const all = await getProducts({ includeDrafts: true });
  return (
    all.find(
      (p) =>
        p.partNumber.toLowerCase() === ref ||
        (p.sku ?? "").toLowerCase() === ref ||
        p.slug === slugify(reference),
    ) ?? null
  );
}

export async function getFeaturedProducts(limit = 6): Promise<ProductRecord[]> {
  const all = await getProducts();
  const featured = all.filter((p) => p.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

export async function getRelatedProducts(product: ProductRecord, limit = 3): Promise<ProductRecord[]> {
  const all = await getProducts();
  return all
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, limit);
}

/* ── Writes (admin actions + local store) ─────────────────────── */

export async function upsertProduct(input: ProductInput): Promise<ProductRecord> {
  const slug = input.slug?.trim() || slugify(input.title);

  if (hasDatabase()) {
    try {
      await connectDB();
      const doc = await Product.findOneAndUpdate(
        { slug },
        { $set: { ...input, slug } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      ).lean();
      if (doc) await syncLocalStore();
      return toRecord(doc);
    } catch {
      /* fall through to local store */
    }
  }

  const products = await readJson<ProductRecord[]>("products", [...SEED_PRODUCTS]);
  const idx = products.findIndex((p) => p.slug === slug);
  const record: ProductRecord = {
    ...(idx >= 0 ? products[idx] : ({} as ProductRecord)),
    ...input,
    slug,
  } as ProductRecord;
  if (idx >= 0) products[idx] = record;
  else products.unshift(record);
  await writeJson("products", products);
  return record;
}

export async function deleteProduct(slug: string): Promise<boolean> {
  if (hasDatabase()) {
    try {
      await connectDB();
      await Product.deleteOne({ slug });
      await syncLocalStore();
      return true;
    } catch {
      /* fall through */
    }
  }
  const products = await readJson<ProductRecord[]>("products", [...SEED_PRODUCTS]);
  const next = products.filter((p) => p.slug !== slug);
  if (next.length === products.length) return false;
  await writeJson("products", next);
  return true;
}

/** Refreshes data/products.json from the database so the JSON fallback stays current. */
export async function syncLocalStore(): Promise<void> {
  if (!hasDatabase()) return;
  try {
    await connectDB();
    const docs = await Product.find({}).sort({ createdAt: -1 }).lean();
    await writeJson("products", (docs as unknown[]).map(toRecord));
  } catch {
    /* best effort */
  }
}
