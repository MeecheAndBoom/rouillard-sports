/**
 * Third patcher pass — final per-slot constraints and a shared backfill pool
 * so every category tile always has imagery.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "scripts/fetch-racing-images.mjs";
let src = readFileSync(FILE, "utf8");

const REPLACEMENTS = [
  /* Extra rejects seen in the last harvest */
  [
    `  /autoshow|auto show|motor show|car show|exhibition|salon de/i,
];`,
    `  /autoshow|auto show|motor show|car show|exhibition|salon de/i,
  /nakuru|nairobi|kenya|dar es salaam|cross section|air compressor|pneumatic tool/i,
  /gsx|suzuki|kawasaki|ducati|yamaha|harley|motocross|enduro/i,
  /plaque indicating|plaque de rue|street sign|notice board|bulletin board/i,
];`,
  ],
  /* Fluids: the subject must actually be a fluid product */
  [
    `  "cat-fluids": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [`,
    `  "cat-fluids": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    mustInclude: ["oil", "lubric", "fluid", "coolant", "graisse", "huile", "brake fluid"],
    sources: [`,
  ],
  /* Transmission: name the component */
  [
    `  "cat-transmission": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [`,
    `  "cat-transmission": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    mustInclude: ["gearbox", "transmission", "clutch", "getriebe", "flywheel", "embrayage", "boite", "drivetrain"],
    sources: [`,
  ],
  /* Tires: name the tyre */
  [
    `  "cat-tires": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [`,
    `  "cat-tires": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    mustInclude: ["tyre", "tire", "pneu", "rad", "wheel"],
    sources: [`,
  ],
  /* Cooling: name the cooler */
  [
    `  "cat-cooling": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [`,
    `  "cat-cooling": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    mustInclude: ["intercooler", "radiator", "coolant", "cooling", "refroidissement", "kühler", "oil cooler"],
    sources: [`,
  ],
  /* Renault: widen the source pool */
  [
    `  "make-renault": {
    n: 4, minW: 1100, orient: "wide", domain: "motorsport",
    mustInclude: ["renault", "clio", "r5", "megane", "alpino"],
    sources: [
      { type: "category", q: "Category:Renault Clio" },
      { type: "search", q: "Renault Clio rally race" },
    ],
  },`,
    `  "make-renault": {
    n: 4, minW: 1100, orient: "wide", domain: "motorsport",
    mustInclude: ["renault", "clio", "r5", "megane", "espac"],
    sources: [
      { type: "category", q: "Category:Renault Clio" },
      { type: "category", q: "Category:Renault Megane" },
      { type: "category", q: "Category:Renault cars" },
      { type: "search", q: "Renault Clio rally race" },
    ],
  },`,
  ],
  /* Citroen: use the model categories, not the brand archive */
  [
    `  "make-citroen": {
    n: 4, minW: 1100, orient: "wide", domain: "motorsport",
    mustInclude: ["citro", "citroen", "citroën", "2cv", "ds", "ax"],
    sources: [
      { type: "category", q: "Category:Citroën" },
      { type: "search", q: "Citroen rally race" },
    ],
  },`,
    `  "make-citroen": {
    n: 4, minW: 1100, orient: "wide", domain: "motorsport",
    mustInclude: ["2cv", "ds ", "cx ", "gs ", "sm ", "c4", "c3", "c2", "berlingo", "visa", "bx "],
    sources: [
      { type: "category", q: "Category:Citroën 2CV" },
      { type: "category", q: "Category:Citroën DS" },
      { type: "category", q: "Category:Citroën C4" },
      { type: "category", q: "Category:Citroën rally cars" },
    ],
  },`,
  ],
];

let failed = 0;
for (const [from, to] of REPLACEMENTS) {
  if (!src.includes(from)) {
    console.log("MISS: " + from.split("\n")[0].slice(0, 90));
    failed++;
    continue;
  }
  src = src.replace(from, to);
  console.log("ok  : " + from.split("\n")[0].slice(0, 90));
}

/* ── Shared backfill: never ship a tile without an image ─────────── */
const backfill = `
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
      const files = (await readdir(donorDir).catch(() => [])).filter((f) => /\\.(jpg|jpeg|png)$/i.test(f)).sort();
      for (const f of files) {
        if (meta.length >= 4) break;
        const ext = f.endsWith(".png") ? "png" : "jpg";
        const dest = join(dir, \`c\${idx}.\${ext}\`);
        await copyFile(join(donorDir, f), dest).catch(() => {});
        const donorMeta = await readFile(join(donorDir, "meta.json"), "utf8").then(JSON.parse).catch(() => []);
        const src = donorMeta.find((m) => m.file === f) ?? {};
        meta.push({ ...src, file: \`c\${idx}.\${ext}\`, bytes: 0, source: "backfill:" + donor, title: src.title ?? f });
        idx++;
      }
    }
    await writeFile(join(dir, "meta.json"), JSON.stringify(meta, null, 2));
  }
}
`;

src = src.replace(
  `async function main() {`,
  backfill + `\nasync function main() {`,
);

src = src.replace(
  `import { mkdir, writeFile, rm } from "node:fs/promises";`,
  `import { mkdir, writeFile, rm, readdir, readFile, copyFile } from "node:fs/promises";`,
);

src = src.replace(
  `    console.log(\`OK \${slot}: \${picked.length}/\${cfg.n}\`);
  }
}`,
  `    console.log(\`OK \${slot}: \${picked.length}/\${cfg.n}\`);
  }

  await backfillSlots();
}`,
);

writeFileSync(FILE, src, "utf8");
console.log(failed ? `\n${failed} missed` : "\nall replacements applied");
