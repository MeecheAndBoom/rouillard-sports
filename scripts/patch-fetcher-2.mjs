/**
 * Second patcher pass — repoint the remaining thin slots at Commons
 * categories that actually contain modern motorsport photography.
 */
import { readFileSync, writeFileSync } from "node:fs";

const FILE = "scripts/fetch-racing-images.mjs";
let src = readFileSync(FILE, "utf8");

const REPLACEMENTS = [
  [
    `  "hero-track": {
    n: 6, minW: 1500, orient: "wide", domain: "motorsport",
    sources: [
      { type: "category", q: "Category:24 Hours of Le Mans" },
      { type: "category", q: "Category:Formula One" },
      { type: "category", q: "Category:Nürburgring" },
      { type: "search", q: "racing car circuit track race" },
    ],
  },`,
    `  "hero-track": {
    n: 6, minW: 1500, orient: "wide", domain: "motorsport",
    sources: [
      { type: "category", q: "Category:Circuit de Spa-Francorchamps" },
      { type: "category", q: "Category:24 Hours of Le Mans" },
      { type: "category", q: "Category:Formula One" },
    ],
  },`,
  ],
  [
    `  "editorial-paddock": {
    n: 5, minW: 1300, orient: "wide", domain: "motorsport",
    sources: [
      { type: "category", q: "Category:Motor racing" },
      { type: "category", q: "Category:Pit stops" },
      { type: "search", q: "race car pit crew pit lane" },
    ],
  },`,
    `  "editorial-paddock": {
    n: 5, minW: 1300, orient: "wide", domain: "motorsport",
    sources: [
      { type: "category", q: "Category:Motor racing" },
      { type: "category", q: "Category:24 Hours of Le Mans" },
      { type: "search", q: "race car pit crew pit lane" },
    ],
  },`,
  ],
  [
    `  "editorial-workshop": {
    n: 5, minW: 1300, orient: "wide", domain: "motorsport",
    sources: [
      { type: "category", q: "Category:Pit stops" },
      { type: "search", q: "pit crew mechanic working race car" },
      { type: "search", q: "race car jack tyre change pit" },
    ],
  },`,
    `  "editorial-workshop": {
    n: 5, minW: 1300, orient: "wide", domain: "motorsport",
    sources: [
      { type: "category", q: "Category:Automobile repair shops" },
      { type: "category", q: "Category:Revs Institute" },
      { type: "category", q: "Category:Mechanics at work" },
    ],
  },`,
  ],
  [
    `  "editorial-helmet": {
    n: 5, minW: 1000, orient: "any", domain: "motorsport",
    mustInclude: ["helmet", "casque", "helm"],
    sources: [
      { type: "search", q: "racing helmet driver motorsport" },
      { type: "search", q: "race car driver helmet cockpit visor" },
      { type: "category", q: "Category:Racing drivers" },
    ],
  },`,
    `  "editorial-helmet": {
    n: 5, minW: 1000, orient: "any", domain: "motorsport",
    mustInclude: ["helmet", "casque", "helm"],
    sources: [
      { type: "category", q: "Category:Helmets for auto racing" },
      { type: "category", q: "Category:Automobile racing helmets by brand" },
      { type: "category", q: "Category:AGV automobile racing helmets" },
      { type: "category", q: "Category:Sparco automobile racing helmets" },
    ],
  },`,
  ],
  [
    `  "cat-safety": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [
      { type: "category", q: "Category:Racing seats" },
      { type: "category", q: "Category:Roll cages" },
      { type: "search", q: "race car cockpit harness seat belt" },
      { type: "search", q: "fire extinguisher roll cage race car" },
    ],
  },`,
    `  "cat-safety": {
    n: 4, minW: 1000, orient: "wide", domain: "part",
    sources: [
      { type: "category", q: "Category:Racing seats" },
      { type: "category", q: "Category:Automobile safety equipment" },
      { type: "search", q: "race car cockpit harness seat belt" },
      { type: "search", q: "roll cage race car interior" },
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

writeFileSync(FILE, src, "utf8");
console.log(failed ? `\n${failed} missed` : "\nall replacements applied");
