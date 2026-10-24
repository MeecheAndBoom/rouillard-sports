import { MongoClient } from "mongodb";

const [, , uri, dbName] = process.argv;
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 20000 });
await client.connect();
const db = client.db(dbName);

const tiles = await db.collection("categories").find({}).toArray();
console.log("=== TILES ===");
for (const t of tiles) {
  console.log(
    `${t.type.padEnd(9)} ${String(t.id).padEnd(28)} ${String(t.name).padEnd(24)} img=${t.image ? "y" : "n"}  ${(t.image ?? "").slice(-42)}`,
  );
}

const products = await db.collection("products").find({}).toArray();
const brands = {};
for (const p of products) brands[p.brand] = (brands[p.brand] ?? 0) + 1;
console.log("\n=== PRODUCT BRANDS ===");
for (const [b, n] of Object.entries(brands).sort((a, b) => b[1] - a[1])) console.log(`  ${b}: ${n}`);

const blogs = await db.collection("blogs").find({}).toArray();
console.log("\n=== BLOGS ===");
for (const b of blogs) {
  console.log(`  ${b.slug} | ${b.category} | ${b.author} | ${b.title}`);
}

const orders = await db.collection("orders").find({}).toArray();
console.log("\n=== ORDERS ===");
for (const o of orders) console.log(`  ${o.reference} | ${o.status} | ${o.customer?.email}`);

await client.close();
