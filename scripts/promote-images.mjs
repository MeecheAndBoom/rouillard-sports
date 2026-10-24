/**
 * Promotes the staged racing photography into public/images/ using the
 * final site naming, and writes a credits file for the licence obligations
 * (CC BY / CC BY-SA require attribution).
 */
import { readdir, readFile, writeFile, mkdir, rm, copyFile, stat } from "node:fs/promises";
import { join } from "node:path";

const STAGING = join(process.cwd(), ".image-staging");
const PUBLIC = join(process.cwd(), "public", "images");

/** slot -> [destination directory, prefix, extension] */
const MAP = {
  "hero-track": ["editorial", "hero", "jpg"],
  "editorial-paddock": ["editorial", "paddock", "jpg"],
  "editorial-workshop": ["editorial", "workshop", "jpg"],
  "editorial-helmet": ["editorial", "helmet", "jpg"],
  "spotlight-parts": ["editorial", "spotlight", "jpg"],
  "cat-brakes": ["categories", "brakes", "jpg"],
  "cat-suspension": ["categories", "suspension", "jpg"],
  "cat-engine": ["categories", "engine", "jpg"],
  "cat-transmission": ["categories", "transmission", "jpg"],
  "cat-exhaust": ["categories", "exhaust", "jpg"],
  "cat-aero": ["categories", "aero", "jpg"],
  "cat-cooling": ["categories", "cooling", "jpg"],
  "cat-electronics": ["categories", "electronics", "jpg"],
  "cat-safety": ["categories", "safety", "jpg"],
  "cat-wheels": ["categories", "wheels", "jpg"],
  "cat-tires": ["categories", "tires", "jpg"],
  "cat-fluids": ["categories", "fluids", "jpg"],
  "cat-tools": ["categories", "tools", "jpg"],
  "cat-interior": ["categories", "interior", "jpg"],
  "make-porsche": ["makes", "porsche", "jpg"],
  "make-bmw": ["makes", "bmw", "jpg"],
  "make-renault": ["makes", "renault", "jpg"],
  "make-alpine": ["makes", "alpine", "jpg"],
  "make-peugeot": ["makes", "peugeot", "jpg"],
  "make-lotus": ["makes", "lotus", "jpg"],
  "make-citroen": ["makes", "citroen", "jpg"],
  "make-ford": ["makes", "ford", "jpg"],
};

const credits = [];

for (const [slot, [dir, prefix]] of Object.entries(MAP)) {
  const from = join(STAGING, slot);
  const to = join(PUBLIC, dir);
  await mkdir(to, { recursive: true });

  let meta = [];
  try {
    meta = JSON.parse(await readFile(join(from, "meta.json"), "utf8"));
  } catch {}

  const files = (await readdir(from))
    .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
    .sort((a, b) => Number(a.match(/c(\d+)/)[1]) - Number(b.match(/c(\d+)/)[1]));

  for (const f of files) {
    const idx = Number(f.match(/c(\d+)/)[1]);
    const name = `${prefix}-${idx + 1}.jpg`;
    await copyFile(join(from, f), join(to, name));
    const m = meta.find((x) => x.file === f);
    if (m) {
      credits.push({
        file: `/images/${dir}/${name}`,
        title: m.title,
        author: m.artist || "Unknown",
        license: m.license || "see source",
        licenseUrl: m.licenseUrl || "",
        source: m.page || "",
      });
    }
  }
}

/* ── Retire the previous (atelier) photography ─────────────────── */
const stale = [
  join(PUBLIC, "categories", "electrical.jpg"),
  join(PUBLIC, "categories", "filters.jpg"),
  join(PUBLIC, "categories", "rims.jpg"),
  join(PUBLIC, "categories", "tires.jpg"),
  join(PUBLIC, "categories", "taillights.jpg"),
  join(PUBLIC, "categories", "headlights.jpg"),
  join(PUBLIC, "categories", "body.jpg"),
  join(PUBLIC, "categories", "fuel.jpg"),
  join(PUBLIC, "categories", "gaskets.jpg"),
  join(PUBLIC, "editorial", "atelier.jpg"),
  join(PUBLIC, "editorial", "hero.jpg"),
  join(PUBLIC, "editorial", "spotlight.jpg"),
  join(PUBLIC, "editorial", "blog-engine.jpg"),
  join(PUBLIC, "editorial", "blog-fitment.jpg"),
  join(PUBLIC, "editorial", "og-placeholder.png"),
  join(PUBLIC, "makes", "volkswagen.jpg"),
  join(PUBLIC, "makes", "citroen.jpg"),
  join(PUBLIC, "makes", "bmw.jpg"),
  join(PUBLIC, "makes", "peugeot.jpg"),
  join(PUBLIC, "makes", "renault.jpg"),
  join(PUBLIC, "makes", "ford.jpg"),
  join(PUBLIC, "placeholder.jpg"),
  join(PUBLIC, "videos", "workshop-loop.mp4"),
];
for (const p of stale) await rm(p, { force: true }).catch(() => {});
await rm(join(PUBLIC, "videos"), { recursive: true, force: true }).catch(() => {});

/* ── Credits manifest ──────────────────────────────────────────── */
await writeFile(
  join(PUBLIC, "CREDITS.json"),
  JSON.stringify({ generated: new Date().toISOString(), images: credits }, null, 2),
  "utf8",
);

console.log(`promoted ${credits.length} images`);
for (const dir of ["editorial", "categories", "makes"]) {
  const list = await readdir(join(PUBLIC, dir)).catch(() => []);
  console.log(`  ${dir}: ${list.length} files`);
}
