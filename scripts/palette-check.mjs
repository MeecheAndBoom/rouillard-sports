import sharp from "sharp";
import fs from "node:fs";

/**
 * Verify a raster brand asset only uses the brand palette:
 * black carbon (#08090a), white marking (#f2f3f4), gold machined (#c9a227).
 */
const GOLD = [0xc9, 0xa2, 0x27];
const WHITE = [0xf2, 0xf3, 0xf4];
const BLACK = [0x08, 0x09, 0x0a];

const near = (a, b, tol = 18) =>
  Math.abs(a[0] - b[0]) <= tol &&
  Math.abs(a[1] - b[1]) <= tol &&
  Math.abs(a[2] - b[2]) <= tol;

for (const file of process.argv.slice(2)) {
  if (!fs.existsSync(file)) {
    console.log(`${file}: missing`);
    continue;
  }
  const img = sharp(file);
  const meta = await img.metadata();
  const { data, info } = await img
    .flatten({ background: "#08090a" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let gold = 0;
  let white = 0;
  let black = 0;
  let other = 0;
  const others = new Map();

  for (let i = 0; i < data.length; i += info.channels) {
    const px = [data[i], data[i + 1], data[i + 2]];
    if (near(px, GOLD)) gold += 1;
    else if (near(px, WHITE)) white += 1;
    else if (near(px, BLACK)) black += 1;
    else {
      other += 1;
      const key = px.map((v) => v.toString(16).padStart(2, "0")).join("");
      others.set(key, (others.get(key) ?? 0) + 1);
    }
  }

  const total = gold + white + black + other;
  const pct = (n) => `${((n / total) * 100).toFixed(1)}%`;
  console.log(`\n${file}  ${meta.width}x${meta.height}`);
  console.log(`  gold   ${pct(gold)}`);
  console.log(`  white  ${pct(white)}`);
  console.log(`  black  ${pct(black)}`);
  console.log(`  other  ${pct(other)}`);
  const top = [...others.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  for (const [key, count] of top) {
    console.log(`    #${key}  ${((count / total) * 100).toFixed(2)}%`);
  }
}
