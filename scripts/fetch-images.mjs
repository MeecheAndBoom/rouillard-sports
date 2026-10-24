/**
 * Research + download candidate photos from Wikimedia Commons (primary) for
 * every image slot in the storefront. Downloads top candidates per slot into
 * .image-staging/<slot>/ with a meta.json for the visual review pass.
 *
 * Usage: node scripts/fetch-images.mjs [--slots=hero,brake-pads,...] [--n=4]
 */
import { mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const STAGING = join(process.cwd(), ".image-staging");
const UA = "AtelierRichardMechano/1.0 (site build; contact: sales@atelier-richard-mechano.com)";

/** Slot definitions: query, count, min width, orientation ("wide"|"any"). */
const SLOTS = {
  // ── Products ────────────────────────────────────────────────
  "product-timing-kit": { q: "timing belt engine", n: 4, minW: 1000, orient: "any" },
  "product-brake-pads": { q: "brake pads", n: 4, minW: 1000, orient: "any" },
  "product-battery": { q: "car battery starter", n: 4, minW: 1000, orient: "any" },
  "product-shock-absorber": { q: "shock absorber car", n: 4, minW: 1000, orient: "any" },
  "product-oil-filter": { q: "oil filter", n: 4, minW: 1000, orient: "any" },
  "product-alternator": { q: "car alternator", n: 4, minW: 1000, orient: "any" },
  "product-clutch-kit": { q: "clutch disc car", n: 4, minW: 1000, orient: "any" },
  "product-water-pump": { q: "automotive water pump", n: 4, minW: 1000, orient: "any" },
  "product-brake-disc": { q: "brake disc", n: 4, minW: 900, orient: "any" },
  "product-gasket-set": { q: "head gasket engine", n: 4, minW: 1000, orient: "any" },
  "product-fuel-pump": { q: "fuel pump automobile", n: 4, minW: 1000, orient: "any" },
  "product-toolkit": { q: "tool set case mechanic", n: 4, minW: 1000, orient: "any" },

  // ── Categories ──────────────────────────────────────────────
  "cat-engine": { q: "car engine bay", n: 3, minW: 1200, orient: "wide" },
  "cat-brakes": { q: "brake caliper disc", n: 3, minW: 1200, orient: "wide" },
  "cat-electrical": { q: "car fuse box", n: 3, minW: 1200, orient: "any" },
  "cat-transmission": { q: "car gearbox transmission", n: 3, minW: 1200, orient: "wide" },
  "cat-suspension": { q: "car suspension coil spring", n: 3, minW: 1200, orient: "wide" },
  "cat-filters": { q: "car air filter", n: 3, minW: 1200, orient: "wide" },
  "cat-cooling": { q: "car radiator engine cooling", n: 3, minW: 1200, orient: "wide" },
  "cat-tools": { q: "wrench spanner set", n: 3, minW: 1000, orient: "any" },

  // ── Makes ───────────────────────────────────────────────────
  "make-peugeot": { q: "Peugeot 208 car", n: 3, minW: 1200, orient: "wide" },
  "make-citroen": { q: "Citroen C3 car", n: 3, minW: 1200, orient: "wide" },
  "make-renault": { q: "Renault Clio car", n: 3, minW: 1200, orient: "wide" },
  "make-volkswagen": { q: "Volkswagen Golf car", n: 3, minW: 1200, orient: "wide" },
  "make-bmw": { q: "BMW 3 Series car", n: 3, minW: 1200, orient: "wide" },
  "make-ford": { q: "Ford Transit van", n: 3, minW: 1200, orient: "wide" },

  // ── Brands (generic part close-ups) ─────────────────────────
  "brand-caliper": { q: "brake caliper red", n: 3, minW: 1000, orient: "any" },
  "brand-spark-plug": { q: "spark plug", n: 3, minW: 1000, orient: "any" },
  "brand-damper": { q: "shock absorber damper", n: 3, minW: 1000, orient: "any" },
  "brand-clutch": { q: "clutch pressure plate", n: 3, minW: 1000, orient: "any" },

  // ── Editorial / sections ────────────────────────────────────
  "hero": { q: "car mechanic workshop", n: 5, minW: 1400, orient: "wide" },
  "spotlight": { q: "brake disc close up", n: 5, minW: 1600, orient: "wide" },
  "atelier": { q: "car workshop garage interior", n: 4, minW: 1400, orient: "wide" },
  "blog-fitment": { q: "mechanic inspecting car engine", n: 3, minW: 1100, orient: "wide" },
  "blog-engine-work": { q: "engine repair hands", n: 3, minW: 1200, orient: "wide" },
};

const BAD_TITLE = /diagram|schema|schematic|drawing|vector|logo|icon|poster|chart|illustration|sketch|clipart|montage|graph/i;

async function searchCommons(query, limit = 25) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*" +
    `&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=${limit}` +
    "&prop=imageinfo&iiprop=url%7Csize%7Cmime%7Cextmetadata&iiurlwidth=1600";
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`search ${res.status}`);
  const data = await res.json();
  const pages = Object.values(data.query?.pages ?? {});
  return pages
    .map((p) => {
      const ii = p.imageinfo?.[0];
      if (!ii) return null;
      const em = ii.extmetadata ?? {};
      return {
        title: p.title.replace(/^File:/, ""),
        url: ii.thumburl ?? ii.url,
        fullUrl: ii.url,
        width: ii.width,
        height: ii.height,
        mime: ii.mime,
        artist: stripHtml(em.Artist?.value ?? ""),
        license: em.LicenseShortName?.value ?? "",
        licenseUrl: em.LicenseUrl?.value ?? "",
        page: ii.descriptionurl ?? "",
      };
    })
    .filter(Boolean);
}

function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 120);
}

async function download(url, dest, headers = {}) {
  const res = await fetch(url, { headers: { "user-agent": UA, ...headers } });
  if (!res.ok) throw new Error(`dl ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return buf.length;
}

async function main() {
  const args = process.argv.slice(2);
  const only = args.find((a) => a.startsWith("--slots="))?.slice(8)?.split(",");
  const nArg = Number(args.find((a) => a.startsWith("--n="))?.slice(4) ?? 0);

  const plan = Object.entries(SLOTS).filter(([k]) => !only || only.includes(k));
  const report = [];

  for (const [slot, cfg] of plan) {
    const dir = join(STAGING, slot);
    await rm(dir, { recursive: true, force: true });
    await mkdir(dir, { recursive: true });
    const want = nArg || cfg.n;
    try {
      let results = await searchCommons(cfg.q);
      results = results.filter(
        (r) =>
          r.mime === "image/jpeg" ||
          r.mime === "image/png",
      );
      results = results.filter((r) => r.width >= cfg.minW);
      if (cfg.orient === "wide") results = results.filter((r) => r.width >= r.height * 1.15);
      results = results.filter((r) => !BAD_TITLE.test(r.title));
      // de-dup identical titles, prefer landscape & larger
      results.sort((a, b) => b.width * b.height - a.width * a.height);

      const picked = [];
      const meta = [];
      for (const r of results) {
        if (picked.length >= want) break;
        const idx = picked.length;
        const dest = join(dir, `c${idx}.jpg`);
        try {
          const bytes = await download(r.url, dest);
          picked.push(r);
          meta.push({ file: `c${idx}.jpg`, bytes, ...r });
        } catch (e) {
          console.log(`  ! download fail ${slot} ${r.title}: ${e.message}`);
        }
      }
      await writeFile(join(dir, "meta.json"), JSON.stringify(meta, null, 2));
      report.push(`${slot}: ${meta.length}/${want} candidates — ${cfg.q}`);
      console.log(`✓ ${slot}: ${meta.length}/${want}`);
    } catch (e) {
      report.push(`${slot}: FAILED ${e.message}`);
      console.log(`✗ ${slot}: ${e.message}`);
    }
  }
  console.log("\n" + report.join("\n"));
}

main();
