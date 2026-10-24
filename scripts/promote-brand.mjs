/**
 * Promotes the code-native brand mark into the raster assets the browser and
 * the PWA manifest expect: app icons, apple touch icon, favicons and the
 * multi-size .ico bundle.
 *
 * The mark lives in `public/logo-icon.svg` (and `src/components/site/Logo.tsx`),
 * so every raster is generated from it and can never drift from the lockup.
 *
 * Run with `node scripts/promote-brand.mjs`.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const PUBLIC = join(process.cwd(), "public");
const PIT = "#08090a";

const markSvg = await readFile(join(PUBLIC, "logo-icon.svg"), "utf8");

/** Square plate: pit background, mark centred at 76% of the canvas. */
async function plate(size) {
  const inner = Math.round(size * 0.76);
  const pad = Math.round((size - inner) / 2);
  const scaled = Buffer.from(
    markSvg
      .replace(/width="64"/, `width="${inner}"`)
      .replace(/height="64"/, `height="${inner}"`),
  );
  return sharp({
    create: { width: size, height: size, channels: 4, background: PIT },
  })
    .composite([{ input: scaled, left: pad, top: pad }])
    .png()
    .toBuffer();
}

const outputs = [
  ["logo-icon.png", 512],
  ["apple-icon.png", 180],
  ["apple-touch-icon.png", 180],
  ["favicon-96x96.png", 96],
  ["favicon-32x32.png", 32],
  ["favicon-64x64.png", 64],
  ["web-app-manifest-192x192.png", 192],
  ["web-app-manifest-512x512.png", 512],
];

for (const [name, size] of outputs) {
  const buf = await plate(size);
  await writeFile(join(PUBLIC, name), buf);
  console.log(`${name}  ${size}x${size}`);
}

/* ── favicon.ico: 16 / 32 / 48 PNG entries ─────────────────────── */
const icoSizes = [16, 32, 48];
const entries = [];
for (const size of icoSizes) entries.push({ size, data: await plate(size) });

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(entries.length, 4);

let offset = header.length + entries.length * 16;
const dir = [];
for (const entry of entries) {
  const e = Buffer.alloc(16);
  e.writeUInt8(entry.size >= 256 ? 0 : entry.size, 0);
  e.writeUInt8(entry.size >= 256 ? 0 : entry.size, 1);
  e.writeUInt8(0, 2); // palette
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // colour planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(entry.data.length, 8);
  e.writeUInt32LE(offset, 12);
  dir.push(e);
  offset += entry.data.length;
}

await writeFile(
  join(PUBLIC, "favicon.ico"),
  Buffer.concat([header, ...dir, ...entries.map((e) => e.data)]),
);
console.log("favicon.ico  16/32/48");
