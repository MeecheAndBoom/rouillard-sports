/**
 * Smoke-test the rendered HTML of the storefront.
 *
 *   node scripts\check-rendered.mjs http://localhost:3000
 *
 * Flags the old brand name, the old order prefix and the dashes the design
 * system forbids. Run against a live server.
 */

const base = process.argv[2] ?? "http://localhost:3000";

const ROUTES = [
  "/",
  "/shop",
  "/shop/mercedes-m104-931-36-amg-engine-complet",
  "/blog",
  "/blog/comment-verifier-compatibilite-piece",
  "/about",
  "/why-buy-from-us",
  "/first-time-buyers",
  "/guides",
  "/guides/checking-compatibility-in-3-steps",
  "/tools",
  "/tools/torque-calculator",
  "/tools/maintenance-calendar",
  "/resources",
  "/contact",
  "/help",
  "/testimonials",
  "/retrieve-quote",
  "/affiliate-program",
  "/legal/privacy",
  "/legal/terms",
  "/sitemap",
  "/cart",
  "/checkout",
  "/track",
  "/admin/login",
];

const NEEDLES = [
  { label: "old brand", pattern: /Atelier Richard M[eé]chano|atelierrichardmechano|atelier-richard-mechano/gi },
  { label: "old prefix", pattern: /ARM-[A-Z0-9]{4,}/g },
  { label: "em dash", pattern: /\u2014/g },
  { label: "en dash", pattern: /\u2013/g },
];

let failures = 0;

for (const route of ROUTES) {
  const response = await fetch(base + route);
  const html = await response.text();
  const hits = [];

  if (response.status !== 200) hits.push(`status ${response.status}`);

  for (const { label, pattern } of NEEDLES) {
    pattern.lastIndex = 0;
    const found = html.match(pattern);
    if (found && found.length) {
      const sample = [...new Set(found)].slice(0, 3).join(", ");
      hits.push(`${label} x${found.length} (${sample})`);
    }
  }

  if (hits.length) {
    failures += 1;
    console.log(`FAIL ${route}`);
    for (const hit of hits) console.log(`     ${hit}`);
  } else {
    console.log(`ok   ${route}`);
  }
}

console.log(failures ? `\n${failures} route(s) need attention.` : "\nAll routes clean.");
process.exit(failures ? 1 : 0);
