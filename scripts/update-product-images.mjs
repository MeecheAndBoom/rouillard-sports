import mongoose from "mongoose";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const uri = readFileSync(join(root, ".env.local"), "utf8")
  .match(/MONGODB_URI=(.*)/)?.[1]?.trim();

const products = JSON.parse(
  readFileSync("C:/Users/misha/Downloads/rouillard-sport-prod/products.json", "utf8")
);

await mongoose.connect(uri);
const coll = mongoose.connection.db.collection("products");

let updated = 0;
for (const p of products) {
  const r = await coll.updateOne({ slug: p.slug }, { $set: { images: p.images } });
  updated += r.modifiedCount;
  console.log(`${p.slug}: ${p.images.length} images`);
}

console.log(`\nUpdated ${updated} products in MongoDB`);
await mongoose.disconnect();
