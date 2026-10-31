import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const env = fs.readFileSync(path.join(root, ".env.local"), "utf8");
const uri = env.match(/MONGODB_URI=(.*)/)?.[1]?.trim();
const cloudName = env.match(/CLOUDINARY_CLOUD_NAME=(.*)/)?.[1]?.trim();
const apiKey = env.match(/CLOUDINARY_API_KEY=(.*)/)?.[1]?.trim();
const apiSecret = env.match(/CLOUDINARY_API_SECRET=(.*)/)?.[1]?.trim();

cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });

const products = JSON.parse(fs.readFileSync("C:/Users/misha/Downloads/rouillard-sport-prod/products.json", "utf8"));
const pubBase = path.join(root, "public", "products");

await mongoose.connect(uri);
const coll = mongoose.connection.db.collection("products");

let total = 0;
for (let i = 0; i < products.length; i++) {
  const p = products[i];
  const folder = (p.images[0] || "").match(/prod(\d+)/)?.[1];
  if (!folder) continue;
  const localDir = path.join(pubBase, `prod${folder}`);
  if (!fs.existsSync(localDir)) continue;
  const files = fs.readdirSync(localDir).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).sort((a,b)=> a.localeCompare(b));
  const urls = [];
  for (let j = 0; j < files.length; j++) {
    const f = files[j];
    const full = path.join(localDir, f);
    const publicId = `rouillard/products/prod${folder}/${path.parse(f).name}`;
    try {
      const res = await cloudinary.uploader.upload(full, {
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
        folder: "rouillard/products"
      });
      urls.push(res.secure_url);
      console.log(`${p.slug} [${j+1}/${files.length}] uploaded`);
      total++;
    } catch (e) {
      console.error(`${p.slug} err:`, e.message);
    }
  }
  if (urls.length) {
    await coll.updateOne({ slug: p.slug }, { $set: { images: urls } });
    p.images = urls;
  }
}

fs.writeFileSync("C:/Users/misha/Downloads/rouillard-sport-prod/products.json", JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(root, "data", "products.json"), JSON.stringify(products, null, 2));
console.log(`\nDone. Uploaded ${total} images.`);
await mongoose.disconnect();
