import mongoose from "mongoose";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function parseEnv() {
  const env = readFileSync(join(root, ".env.local"), "utf8");
  const uri = env.match(/MONGODB_URI=(.*)/)?.[1]?.trim();
  const dbName = env.match(/MONGODB_DB=(.*)/)?.[1]?.trim();
  return { uri, dbName };
}

const { uri, dbName } = parseEnv();
if (!uri) {
  console.error("MONGODB_URI not found");
  process.exit(1);
}

const ProductSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  titleEn: String,
  partNumber: { type: String, required: true, index: true },
  sku: String,
  brand: { type: String, required: true, index: true },
  make: { type: String, required: true, index: true },
  model: { type: String, required: true },
  yearFrom: Number,
  yearTo: Number,
  yearRange: String,
  fitment: [String],
  condition: { type: String, enum: ["new", "refurb", "used"], default: "new" },
  category: { type: String, required: true, index: true },
  subcategory: String,
  price: { type: Number, required: true, index: true },
  listPrice: Number,
  stock: { type: Number, required: true, min: 0, default: 0, index: true },
  weightKg: Number,
  dimensions: { l: Number, w: Number, h: Number },
  specs: mongoose.Schema.Types.Mixed,
  description: { type: String, required: true },
  descriptionEn: String,
  features: [String],
  images: [String],
  status: { type: String, enum: ["live", "draft"], default: "live", index: true },
  featured: { type: Boolean, default: false, index: true },
  tags: [String],
  oemNumbers: [String],
  metaTitle: String,
  metaDescription: String,
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

async function main() {
  const products = JSON.parse(
    readFileSync("C:/Users/misha/Downloads/rouillard-sport-prod/products.json", "utf8")
  );
  console.log(`Loaded ${products.length} products from JSON`);
  
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
  
  // Remove all existing products
  const deleted = await Product.deleteMany({});
  console.log(`Deleted ${deleted.deletedCount} existing products`);
  
  // Insert new products
  const inserted = await Product.insertMany(products);
  console.log(`Inserted ${inserted.length} new products`);
  
  // Also update local fallback data/products.json
  writeFileSync(join(root, "data", "products.json"), JSON.stringify(products, null, 2));
  console.log("Updated data/products.json");
  
  await mongoose.disconnect();
  console.log("Done!");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
