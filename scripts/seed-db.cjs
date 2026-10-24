/**
 * One-off: upserts the seed catalog (products, tiles, blog posts, reviews)
 * into MongoDB so the Atlas-backed storefront serves the photo-updated data.
 * Usage: node scripts/seed-db.cjs  (requires .seed-build/ from seed:compile)
 */
const mongoose = require("mongoose");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { SEED_PRODUCTS, SEED_REVIEWS } = require("../.seed-build/catalog.js");
const { SEED_BLOG_POSTS } = require("../.seed-build/blog-seed.js");
const { SEED_TILES } = require("../.seed-build/categories.js");

const uri = readFileSync(join(__dirname, "..", ".env.local"), "utf8")
  .match(/MONGODB_URI=(.*)/)?.[1]?.trim();

if (!uri) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

async function main() {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  const db = mongoose.connection.db;
  const now = new Date();

  const productOps = SEED_PRODUCTS.map((p) => ({
    replaceOne: {
      filter: { slug: p.slug },
      replacement: { ...p, createdAt: new Date(p.createdAt ?? now), updatedAt: new Date(p.createdAt ?? now) },
      upsert: true,
    },
  }));
  const tileOps = SEED_TILES.map((t) => ({
    replaceOne: {
      filter: { name: t.name, type: t.type },
      // `id` must survive the whole-document replacement — deleteTileAction and
      // React keys both depend on it (see Category model).
      replacement: { id: t.id, name: t.name, type: t.type, image: t.image, href: "", order: t.order, createdAt: now, updatedAt: now },
      upsert: true,
    },
  }));
  const blogOps = SEED_BLOG_POSTS.map((p) => ({
    replaceOne: { filter: { slug: p.slug }, replacement: { ...p, createdAt: now, updatedAt: now }, upsert: true },
  }));
  const reviewOps = SEED_REVIEWS.map((r) => ({
    updateOne: {
      filter: { name: r.name, date: r.date },
      update: { $setOnInsert: { ...r, createdAt: now, updatedAt: now } },
      upsert: true,
    },
  }));

  const [p, t, b, r] = await Promise.all([
    db.collection("products").bulkWrite(productOps),
    db.collection("categories").bulkWrite(tileOps),
    db.collection("blogs").bulkWrite(blogOps),
    db.collection("reviews").bulkWrite(reviewOps),
  ]);
  console.log(
    `products upserted ${p.upsertedCount} (modified ${p.modifiedCount}) |`,
    `tiles ${t.upsertedCount}/${t.modifiedCount} |`,
    `blogs ${b.upsertedCount}/${b.modifiedCount} |`,
    `reviews ${r.upsertedCount}/${r.modifiedCount}`,
  );
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("seed failed:", e.message);
  process.exit(1);
});
