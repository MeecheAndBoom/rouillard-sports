/**
 * One-shot patcher for scripts/fetch-racing-images.mjs — applies the final
 * filter and slot corrections, verifying every replacement actually landed.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "scripts/fetch-racing-images.mjs";
let src = readFileSync(FILE, "utf8");

const REPLACEMENTS = [
  /* ── Extra hard rejects ─────────────────────────────────────── */
  [
    `  /repair shop interior|empty garage|warehouse interior/i,
];`,
    `  /repair shop interior|empty garage|warehouse interior/i,
  /panneau de pr[eé]vention|panneau de circulation|troph[eé]e|exposition centenaire/i,
  /\\.pdf$|\\.tiff?$|\\.svg$|\\.djvu$|\\.webm$/i,
  /child|children|enfant|baby/i,
  /electric motor|generator set|alternator test bench/i,
  /theft|stolen|carjack/i,
  /traktor|pfl[uü]ger|landmaschine/i,
  /autoshow|auto show|motor show|car show|exhibition|salon de/i,
];`,
  ],
  /* ── Title extension check inside geometryOk ────────────────── */
  [
    `function geometryOk(r, { minW, orient }) {
  if (!r.url) return false;
  // Strip the query string before testing the file extension.
  const path = r.url.split("?")[0].split("#")[0];
  if (/\\.(pdf|tiff?|svg|webm|ogv|gif)$/i.test(path)) return false;`,
    `function geometryOk(r, { minW, orient }) {
  if (!r.url) return false;
  // Strip the query string before testing the file extension.
  const path = r.url.split("?")[0].split("#")[0];
  if (/\\.(pdf|tiff?|svg|webm|ogv|gif)$/i.test(path)) return false;
  // Commons often serves a JPEG thumbnail of a .tif/.pdf original; the file
  // name is the honest signal.
  if (/\\.(pdf|tiff?|svg|djvu|webm|ogv)$/i.test(r.title || "")) return false;`,
  ],
  /* ── Distinct sources for the two editorial slots ───────────── */
  [
    `  "editorial-workshop": {
    n: 5, minW: 1300, orient: "wide", domain: "motorsport",
    sources: [
      { type: "category", q: "Category:24 Hours of Le Mans" },
      { type: "search", q: "race car mechanic pit garage wheel" },
      { type: "search", q: "motorsport team garage race car preparation" },
    ],
  },`,
    `  "editorial-workshop": {
    n: 5, minW: 1300, orient: "wide", domain: "motorsport",
    sources: [
      { type: "category", q: "Category:Pit stops" },
      { type: "search", q: "pit crew mechanic working race car" },
      { type: "search", q: "race car jack tyre change pit" },
    ],
  },`,
  ],
  /* ── editorial-helmet: name the subject in the title ─────────── */
  [
    `  "editorial-helmet": {
    n: 5, minW: 1000, orient: "any", domain: "motorsport",
    sources: [
      { type: "search", q: "racing driver helmet motorsport cockpit" },
      { type: "search", q: "race driver helmet visor" },
      { type: "category", q: "Category:Motorsport" },
    ],
  },`,
    `  "editorial-helmet": {
    n: 5, minW: 1000, orient: "any", domain: "motorsport",
    mustInclude: ["helmet", "casque", "helm"],
    sources: [
      { type: "search", q: "racing helmet driver motorsport" },
      { type: "search", q: "race car driver helmet cockpit visor" },
      { type: "category", q: "Category:Racing drivers" },
    ],
  },`,
  ],
  /* ── Cooling ────────────────────────────────────────────────── */
  [
    `  "cat-cooling": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [
      { type: "category", q: "Category:Automobile radiators" },
      { type: "search", q: "car radiator cooling engine bay" },
    ],
  },`,
    `  "cat-cooling": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [
      { type: "category", q: "Category:Intercoolers" },
      { type: "category", q: "Category:Automobile radiators" },
      { type: "search", q: "radiator grille car cooling" },
      { type: "search", q: "coolant hose pipe car engine" },
    ],
  },`,
  ],
  /* ── Fluids ─────────────────────────────────────────────────── */
  [
    `  "cat-fluids": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [
      { type: "category", q: "Category:Automobile lubricants" },
      { type: "category", q: "Category:Engine oil" },
      { type: "search", q: "engine oil bottle lubricant car service" },
    ],
  },`,
    `  "cat-fluids": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [
      { type: "category", q: "Category:Automobile lubricants" },
      { type: "category", q: "Category:Motor oil" },
      { type: "search", q: "motor oil can lubricant garage" },
      { type: "search", q: "brake fluid coolant bottle workshop" },
    ],
  },`,
  ],
  /* ── Safety ─────────────────────────────────────────────────── */
  [
    `  "cat-safety": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [
      { type: "category", q: "Category:Roll cages" },
      { type: "category", q: "Category:Racing seats" },
      { type: "search", q: "race car roll cage interior harness seat" },
    ],
  },`,
    `  "cat-safety": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [
      { type: "category", q: "Category:Racing seats" },
      { type: "category", q: "Category:Roll cages" },
      { type: "search", q: "race car cockpit harness seat belt" },
      { type: "search", q: "fire extinguisher roll cage race car" },
    ],
  },`,
  ],
  /* ── Tires (new slot) ───────────────────────────────────────── */
  [
    `  "cat-wheels": {`,
    `  "cat-tires": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [
      { type: "category", q: "Category:Automobile tires" },
      { type: "search", q: "racing tyre slick tread close up" },
      { type: "search", q: "slick tyre race car wheel" },
    ],
  },
  "cat-wheels": {`,
  ],
  /* ── Caterham -> Citroen + Ford ─────────────────────────────── */
  [
    `  "make-caterham": {
    n: 4, minW: 1000, orient: "wide", domain: "motorsport",
    mustInclude: ["caterham", "seven", "kit car", "kitcar"],
    sources: [
      { type: "search", q: "Caterham Seven race track" },
      { type: "search", q: "Caterham Superlight racing" },
    ],
  },`,
    `  "make-citroen": {
    n: 4, minW: 1100, orient: "wide", domain: "motorsport",
    mustInclude: ["citro", "citroen", "citroën", "2cv", "ds", "ax"],
    sources: [
      { type: "category", q: "Category:Citroën" },
      { type: "search", q: "Citroen rally race" },
    ],
  },
  "make-ford": {
    n: 4, minW: 1100, orient: "wide", domain: "motorsport",
    mustInclude: ["ford", "escort", "fiesta", "mustang", "sierra", "cougar"],
    sources: [
      { type: "category", q: "Category:Ford Escort" },
      { type: "search", q: "Ford Escort rally race" },
    ],
  },`,
  ],
];

let failed = 0;
for (const [from, to] of REPLACEMENTS) {
  if (!src.includes(from)) {
    console.log("MISS:\n" + from.split("\n")[0].slice(0, 90) + "\n");
    failed++;
    continue;
  }
  src = src.replace(from, to);
  console.log("ok  : " + from.split("\n")[0].slice(0, 90));
}

writeFileSync(FILE, src, "utf8");
console.log(failed ? `\n${failed} replacement(s) missed` : "\nall replacements applied");
