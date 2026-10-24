import fs from "node:fs";

const ED = "\u2014";
const EN = "\u2013";

const files = [
  "src/lib/blog-seed.ts",
  "src/lib/i18n/dictionaries/en.ts",
  "src/lib/i18n/dictionaries/fr.ts",
  "src/actions/orders.ts",
  "src/lib/db.ts",
  "src/lib/mailer.ts",
  "src/app/api/cloudinary/upload/route.ts",
];

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  src.split(/\r?\n/).forEach((line, i) => {
    if (!new RegExp(`[${ED}${EN}]`).test(line)) return;
    console.log(`${file}:${i + 1}\n${line}\n`);
  });
}
