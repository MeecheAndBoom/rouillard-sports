/**
 * One-shot branding sweep: Atelier Richard Méchano -> Rouillard Sport.
 * Run with `node scripts/rebrand.mjs`. Idempotent.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

/** Global substitutions applied to every scanned file. */
const GLOBAL = [
  ["Atelier Richard Méchano", "Rouillard Sport"],
  ["Atelier Richard Mechano", "Rouillard Sport"],
  ["info@atelierrichardmechano.com", "contact@rouillard-sport.com"],
  ["admin@atelierrichardmechano.com", "admin@rouillard-sport.com"],
  ["atelierrichardmechano.com", "rouillard-sport.com"],
  ["atelier-richard-mechano.com", "rouillard-sport.com"],
  ["atelier-richard-mechano", "rouillard-sport"],
  ["arm-locale", "rs-locale"],
  ["arm-admin", "rs-admin"],
  ["arm-dev-secret", "rs-dev-secret"],
  ["Mechano2026!", "Rouillard2026!"],
  ["+33 7 80 96 92 76", "+33 4 72 84 09 63"],
  ["+33780969276", "+33472840963"],
  ["24 Rue de l’Industrie, 69007 Lyon, France", "14 Rue de la Vitrine, 69150 Décines-Charpieu, France"],
  ["24 Rue de l'Industrie, Lyon", "14 Rue de la Vitrine, Décines-Charpieu"],
  ["Richard M. (représentant légal de l’atelier)", "La direction de Rouillard Sport"],
  ["Richard M. (legal representative of the workshop)", "Rouillard Sport"],
  ['author: "Richard M."', 'author: "Rouillard Sport"'],
  ['author: "Équipe Atelier"', 'author: "Équipe Rouillard Sport"'],
  ["atelier_richard_mecano_open_graph.png", "rouillard_sport_open_graph.png"],
];

/** Cloudinary upload folders only (never the public asset URLs in categories.ts). */
const FOLDER_FILES = new Set([
  "src/actions/orders.ts",
  "src/app/api/cloudinary/upload/route.ts",
  "src/components/admin/ImageUploader.tsx",
  "src/components/admin/BlogForm.tsx",
  "src/components/admin/ProductForm.tsx",
  "src/components/admin/TileForm.tsx",
]);

const FOLDERS = [
  ["atelier/uploads", "rouillard/uploads"],
  ["atelier/products", "rouillard/products"],
  ["atelier/blog", "rouillard/blog"],
  ["atelier/tiles", "rouillard/tiles"],
  ["atelier/payments", "rouillard/payments"],
];

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "out", "dist"]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const targets = walk(join(ROOT, "src"))
  .filter((f) => /\.(ts|tsx|css|json)$/.test(f))
  .concat([
    join(ROOT, ".env.example"),
    join(ROOT, "package.json"),
    join(ROOT, "README.md"),
    join(ROOT, "public/manifest.json"),
    join(ROOT, "public/site.webmanifest"),
  ]);

let changed = 0;
for (const file of targets) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  let src;
  try {
    src = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const before = src;
  for (const [from, to] of GLOBAL) src = src.split(from).join(to);
  if (FOLDER_FILES.has(rel)) {
    for (const [from, to] of FOLDERS) src = src.split(from).join(to);
  }
  if (src !== before) {
    writeFileSync(file, src, "utf8");
    changed++;
    console.log("updated", rel);
  }
}
console.log(`\n${changed} files updated.`);
