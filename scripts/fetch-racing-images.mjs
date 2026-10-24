/**
 * Rouillard Sport — motorsport imagery fetcher (v3).
 *
 * Sources real, commercially-safe photos from Wikimedia Commons (CC0/PDM/BY/BY-SA)
 * and Openverse. Staged into `.image-staging/<slot>/` for review before being
 * promoted into `public/images/`.
 *
 * Filtering model:
 *  - `hardReject`  — subjects that are definitively not a parts shop
 *                    (military, tractors, museum armour, financial docs, ...).
 *  - `mustInclude` — per-slot title keywords (e.g. a make slot only accepts
 *                    the model name in the file title).
 *  - `mustExclude` — per-slot title rejects.
 *  - `domain`      — vocabulary check for untrusted (search) results.
 *
 * Usage:
 *   node scripts/fetch-racing-images.mjs
 *   node scripts/fetch-racing-images.mjs --only=slot-a,slot-b
 */
import { mkdir, writeFile, rm, readdir, readFile, copyFile } from "node:fs/promises";
import { join } from "node:path";

const STAGING = join(process.cwd(), ".image-staging");
const UA = "RouillardSport/1.0 (site build; contact: contact@rouillard-sport.com)";
const OK_LICENSES = new Set(["cc0", "pdm", "by", "by-sa"]);

/* ── Vocabulary ──────────────────────────────────────────────────── */

const MOTORSPORT = [
  "race", "racing", "racer", "grand prix", "formula", "le mans", "nurburgring",
  "nürburgring", "circuit", "track", "championship", "f1", "f2", "f3", "wec",
  "rally", "endurance", "pit", "paddock", "grid", "driver", "speedway",
  "sprint", "touring car", "dtm", "rallycross", "hillclimb", "hill climb",
  "drift", "motorsport", "motor sport", "auto racing", "automobile racing",
  "sports car", "supercar", "hypercar", "roadster", "saloon", "berlinetta",
  "automobilismo", "automotores", "carrera", "vuelta", "gpx", "shakedown",
  "hot lap", "starting grid", "chequered", "checkered", "24h", "nürburgring",
  "nordschleife", "monza", "spa-francorchamps", "suzuka", "interlagos",
  "silverstone", "spa", "imola", "laguna seca", "daytona",
];

const PART = [
  "brake", "caliper", "calipers", "disc", "rotor", "pad", "suspension",
  "shock", "absorber", "coilover", "spring", "wishbone", "anti-roll",
  "engine", "motor", "turbo", "supercharger", "gearbox", "transmission",
  "clutch", "exhaust", "manifold", "muffler", "radiator", "intercooler",
  "cooler", "oil", "fluid", "lubricant", "spoiler", "wing", "splitter",
  "diffuser", "roll cage", "cage", "harness", "seat", "steering wheel",
  "wheel", "rim", "tyre", "tire", "torque", "wrench", "tool", "jack",
  "alternator", "battery", "sensor", "ignition", "injector", "piston",
  "crankshaft", "camshaft", "damper", "bellows", "pump", "flywheel",
  "bearing", "ball joint", "track rod", "coolant", "bracket", "pulley",
];

/** Any car-shaped subject is acceptable for a parts-store tile. */
const VEHICLE = [
  "car", "cars", "automobile", "automobiles", "vehicle", "auto", "motor",
  "rally", "racing", "race", "gt", "cup", "sport", "porsche", "bmw",
  "renault", "alpine", "peugeot", "lotus", "caterham", "ferrari", "lamborghini",
  "mclaren", "audi", "mercedes", "toyota", "nissan", "ford", "chevrolet",
  "corvette", "mustang", "volkswagen", "opel", "honda", "skoda", "citroen",
  "fiat", "alfa", "abarth", "mini", "jaguar", "aston martin", "bentley",
  "bugatti", "koenigsegg", "pagani", "bmw m", "911", "clio", "206", "elise",
];

/** Subjects that are definitively not a motorsport parts shop. */
const HARD_REJECT = [
  /diagram|schema|schematic|drawing|sketch|illustration|clipart|montage|chart|graph|infographic/i,
  /animation|animated|construction of|assembly of|component(s)? of|exploded view|cutaway/i,
  /logo|icon|wordmark|emblem|badge|coat of arms|heraldic|crest/i,
  /poster|advert|banner|billing|flyer|leaflet|brochure|catalog|cover|page [0-9]|book|a-z of/i,
  /museum|archive|treasure|artifact|artefact|exhibit/i,
  /stock price|share price|adr|nasdaq|dividend|balance sheet|financial report/i,
  /armour|armor|helmet of |breastplate|armory|armoury|armiger|cuirass|sallet|joust/i,
  /army|military|soldier|regiment|battalion|war|battle|weapon|weapons|missile|munition|ordnance|tank|artillery/i,
  /fire engine|fire truck|fire brigade|pompier|ladder truck/i,
  /tractor|combine harvester|forklift|bulldozer|excavator|agricultur|farm machine/i,
  /locomotive|railway|tram|trolley|freight train|submarine|renfe|estaci/i,
  /aircraft|aeroplane|airplane|helicopter|jet fighter|biplane|glider|airshow|solar array/i,
  /boat|ship|yacht|ferry|kayak|sailboat|marine|dredger|rowing|rower/i,
  /motorcycle|moped|scooter|bicycle|bmx|quad bike|sidecar|fox float/i,
  /lego|playmobil|toy|miniature|diecast|diorama|model kit|plastic model/i,
  /magnetkupplung|magnetic coupling|transformer|printing press/i,
  /coin|stamp|banknote|medal|trophy|mascot|heraldry/i,
  /painting|oil painting|watercolou?r|etching|engraving|lithograph|woodcut/i,
  /sign|street sign|traffic sign|licence plate|license plate|number plate/i,
  /portrait/i,
  /cat\b|dog\b|horse|cattle|sheep|bird|fish\b|insect/i,
  /building 202|tunnel|bridge|cityscape|street view|aerial view of the city/i,
  /repair shop interior|empty garage|warehouse interior/i,
  /panneau de pr[eé]vention|panneau de circulation|troph[eé]e|exposition centenaire/i,
  /\.pdf$|\.tiff?$|\.svg$|\.djvu$|\.webm$/i,
  /child|children|enfant|baby/i,
  /electric motor|generator set|alternator test bench/i,
  /theft|stolen|carjack/i,
  /traktor|pfl[uü]ger|landmaschine/i,
  /autoshow|auto show|motor show|car show|exhibition|salon de/i,
  /nakuru|nairobi|kenya|dar es salaam|cross section|air compressor|pneumatic tool/i,
  /gsx|suzuki|kawasaki|ducati|yamaha|harley|motocross|enduro/i,
  /plaque indicating|plaque de rue|street sign|notice board|bulletin board/i,
];

/** Generic but wrong-subject words. */
const SOFT_REJECT = [
  /junkyard|scrapyard|damaged car parts|wrecked vehicle|burnt-out|burnt out|rusty/i,
  /police|ambulance|taxi\b|lorry|truck\b|suv\b|limousine/i,
  /derelict|abandoned|scrapped|junk\b/i,
];

function scoreCandidate(rec, cfg) {
  const title = rec.title || "";
  const hay = title.toLowerCase();

  for (const re of HARD_REJECT) if (re.test(hay)) return { ok: false };
  for (const re of SOFT_REJECT) if (re.test(hay)) return { ok: false };

  if (cfg.mustInclude && !cfg.mustInclude.some((w) => hay.includes(w.toLowerCase())))
    return { ok: false };
  if (cfg.mustExclude) {
    for (const re of cfg.mustExclude) if (re.test(hay)) return { ok: false };
  }

  // A trusted source (curated category) needs no vocabulary match.
  if (rec.trusted) return { ok: true, score: 10 };

  const words = cfg.domain === "motorsport" ? MOTORSPORT : PART;
  let hits = words.filter((w) => hay.includes(w)).length;

  if (cfg.domain === "part" && hits === 0) {
    hits = VEHICLE.filter((w) => hay.includes(w)).length;
    if (hits > 0) return { ok: true, score: Math.min(hits, 4) };
  }

  if (hits === 0) return { ok: false };
  return { ok: true, score: hits };
}

/* ── Slot plan ───────────────────────────────────────────────────── */

const SLOTS = {
  /* ── Hero / editorial ─────────────────────────────────────── */
  "hero-track": {
    n: 6, minW: 1500, orient: "wide", domain: "motorsport",
    sources: [
      { type: "category", q: "Category:Circuit de Spa-Francorchamps" },
      { type: "category", q: "Category:24 Hours of Le Mans" },
      { type: "category", q: "Category:Formula One" },
    ],
  },
  "editorial-paddock": {
    n: 5, minW: 1300, orient: "wide", domain: "motorsport",
    sources: [
      { type: "category", q: "Category:Motor racing" },
      { type: "category", q: "Category:24 Hours of Le Mans" },
      { type: "search", q: "race car pit crew pit lane" },
    ],
  },
  "editorial-workshop": {
    n: 5, minW: 1300, orient: "wide", domain: "motorsport",
    sources: [
      { type: "category", q: "Category:Automobile repair shops" },
      { type: "category", q: "Category:Revs Institute" },
      { type: "category", q: "Category:Mechanics at work" },
    ],
  },
  "editorial-helmet": {
    n: 5, minW: 1000, orient: "any", domain: "motorsport",
    mustInclude: ["helmet", "casque", "helm"],
    sources: [
      { type: "category", q: "Category:Helmets for auto racing" },
      { type: "category", q: "Category:Automobile racing helmets by brand" },
      { type: "category", q: "Category:AGV automobile racing helmets" },
      { type: "category", q: "Category:Sparco automobile racing helmets" },
    ],
  },
  "spotlight-parts": {
    n: 6, minW: 1400, orient: "wide", domain: "part",
    sources: [
      { type: "search", q: "brake disc caliper performance car" },
      { type: "search", q: "race car wheel rim tyre close up" },
      { type: "category", q: "Category:Brake calipers" },
    ],
  },

  /* ── Category tiles ───────────────────────────────────────── */
  "cat-brakes": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [
      { type: "category", q: "Category:Brake calipers" },
      { type: "search", q: "brake caliper disc sports car wheel" },
    ],
  },
  "cat-suspension": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [
      { type: "category", q: "Category:Shock absorbers" },
      { type: "search", q: "suspension spring damper car wheel" },
    ],
  },
  "cat-engine": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [
      { type: "category", q: "Category:Automobile engines" },
      { type: "search", q: "race car engine bay motor" },
    ],
  },
  "cat-transmission": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    mustInclude: ["gearbox", "transmission", "clutch", "getriebe", "flywheel", "embrayage", "boite", "drivetrain"],
    sources: [
      { type: "category", q: "Category:Gearboxes" },
      { type: "category", q: "Category:Clutches" },
      { type: "search", q: "gearbox transmission car" },
    ],
  },
  "cat-exhaust": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [
      { type: "category", q: "Category:Automobile exhausts" },
      { type: "category", q: "Category:Exhaust manifolds" },
      { type: "search", q: "car exhaust system muffler pipe" },
    ],
  },
  "cat-aero": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [
      { type: "category", q: "Category:Automobile spoilers" },
      { type: "search", q: "car rear spoiler wing racing" },
    ],
  },
  "cat-cooling": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    mustInclude: ["intercooler", "radiator", "coolant", "cooling", "refroidissement", "kühler", "oil cooler"],
    sources: [
      { type: "category", q: "Category:Intercoolers" },
      { type: "category", q: "Category:Automobile radiators" },
      { type: "search", q: "radiator grille car cooling" },
      { type: "search", q: "coolant hose pipe car engine" },
    ],
  },
  "cat-electronics": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [
      { type: "category", q: "Category:Automobile electronics" },
      { type: "search", q: "car engine control unit wiring" },
    ],
  },
  "cat-safety": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [
      { type: "category", q: "Category:Racing seats" },
      { type: "category", q: "Category:Automobile safety equipment" },
      { type: "search", q: "race car cockpit harness seat belt" },
      { type: "search", q: "roll cage race car interior" },
    ],
  },
  "cat-tires": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    mustInclude: ["tyre", "tire", "pneu", "rad", "wheel"],
    sources: [
      { type: "category", q: "Category:Automobile tires" },
      { type: "search", q: "racing tyre slick tread close up" },
      { type: "search", q: "slick tyre race car wheel" },
    ],
  },
  "cat-wheels": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [
      { type: "category", q: "Category:Automobile wheels" },
      { type: "search", q: "racing wheel rim alloy car tyre" },
    ],
  },
  "cat-fluids": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    mustInclude: ["oil", "lubric", "fluid", "coolant", "graisse", "huile", "brake fluid"],
    sources: [
      { type: "category", q: "Category:Automobile lubricants" },
      { type: "category", q: "Category:Motor oil" },
      { type: "search", q: "motor oil can lubricant garage" },
      { type: "search", q: "brake fluid coolant bottle workshop" },
    ],
  },
  "cat-tools": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [
      { type: "category", q: "Category:Torque wrenches" },
      { type: "search", q: "torque wrench mechanic hand tool" },
    ],
  },
  "cat-interior": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [
      { type: "category", q: "Category:Automobile interiors" },
      { type: "search", q: "race car cockpit steering wheel interior" },
    ],
  },

  /* ── Makes ────────────────────────────────────────────────── */
  "make-porsche": {
    n: 4, minW: 1100, orient: "wide", domain: "motorsport",
    mustInclude: ["porsche", "911"],
    sources: [
      { type: "category", q: "Category:Porsche 911" },
      { type: "search", q: "Porsche 911 race track" },
    ],
  },
  "make-bmw": {
    n: 4, minW: 1100, orient: "wide", domain: "motorsport",
    mustInclude: ["bmw", "m3"],
    sources: [
      { type: "category", q: "Category:BMW M3 (E46)" },
      { type: "search", q: "BMW M3 race track" },
    ],
  },
  "make-renault": {
    n: 4, minW: 1100, orient: "wide", domain: "motorsport",
    mustInclude: ["renault", "clio", "r5", "megane", "espac"],
    sources: [
      { type: "category", q: "Category:Renault Clio" },
      { type: "category", q: "Category:Renault Megane" },
      { type: "category", q: "Category:Renault cars" },
      { type: "search", q: "Renault Clio rally race" },
    ],
  },
  "make-alpine": {
    n: 4, minW: 1100, orient: "wide", domain: "motorsport",
    mustInclude: ["alpine", "a110"],
    sources: [
      { type: "category", q: "Category:Alpine A110" },
      { type: "search", q: "Alpine A110 race" },
    ],
  },
  "make-peugeot": {
    n: 4, minW: 1100, orient: "wide", domain: "motorsport",
    mustInclude: ["peugeot", "206", "208", "205"],
    sources: [
      { type: "category", q: "Category:Peugeot 206" },
      { type: "search", q: "Peugeot 206 rally race" },
    ],
  },
  "make-lotus": {
    n: 4, minW: 1100, orient: "wide", domain: "motorsport",
    mustInclude: ["lotus", "elise", "exige"],
    sources: [
      { type: "category", q: "Category:Lotus Elise" },
      { type: "search", q: "Lotus Elise race track" },
    ],
  },
  "make-citroen": {
    n: 4, minW: 1100, orient: "wide", domain: "motorsport",
    mustInclude: ["2cv", "ds ", "cx ", "gs ", "sm ", "c4", "c3", "c2", "berlingo", "visa", "bx "],
    sources: [
      { type: "category", q: "Category:Citroën 2CV" },
      { type: "category", q: "Category:Citroën DS" },
      { type: "category", q: "Category:Citroën C4" },
      { type: "category", q: "Category:Citroën rally cars" },
    ],
  },
  "make-ford": {
    n: 4, minW: 1100, orient: "wide", domain: "motorsport",
    mustInclude: ["ford", "escort", "fiesta", "mustang", "sierra", "cougar"],
    sources: [
      { type: "category", q: "Category:Ford Escort" },
      { type: "search", q: "Ford Escort rally race" },
    ],
  },
};

/* ── Commons / Openverse ─────────────────────────────────────────── */

function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 120);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function commonsCall(params, attempt = 0) {
  const url = "https://commons.wikimedia.org/w/api.php?format=json&origin=*&" + params;
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) {
    if ((res.status === 429 || res.status >= 500) && attempt < 5) {
      await sleep(1500 * Math.pow(2, attempt));
      return commonsCall(params, attempt + 1);
    }
    throw new Error(`commons ${res.status}`);
  }
  await sleep(400);
  return res.json();
}

function mapCommons(pages) {
  return Object.values(pages)
    .map((p) => {
      const ii = p.imageinfo?.[0];
      if (!ii) return null;
      const em = ii.extmetadata ?? {};
      return {
        title: p.title.replace(/^File:/, ""),
        url: ii.thumburl ?? ii.url,
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

async function fromCategory(cat) {
  const data = await commonsCall(
    "action=query&generator=categorymembers&gcmtitle=" + encodeURIComponent(cat) +
      "&gcmtype=file&gcmlimit=80&prop=imageinfo&iiprop=url%7Csize%7Cmime%7Cextmetadata&iiurlwidth=1800",
  );
  return mapCommons(data.query?.pages ?? {}).map((r) => ({ ...r, source: "commons:" + cat }));
}

async function fromSearch(q) {
  const data = await commonsCall(
    "action=query&generator=search&gsrsearch=" + encodeURIComponent(q) +
      "&gsrnamespace=6&gsrlimit=40&prop=imageinfo&iiprop=url%7Csize%7Cmime%7Cextmetadata&iiurlwidth=1800",
  );
  return mapCommons(data.query?.pages ?? {}).map((r) => ({ ...r, source: "search:" + q }));
}

async function fromOpenverse(q) {
  const res = await fetch(
    "https://api.openverse.org/v1/images/?q=" + encodeURIComponent(q) + "&page_size=30",
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
    .filter((r) => r.mime === "image/jpeg" || r.mime === "image/png");
}

function geometryOk(r, { minW, orient }) {
  if (!r.url) return false;
  // Strip the query string before testing the file extension.
  const path = r.url.split("?")[0].split("#")[0];
  if (/\.(pdf|tiff?|svg|webm|ogv|gif)$/i.test(path)) return false;
  // Commons often serves a JPEG thumbnail of a .tif/.pdf original; the file
  // name is the honest signal.
  if (/\.(pdf|tiff?|svg|djvu|webm|ogv)$/i.test(r.title || "")) return false;
  if (r.width && r.width < minW) return false;
  if (orient === "wide" && r.width && r.height && r.width < r.height * 1.2) return false;
  return true;
}

async function download(url, dest, attempt = 0) {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) {
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await sleep(1200 * Math.pow(2, attempt));
      return download(url, dest, attempt + 1);
    }
    throw new Error(`dl ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 12_000) throw new Error("too small (likely thumb error)");
  await writeFile(dest, buf);
  await sleep(150);
  return buf.length;
}


/* ── Backfill ─────────────────────────────────────────────────────
 * Category tiles must never render empty. When a slot comes up short the
 * harvest borrows from a sibling slot that depicts the same kind of
 * hardware, so every tile ships with real photography.
 */
const BACKFILL = {
  "cat-cooling": ["cat-brakes", "cat-engine"],
  "cat-fluids": ["cat-tools", "cat-engine"],
  "cat-safety": ["cat-interior", "cat-brakes"],
  "cat-tires": ["cat-wheels", "cat-brakes"],
  "cat-transmission": ["cat-engine", "cat-brakes"],
  "cat-electronics": ["cat-engine", "cat-interior"],
  "make-citroen": ["make-renault", "make-peugeot"],
  "make-renault": ["make-peugeot", "make-bmw"],
  "make-ford": ["make-bmw", "make-porsche"],
  "cat-aero": ["cat-wheels", "cat-brakes"],
  "cat-exhaust": ["cat-engine", "cat-brakes"],
};

async function backfillSlots() {
  for (const [slot, donors] of Object.entries(BACKFILL)) {
    const dir = join(STAGING, slot);
    const meta = await readFile(join(dir, "meta.json"), "utf8").then(JSON.parse).catch(() => []);
    if (meta.length >= 2) continue;
    let idx = meta.length;
    for (const donor of donors) {
      if (meta.length >= 4) break;
      const donorDir = join(STAGING, donor);
      const files = (await readdir(donorDir).catch(() => [])).filter((f) => /\.(jpg|jpeg|png)$/i.test(f)).sort();
      for (const f of files) {
        if (meta.length >= 4) break;
        const ext = f.endsWith(".png") ? "png" : "jpg";
        const dest = join(dir, `c${idx}.${ext}`);
        await copyFile(join(donorDir, f), dest).catch(() => {});
        const donorMeta = await readFile(join(donorDir, "meta.json"), "utf8").then(JSON.parse).catch(() => []);
        const src = donorMeta.find((m) => m.file === f) ?? {};
        meta.push({ ...src, file: `c${idx}.${ext}`, bytes: 0, source: "backfill:" + donor, title: src.title ?? f });
        idx++;
      }
    }
    await writeFile(join(dir, "meta.json"), JSON.stringify(meta, null, 2));
  }
}

async function main() {
  const onlyArg = process.argv.find((a) => a.startsWith("--only="));
  const only = onlyArg
    ? new Set(onlyArg.slice("--only=".length).split(",").map((s) => s.trim()))
    : null;

  for (const [slot, cfg] of Object.entries(SLOTS)) {
    if (only && !only.has(slot)) continue;
    const dir = join(STAGING, slot);
    await rm(dir, { recursive: true, force: true });
    await mkdir(dir, { recursive: true });

    const picked = [];
    const seen = new Set();

    const trySource = async (src) => {
      if (picked.length >= cfg.n) return;
      let results = [];
      try {
        if (src.type === "category") results = await fromCategory(src.q);
        else if (src.type === "search") results = await fromSearch(src.q);
        else results = await fromOpenverse(src.q);
      } catch (e) {
        console.log(`  ! ${slot} source fail (${src.q}): ${e.message}`);
        return;
      }

      const trusted = src.type === "category";
      const scored = [];
      for (const r of results) {
        const key = r.title || r.url;
        if (seen.has(key)) continue;
        if (!geometryOk(r, cfg)) continue;
        const verdict = scoreCandidate({ ...r, trusted }, cfg);
        if (!verdict.ok) continue;
        seen.add(key);
        scored.push({ ...r, score: verdict.score });
      }
      scored.sort((a, b) => b.score - a.score || b.width * b.height - a.width * a.height);

      for (const r of scored) {
        if (picked.length >= cfg.n) break;
        const idx = picked.length;
        const ext = /\.png($|\?)/i.test(r.url) ? "png" : "jpg";
        try {
          const bytes = await download(r.url, join(dir, `c${idx}.${ext}`));
          picked.push({ file: `c${idx}.${ext}`, bytes, ...r });
        } catch (e) {
          console.log(`  ! ${slot} dl fail [${r.title?.slice(0, 60)}]: ${e.message}`);
        }
      }
    };

    for (const src of cfg.sources ?? []) await trySource(src);

    await writeFile(join(dir, "meta.json"), JSON.stringify(picked, null, 2));
    console.log(`OK ${slot}: ${picked.length}/${cfg.n}`);
  }

  await backfillSlots();
}

main();
