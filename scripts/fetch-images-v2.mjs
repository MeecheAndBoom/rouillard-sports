/**
 * v2 fetcher — re-fetches the image slots whose v1 (search-based) candidates
 * failed visual QA. Uses precise Commons CATEGORIES (+ German search terms)
 * and Openverse (Flickr/CC aggregation) instead of noisy full-text search.
 *
 * Usage: node scripts/fetch-images-v2.mjs
 */
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";

const STAGING = join(process.cwd(), ".image-staging");
const UA = "AtelierRichardMechano/1.0 (site build; contact: sales@atelier-richard-mechano.com)";
const OK_LICENSES = new Set(["cc0", "pdm", "by", "by-sa"]); // commercial-safe

/** Slot plan: ordered sources; stop once we have `n` candidates. */
const SLOTS = {
  "product-battery": {
    n: 4, minW: 800, orient: "any",
    cats: ["Category:Car batteries", "Category:Automobile batteries", "Category:Lead-acid batteries"],
    ov: ["car battery"],
  },
  "product-clutch-kit": {
    n: 4, minW: 800, orient: "any",
    cats: ["Category:Clutch discs", "Category:Clutches", "Category:Automobile clutches"],
    ov: ["clutch disc"],
  },
  "product-water-pump": {
    n: 4, minW: 700, orient: "any",
    search: ["Wasserpumpe Kühlpumpe", "Kühlmittelpumpe Auto"],
    ov: ["car water pump engine"],
  },
  "cat-brakes": {
    n: 4, minW: 1100, orient: "wide",
    cats: ["Category:Brake discs", "Category:Disc brakes", "Category:Brake calipers"],
    ov: ["brake disc car"],
  },
  "cat-suspension": {
    n: 4, minW: 1000, orient: "wide",
    cats: ["Category:Coil springs", "Category:Shock absorbers", "Category:Vehicle suspension"],
    ov: ["car suspension spring"],
  },
  "cat-filters": {
    n: 4, minW: 900, orient: "any",
    cats: ["Category:Oil filters", "Category:Air filters"],
    ov: ["car air filter"],
  },
  "make-citroen": {
    n: 4, minW: 1200, orient: "wide",
    cats: ["Category:Citroën C3 II", "Category:Citroën C3 (A51)", "Category:Citroën C3"],
    ov: ["Citroen C3"],
  },
  "make-ford": {
    n: 4, minW: 1200, orient: "wide",
    cats: ["Category:Ford Transit Custom", "Category:Ford Transit (2013)", "Category:Ford Transit"],
    ov: ["Ford Transit custom"],
  },
  "spotlight": {
    n: 5, minW: 1400, orient: "wide",
    cats: ["Category:Brake discs", "Category:Brake calipers"],
    ov: ["brake disc close up", "car brake rotor"],
  },
  "blog-fitment": {
    n: 4, minW: 1000, orient: "wide",
    cats: ["Category:Auto mechanics", "Category:Mechanics at work"],
    ov: ["mechanic car engine repair"],
  },
  "atelier": {
    n: 4, minW: 1200, orient: "wide",
    cats: ["Category:Auto repair shops", "Category:Automobile repair shops", "Category:Car repair"],
    ov: ["auto repair shop interior"],
  },
};

const BAD_TITLE = /diagram|schema|schematic|drawing|vector|logo|icon|poster|chart|illustration|sketch|clipart|montage|graph|book|page/i;

function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 120);
}

async function commonsCall(params) {
  const url = "https://commons.wikimedia.org/w/api.php?format=json&origin=*&" + params;
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`commons ${res.status}`);
  return res.json();
}

async function fromCategory(cat, { minW, orient }) {
  const data = await commonsCall(
    "action=query&generator=categorymembers&gcmtitle=" + encodeURIComponent(cat) +
    "&gcmtype=file&gcmlimit=60&prop=imageinfo&iiprop=url%7Csize%7Cmime%7Cextmetadata&iiurlwidth=1600",
  );
  const pages = Object.values(data.query?.pages ?? {});
  return pages.map((p) => {
    const ii = p.imageinfo?.[0];
    if (!ii) return null;
    const em = ii.extmetadata ?? {};
    return {
      title: p.title.replace(/^File:/, ""),
      url: ii.thumburl ?? ii.url,
      width: ii.width, height: ii.height, mime: ii.mime,
      artist: stripHtml(em.Artist?.value ?? ""),
      license: em.LicenseShortName?.value ?? "",
      licenseUrl: em.LicenseUrl?.value ?? "",
      page: ii.descriptionurl ?? "",
      source: "commons:" + cat,
    };
  }).filter(Boolean).filter(passes({ minW, orient }));
}

async function fromCommonsSearch(q, { minW, orient }) {
  const data = await commonsCall(
    "action=query&generator=search&gsrsearch=" + encodeURIComponent(q) +
    "&gsrnamespace=6&gsrlimit=25&prop=imageinfo&iiprop=url%7Csize%7Cmime%7Cextmetadata&iiurlwidth=1600",
  );
  const pages = Object.values(data.query?.pages ?? {});
  return pages.map((p) => {
    const ii = p.imageinfo?.[0];
    if (!ii) return null;
    const em = ii.extmetadata ?? {};
    return {
      title: p.title.replace(/^File:/, ""),
      url: ii.thumburl ?? ii.url,
      width: ii.width, height: ii.height, mime: ii.mime,
      artist: stripHtml(em.Artist?.value ?? ""),
      license: em.LicenseShortName?.value ?? "",
      licenseUrl: em.LicenseUrl?.value ?? "",
      page: ii.descriptionurl ?? "",
      source: "search:" + q,
    };
  }).filter(Boolean).filter(passes({ minW, orient }));
}

async function fromOpenverse(q, { minW, orient }) {
  const res = await fetch(
    "https://api.openverse.org/v1/images/?q=" + encodeURIComponent(q) + "&page_size=25",
    { headers: { "user-agent": UA } },
  );
  if (!res.ok) throw new Error(`openverse ${res.status}`);
  const data = await res.json();
  return (data.results ?? [])
    .filter((r) => OK_LICENSES.has(String(r.license).toLowerCase()))
    .map((r) => ({
      title: (r.title ?? "").slice(0, 110),
      url: r.url,
      width: r.width ?? 0,
      height: r.height ?? 0,
      mime: r.mime_type ?? "image/jpeg",
      artist: stripHtml(r.creator ?? ""),
      license: (r.license ?? "").toUpperCase() + (r.license_version ? " " + r.license_version : ""),
      licenseUrl: r.license_url ?? "",
      page: r.foreign_landing_url ?? "",
      source: "openverse:" + (r.source ?? ""),
    }))
    .filter((r) => r.mime === "image/jpeg" || r.mime === "image/png" || !r.mime)
    .filter(passes({ minW, orient }));
}

function passes({ minW, orient }) {
  return (r) => {
    if (r.width && r.width < minW) return false;
    if (orient === "wide" && r.width && r.height && r.width < r.height * 1.15) return false;
    if (BAD_TITLE.test(r.title)) return false;
    if (/\.pdf$|\.tif$|\.svg$/i.test(r.url)) return false;
    return true;
  };
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`dl ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 12_000) throw new Error("too small (likely thumb error)");
  await writeFile(dest, buf);
  return buf.length;
}

async function main() {
  for (const [slot, cfg] of Object.entries(SLOTS)) {
    const dir = join(STAGING, slot);
    await rm(dir, { recursive: true, force: true });
    await mkdir(dir, { recursive: true });
    const picked = [];
    const seen = new Set();

    const trySource = async (fn) => {
      if (picked.length >= cfg.n) return;
      try {
        const results = await fn();
        results.sort((a, b) => (b.width * b.height) - (a.width * a.height));
        for (const r of results) {
          if (picked.length >= cfg.n) break;
          const key = r.title || r.url;
          if (seen.has(key)) continue;
          seen.add(key);
          const idx = picked.length;
          const ext = /\.png($|\?)/i.test(r.url) ? "png" : "jpg";
          try {
            const bytes = await download(r.url, join(dir, `c${idx}.${ext}`));
            picked.push({ file: `c${idx}.${ext}`, bytes, ...r });
          } catch (e) {
            console.log(`  ! ${slot} dl fail [${r.title?.slice(0, 50) ?? r.url}]: ${e.message}`);
          }
        }
      } catch (e) {
        console.log(`  ! ${slot} source fail: ${e.message}`);
      }
    };

    for (const cat of cfg.cats ?? []) await trySource(() => fromCategory(cat, cfg));
    for (const q of cfg.search ?? []) await trySource(() => fromCommonsSearch(q, cfg));
    for (const q of cfg.ov ?? []) await trySource(() => fromOpenverse(q, cfg));

    await writeFile(join(dir, "meta.json"), JSON.stringify(picked, null, 2));
    console.log(`✓ ${slot}: ${picked.length}/${cfg.n}`);
  }
}

main();
