import fs from "node:fs";

const DASH = "\u2014";
const ENDASH = "\u2013";

const edits = [
  ["src/app/layout.tsx", "template: `%s " + DASH + " ${t.meta.siteName}`,", "template: `%s | ${t.meta.siteName}`,"],
  [
    "src/lib/seo.ts",
    "${t.product.partNumber} " + DASH + " ${t.meta.siteName}",
    "${t.product.partNumber} | ${t.meta.siteName}",
  ],
  [
    "src/lib/constants.ts",
    '{ days: "Lundi ' + ENDASH + ' Vendredi", daysEn: "Monday ' + ENDASH + ' Friday", time: "8:00 ' + ENDASH + ' 18:30" },',
    '{ days: "Lundi - Vendredi", daysEn: "Monday - Friday", time: "8:00 - 18:30" },',
  ],
  [
    "src/lib/constants.ts",
    '{ days: "Samedi", daysEn: "Saturday", time: "9:00 ' + ENDASH + ' 13:00" },',
    '{ days: "Samedi", daysEn: "Saturday", time: "9:00 - 13:00" },',
  ],
  [
    "src/components/site/Footer.tsx",
    "\u00a9 {year} {t.meta.siteName.toUpperCase()} " + DASH + " {t.footer.rights}",
    "\u00a9 {year} {t.meta.siteName.toUpperCase()} | {t.footer.rights}",
  ],
];

for (const [file, from, to] of edits) {
  let s = fs.readFileSync(file, "utf8");
  if (!s.includes(from)) {
    console.log("MISS", file, JSON.stringify(from));
    continue;
  }
  s = s.split(from).join(to);
  fs.writeFileSync(file, s, "utf8");
  console.log("ok", file);
}
