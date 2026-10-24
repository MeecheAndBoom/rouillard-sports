/**
 * Copies the visually-verified winners from .image-staging/ into public/images/
 * and generates docs/IMAGE-CREDITS.md with attribution for CC-licensed photos.
 *
 * Winner = best candidate (cN) per slot, chosen by the vision-model QA pass.
 */
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();
const STAGING = join(ROOT, ".image-staging");
const OUT = join(ROOT, "public", "images");

/** slot → { dir: staging slot, file: winner, dest: relative path under public/images } */
const WINNERS = [
  // ── Products ───────────────────────────────────────────────
  { slot: "product-timing-kit", file: "c2.jpg", dest: "products/timing-kit.jpg" },
  { slot: "product-brake-pads", file: "c0.jpg", dest: "products/brake-pads.jpg" },
  { slot: "product-battery", file: "c3.jpg", dest: "products/battery.jpg" },
  { slot: "product-shock-absorber", file: "c0.jpg", dest: "products/shock-absorber.jpg" },
  { slot: "product-oil-filter", file: "c0.jpg", dest: "products/oil-filter.jpg" },
  { slot: "product-alternator", file: "c0.jpg", dest: "products/alternator.jpg" },
  { slot: "product-clutch-kit", file: "c1.jpg", dest: "products/clutch-kit.jpg" },
  { slot: "product-water-pump", file: "c0.jpg", dest: "products/water-pump.jpg" },
  { slot: "product-brake-disc", file: "c0.jpg", dest: "products/brake-disc.jpg" },
  { slot: "product-gasket-set", file: "c0.jpg", dest: "products/gasket-set.jpg" },
  { slot: "product-fuel-pump", file: "c1.jpg", dest: "products/fuel-pump.jpg" },
  { slot: "product-toolkit", file: "c2.jpg", dest: "products/toolkit.jpg" },

  // ── Categories ─────────────────────────────────────────────
  { slot: "cat-engine", file: "c1.jpg", dest: "categories/engine.jpg" },
  { slot: "cat-brakes", file: "c3.jpg", dest: "categories/brakes.jpg" },
  { slot: "cat-electrical", file: "c0.jpg", dest: "categories/electrical.jpg" },
  { slot: "cat-transmission", file: "c2.jpg", dest: "categories/transmission.jpg" },
  { slot: "cat-suspension", file: "c3.jpg", dest: "categories/suspension.jpg" },
  { slot: "cat-filters", file: "c0.jpg", dest: "categories/filters.jpg" },
  { slot: "cat-cooling", file: "c1.jpg", dest: "categories/cooling.jpg" },
  { slot: "cat-tools", file: "c2.jpg", dest: "categories/tools.jpg" },

  // ── Vehicle makes ──────────────────────────────────────────
  { slot: "make-peugeot", file: "c2.jpg", dest: "makes/peugeot.jpg" },
  { slot: "make-citroen", file: "c1.jpg", dest: "makes/citroen.jpg" },
  { slot: "make-renault", file: "c2.jpg", dest: "makes/renault.jpg" },
  { slot: "make-volkswagen", file: "c2.jpg", dest: "makes/volkswagen.jpg" },
  { slot: "make-bmw", file: "c1.jpg", dest: "makes/bmw.jpg" },
  { slot: "make-ford", file: "c2.jpg", dest: "makes/ford.jpg" },

  // ── Part-brand tiles (generic part close-ups) ──────────────
  { slot: "brand-caliper", file: "c2.jpg", dest: "brands/brembo.jpg" },
  { slot: "brand-spark-plug", file: "c2.jpg", dest: "brands/bosch.jpg" },
  { slot: "brand-damper", file: "c1.jpg", dest: "brands/sachs.jpg" },
  { slot: "brand-clutch", file: "c1.jpg", dest: "brands/luk.jpg" },

  // ── Editorial / sections ───────────────────────────────────
  { slot: "hero", file: "c1.jpg", dest: "editorial/hero.jpg" },
  { slot: "spotlight", file: "c0.jpg", dest: "editorial/spotlight.jpg" },
  { slot: "atelier", file: "c1.jpg", dest: "editorial/atelier.jpg" },
  { slot: "blog-fitment", file: "c0.jpg", dest: "editorial/blog-fitment.jpg" },
  { slot: "blog-engine-work", file: "c1.jpg", dest: "editorial/blog-engine.jpg" },

  // ── Neutral fallback ───────────────────────────────────────
  { slot: "product-toolkit", file: "c2.jpg", dest: "placeholder.jpg" },
];

async function main() {
  const credits = [];
  let copied = 0;
  let failed = 0;

  for (const w of WINNERS) {
    const src = join(STAGING, w.slot, w.file);
    const dest = join(OUT, w.dest);
    await mkdir(join(OUT, w.dest.split("/").slice(0, -1).join("/")), { recursive: true });
    try {
      await copyFile(src, dest);
      copied++;
    } catch (e) {
      failed++;
      console.log(`✗ ${w.slot}/${w.file} → ${w.dest}: ${e.message}`);
      continue;
    }
    if (w.dest === "placeholder.jpg") continue; // no duplicate credit entry
    try {
      const meta = JSON.parse(await readFile(join(STAGING, w.slot, "meta.json"), "utf8"));
      const entry = meta.find((m) => m.file === w.file);
      if (entry) {
        credits.push({ dest: w.dest, ...entry });
      }
    } catch {
      /* meta missing — skip credit line */
    }
  }

  const md = [
    "# Image credits",
    "",
    "Every photograph in `public/images/` was visually reviewed before use.",
    "Sources are Wikimedia Commons and Openverse (Flickr etc.) under licenses",
    "that require attribution. Regenerate with `node scripts/assemble-images.mjs`.",
    "",
    "| File | Title | Author | License | Source |",
    "| --- | --- | --- | --- | --- |",
    ...credits.map(
      (c) =>
        `| \`${c.dest}\` | ${(c.title ?? "").replace(/\|/g, "\\|").slice(0, 80)} | ${(c.artist ?? "Unknown").replace(/\|/g, "\\|").slice(0, 60)} | ${c.license || "—"} | ${c.page || ""} |`,
    ),
    "",
  ].join("\n");

  await mkdir(join(ROOT, "docs"), { recursive: true });
  await writeFile(join(ROOT, "docs", "IMAGE-CREDITS.md"), md, "utf8");

  console.log(`✓ copied ${copied}, failed ${failed}, credits: ${credits.length}`);
}

main();
