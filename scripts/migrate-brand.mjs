/**
 * Brand + taxonomy migration for the Mongo catalogue.
 *
 * The shop was re-skinned from "Atelier Richard Méchano" (classic-car spares,
 * light editorial UI) to "Rouillard Sport" (motorsport parts, pit-lane UI).
 * The database still carried the old brand's name, part-number prefix and
 * category taxonomy, and the old copy used em-dashes, which the new design
 * system forbids.
 *
 * This script rewrites the live catalogue in place and refreshes the local
 * JSON fallback in `data/`. It is idempotent: running it twice changes
 * nothing the second time.
 *
 *   node scripts\migrate-brand.mjs --dry-run        # report only
 *   node scripts\migrate-brand.mjs --apply          # write to Mongo + data/
 *
 * The Mongo connection comes from MONGODB_URI / MONGODB_DB, or from the
 * first positional argument: `node scripts\migrate-brand.mjs "<uri>" "<db>"`.
 */

import fs from "node:fs";
import path from "node:path";
import { MongoClient } from "mongodb";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const positional = args.filter((a) => !a.startsWith("--"));
const uri = positional[0] ?? process.env.MONGODB_URI;
const dbName = positional[1] ?? process.env.MONGODB_DB ?? "rouillard-sport";

if (!uri) {
  console.error("No MongoDB URI. Pass one as an argument or set MONGODB_URI.");
  process.exit(1);
}

/* ── Taxonomy ─────────────────────────────────────────────────── */

const PART_CATEGORIES = [
  "Brakes",
  "Suspension",
  "Engine",
  "Transmission",
  "Exhaust",
  "Aero",
  "Cooling",
  "Electronics",
  "Safety",
  "Wheels",
  "Tires",
  "Fluids",
  "Interior",
  "Tools",
];

/** Old shop taxonomy -> new motorsport taxonomy. */
const CATEGORY_MAP = {
  Brakes: "Brakes",
  Suspension: "Suspension",
  Engine: "Engine",
  Transmission: "Transmission",
  Exhaust: "Exhaust",
  Aero: "Aero",
  Cooling: "Cooling",
  Electronics: "Electronics",
  Safety: "Safety",
  Wheels: "Wheels",
  Tires: "Tires",
  Fluids: "Fluids",
  Interior: "Interior",
  Tools: "Tools",
  Electrical: "Electronics",
  Body: "Aero",
  Rims: "Wheels",
  Fuel: "Fluids",
  Gaskets: "Engine",
  Filters: "Fluids",
  TailLights: "Aero",
  Headlights: "Aero",
};

const CATEGORY_SLUG = {
  Brakes: "brakes",
  Suspension: "suspension",
  Engine: "engine",
  Transmission: "transmission",
  Exhaust: "exhaust",
  Aero: "aero",
  Cooling: "cooling",
  Electronics: "electronics",
  Safety: "safety",
  Wheels: "wheels",
  Tires: "tires",
  Fluids: "fluids",
  Interior: "interior",
  Tools: "tools",
};

/** Local brand logos, matched by tile name. */
const BRAND_LOGOS = {
  ATE: "/images/brands/ATE.png",
  Bosch: "/images/brands/Bosch_logo.png",
  "Brembo": "/images/brands/brembo.webp",
  Continental: "/images/brands/Continental.png",
  Denso: "/images/brands/denso.png",
  "Febi-Bilstein": "/images/brands/febi-bilstein.jpeg",
  "Febi Bilstein": "/images/brands/febi-bilstein.jpeg",
  Hella: "/images/brands/Hella.jpeg",
  "LuK": "/images/brands/luk.svg",
  "Mann-Filter": "/images/brands/mann-filter.png",
  NGK: "/images/brands/ngk.jpeg",
  Sachs: "/images/brands/Sachs-Logo.png",
  SKF: "/images/brands/skf.jpeg",
  TRW: "/images/brands/trw.png",
  Valeo: "/images/brands/valeo.svg",
};

/** Local make photography, matched by tile name. */
const MAKE_PHOTOS = {
  Alpine: "/images/makes/alpine-1.jpg",
  BMW: "/images/makes/bmw-1.jpg",
  "Citroën": "/images/makes/citroen-1.jpg",
  Ford: "/images/makes/ford-1.jpg",
  Lotus: "/images/makes/lotus-1.jpg",
  Peugeot: "/images/makes/peugeot-1.jpg",
  Porsche: "/images/makes/porsche-1.jpg",
  Renault: "/images/makes/renault-1.jpg",
};

const OLD_BRAND = "Atelier";
const NEW_BRAND = "Rouillard";

/* ── Text helpers ─────────────────────────────────────────────── */

/**
 * The design system forbids em-dashes and en-dashes in visible copy.
 * Ranges keep their compact form ("4-7 jours"), sentences get a spaced
 * hyphen so the rhythm still reads as a break.
 */
function cleanText(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/(\d)\s*[\u2014\u2013]\s*(\d)/g, "$1-$2")
    .replace(/\s*[\u2014\u2013]\s*/g, " - ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Old shop part-number prefix -> new one. */
function cleanPrefix(value) {
  if (typeof value !== "string") return value;
  return value.replace(/ARM-/g, "RS-");
}

function cleanDeep(value) {
  if (typeof value === "string") return cleanText(cleanPrefix(value));
  if (Array.isArray(value)) return value.map(cleanDeep);
  // Dates are values, not objects to walk: `Object.entries(new Date())` would
  // erase every timestamp.
  if (value instanceof Date) return value;
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = cleanDeep(v);
    return out;
  }
  return value;
}

/** The old brand name in prose ("Atelier Richard Méchano"). */
const OLD_BRAND_PHRASES = [
  "Atelier Richard Méchano",
  "Atelier Richard Mécano",
  "atelierrichardmechano",
  "atelier-richard-mechano",
];

function cleanBrandProse(value) {
  if (typeof value !== "string") return value;
  let out = value;
  for (const phrase of OLD_BRAND_PHRASES) {
    out = out.split(phrase).join("Rouillard Sport");
  }
  return out;
}

/* ── Brand identity ───────────────────────────────────────────── */

const SITE_BLOCK = {
  name: "Rouillard Sport",
  tagline: "BMW & Rallye - Spécialiste toutes marques.",
  taglineEn: "BMW & Rallye - Specialist for all marques.",
  location: "L'Union, France",
  address: "15 ROUTE DE BESSIERES, 31240 L'UNION, France",
  phone: "+33 7 56 91 22 18",
  phoneHref: "+33756912218",
  email: "rouillardmarcantoine@gmail.com",
  announcement: "",
  hours: [
    { days: "Lundi - Vendredi", daysEn: "Monday - Friday", time: "8:00 - 18:30" },
    { days: "Samedi", daysEn: "Saturday", time: "9:00 - 13:00" },
    { days: "Dimanche", daysEn: "Sunday", time: "Fermé / Closed" },
  ],
};

const AUTHOR_MAP = {
  "Richard M.": "Rouillard Sport",
  "Équipe Atelier": "L'équipe Rouillard",
  "Equipe Atelier": "L'équipe Rouillard",
};

/* ── Migration ────────────────────────────────────────────────── */

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000 });
await client.connect();
const db = client.db(dbName);

const report = [];
const note = (line) => {
  report.push(line);
  console.log(line);
};

note(`Target: ${dbName}  (${apply ? "APPLY" : "DRY RUN"})`);

/* Products ---------------------------------------------------------------- */
{
  const products = await db.collection("products").find({}).toArray();
  let changed = 0;
  for (const doc of products) {
    const before = JSON.stringify(doc);
    const next = { ...doc };

    if (typeof next.brand === "string" && next.brand === OLD_BRAND) next.brand = NEW_BRAND;
    if (typeof next.category === "string" && CATEGORY_MAP[next.category]) {
      next.category = CATEGORY_MAP[next.category];
    }
    if (Array.isArray(next.tags)) {
      next.tags = next.tags.map((t) => (t === OLD_BRAND.toLowerCase() ? "rouillard" : t));
    }

    for (const key of Object.keys(next)) {
      if (key === "_id" || key === "__v") continue;
      next[key] = cleanDeep(next[key]);
    }
    next.title = cleanBrandProse(next.title);
    next.description = cleanBrandProse(next.description);

    if (JSON.stringify(next) !== before) {
      changed += 1;
      if (apply) await db.collection("products").replaceOne({ _id: doc._id }, next);
    }
  }
  note(`products   ${changed}/${products.length} updated`);
}

/* Blog -------------------------------------------------------------------- */
{
  const posts = await db.collection("blogs").find({}).toArray();
  let changed = 0;
  for (const doc of posts) {
    const before = JSON.stringify(doc);
    const next = { ...doc };

    if (typeof next.author === "string" && AUTHOR_MAP[next.author]) {
      next.author = AUTHOR_MAP[next.author];
    }

    for (const key of Object.keys(next)) {
      if (key === "_id" || key === "__v") continue;
      next[key] = cleanDeep(next[key]);
    }
    next.excerpt = cleanBrandProse(next.excerpt);
    next.body = cleanBrandProse(next.body);

    if (JSON.stringify(next) !== before) {
      changed += 1;
      if (apply) await db.collection("blogs").replaceOne({ _id: doc._id }, next);
    }
  }
  note(`blogs      ${changed}/${posts.length} updated`);
}

/* Reviews ----------------------------------------------------------------- */
{
  const reviews = await db.collection("reviews").find({}).toArray();
  let changed = 0;
  for (const doc of reviews) {
    const before = JSON.stringify(doc);
    const next = { ...doc };
    for (const key of Object.keys(next)) {
      if (key === "_id" || key === "__v") continue;
      next[key] = cleanDeep(next[key]);
    }
    next.body = cleanBrandProse(next.body);
    next.title = cleanBrandProse(next.title);
    if (JSON.stringify(next) !== before) {
      changed += 1;
      if (apply) await db.collection("reviews").replaceOne({ _id: doc._id }, next);
    }
  }
  note(`reviews    ${changed}/${reviews.length} updated`);
}

/* Orders ------------------------------------------------------------------ */
{
  const orders = await db.collection("orders").find({}).toArray();
  let changed = 0;
  for (const doc of orders) {
    const before = JSON.stringify(doc);
    const next = { ...doc };
    if (typeof next.reference === "string") next.reference = cleanPrefix(next.reference);
    for (const key of Object.keys(next)) {
      if (key === "_id" || key === "__v") continue;
      if (key === "payment") continue; // bank details and proof ids stay untouched
      next[key] = cleanDeep(next[key]);
    }
    if (JSON.stringify(next) !== before) {
      changed += 1;
      if (apply) await db.collection("orders").replaceOne({ _id: doc._id }, next);
    }
  }
  note(`orders     ${changed}/${orders.length} updated`);
}

/* Taxonomy tiles ---------------------------------------------------------- */
{
  const tiles = await db.collection("categories").find({}).toArray();
  const products = await db.collection("products").find({}).toArray();
  const keep = [];
  const seenCategories = new Set();
  let changed = 0;

  /** First product shot for a make or a brand, used when no logo exists. */
  const shotFor = new Map();
  for (const product of products) {
    const shot = (product.images ?? [])[0];
    if (!shot) continue;
    if (product.make && !shotFor.has(`make:${product.make}`)) shotFor.set(`make:${product.make}`, shot);
    if (product.brand && !shotFor.has(`brand:${product.brand}`)) shotFor.set(`brand:${product.brand}`, shot);
  }

  /** A stored local path only survives if the file is still in public/. */
  const resolves = (image) => {
    if (typeof image !== "string" || !image.startsWith("/")) return false;
    return fs.existsSync(path.join(process.cwd(), "public", image.replace(/^\//, "")));
  };

  for (const doc of tiles) {
    if (doc.type === "category") {
      const mapped = CATEGORY_MAP[doc.name];
      // Unknown old category, or a second tile for a discipline that already
      // has one: dropped so the unique {name, type} index stays clean.
      if (!mapped || seenCategories.has(mapped)) continue;
      seenCategories.add(mapped);
      const next = {
        ...doc,
        name: mapped,
        id: `category-${CATEGORY_SLUG[mapped]}`,
        type: "category",
        image: `/images/categories/${CATEGORY_SLUG[mapped]}-1.jpg`,
        order: PART_CATEGORIES.indexOf(mapped),
      };
      keep.push(next);
      if (JSON.stringify(next) !== JSON.stringify(doc)) changed += 1;
      continue;
    }

    const next = { ...doc };
    if (doc.type === "brand") {
      if (doc.name === OLD_BRAND) {
        next.name = NEW_BRAND;
        next.id = "brand-rouillard";
      }
      const logo = BRAND_LOGOS[next.name];
      if (logo) next.image = logo;
    }
    if (doc.type === "make") {
      const photo = MAKE_PHOTOS[next.name];
      if (photo) next.image = photo;
    }

    // A tile must always show something that resolves.
    if (!resolves(next.image)) {
      const shot = shotFor.get(`${doc.type}:${next.name}`);
      if (shot) next.image = shot;
    }

    keep.push(next);
    if (JSON.stringify(next) !== JSON.stringify(doc)) changed += 1;
  }

  // Every discipline in the new taxonomy must have a tile, even when the old
  // shop never sold a part in it.
  for (const category of PART_CATEGORIES) {
    if (seenCategories.has(category)) continue;
    seenCategories.add(category);
    keep.push({
      name: category,
      id: `category-${CATEGORY_SLUG[category]}`,
      type: "category",
      image: `/images/categories/${CATEGORY_SLUG[category]}-1.jpg`,
      order: PART_CATEGORIES.indexOf(category),
    });
    changed += 1;
  }

  note(`tiles      ${changed}/${tiles.length} updated, ${keep.length} kept`);

  if (apply) {
    await db.collection("categories").deleteMany({});
    if (keep.length) await db.collection("categories").insertMany(keep);
    await db.collection("categories").updateMany({}, { $set: { updatedAt: new Date() } });
  }
}

/* Settings ---------------------------------------------------------------- */
{
  const doc = await db.collection("settings").findOne({ key: "site" });
  if (doc) {
    const next = { ...doc, site: { ...SITE_BLOCK } };
    if (JSON.stringify(next.site) !== JSON.stringify(doc.site)) {
      note("settings   site block rewritten");
      if (apply) await db.collection("settings").updateOne({ key: "site" }, { $set: { site: SITE_BLOCK } });
    }
  } else {
    note("settings   no site document found");
  }
}

/* ── Local JSON fallback ──────────────────────────────────────── */

if (apply) {
  const dataDir = path.join(process.cwd(), "data");
  fs.mkdirSync(dataDir, { recursive: true });

  const dump = async (collection, file) => {
    const docs = await db.collection(collection).find({}).toArray();
    const clean = docs.map(({ _id, __v, ...rest }) => rest);
    fs.writeFileSync(path.join(dataDir, `${file}.json`), JSON.stringify(clean, null, 2), "utf8");
    note(`data/${file}.json  ${clean.length} records`);
  };

  await dump("products", "products");
  await dump("categories", "categories");
  await dump("blogs", "blog");
  await dump("reviews", "reviews");
  await dump("orders", "orders");
  await dump("enquiries", "enquiries");
}

await client.close();
console.log(`\nDone (${apply ? "applied" : "dry run, nothing written"}).`);
