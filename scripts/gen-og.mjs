/**
 * Renders the two raster brand artefacts the site still needs:
 *   - public/rouillard_sport_open_graph.png  (1200x630 social card)
 *   - public/full-logo.png                   (960x200 transparent wordmark)
 *
 * Both are drawn as SVG and rasterised with sharp, using the system
 * Bahnschrift Condensed face (a DIN-like condensed grotesque) so the plates
 * match the web lockup without depending on a font CDN at build time.
 *
 * Run with `node scripts/gen-og.mjs`.
 */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const PUBLIC = join(process.cwd(), "public");
const PIT = "#08090a";
const GOLD = "#c9a227";
const PAPER = "#f2f3f4";

const DISPLAY = "Bahnschrift Condensed";
const MONO = "Consolas";

/** The mark: gold speed chevron with a chequered-flag corner. */
function mark(x, y, size, opaque = false) {
  const u = size / 64;
  return `
  <g transform="translate(${x} ${y})">
    ${opaque ? `<rect width="64" height="64" fill="${PIT}" transform="scale(${u})"/>` : ""}
    <g fill="${PAPER}" transform="scale(${u})">
      <rect x="32" y="0" width="16" height="16"/>
      <rect x="48" y="16" width="16" height="16"/>
    </g>
    <path d="M11 13 L35 32 L11 51" fill="none" stroke="${GOLD}" stroke-width="9"
      stroke-linecap="butt" stroke-linejoin="miter" transform="scale(${u})"/>
  </g>`;
}

/** Chequered band along the bottom edge. */
function chequered(w, h, y, cell) {
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);
  let out = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2 === 0) continue;
      out += `<rect x="${c * cell}" y="${y + r * cell}" width="${cell}" height="${cell}" fill="${PAPER}"/>`;
    }
  }
  return out;
}

/* ── Open graph card ─────────────────────────────────────────────── */

const W = 1200;
const H = 630;

const ogForeground = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  ${chequered(W, 26, H - 26, 26)}

  <!-- diagonal speed stripes -->
  <g stroke="${GOLD}" stroke-opacity="0.09" stroke-width="2">
    ${Array.from({ length: 40 }, (_, i) => {
      const x = -H + i * 40;
      return `<line x1="${x}" y1="${H}" x2="${x + H}" y2="0"/>`;
    }).join("")}
  </g>

  ${mark(84, 92, 78, true)}

  <text x="184" y="152" font-family="${DISPLAY}" font-size="74" font-weight="700" letter-spacing="1">
    <tspan fill="${PAPER}">ROUILLARD</tspan><tspan fill="${GOLD}" dx="20">SPORT</tspan>
  </text>

  <rect x="84" y="204" width="140" height="4" fill="${GOLD}"/>

  <text x="84" y="290" font-family="${DISPLAY}" font-size="48" font-weight="600" fill="${PAPER}">LA PERFORMANCE SE PRÉPARE</text>
  <text x="84" y="344" font-family="${DISPLAY}" font-size="48" font-weight="600" fill="${PAPER}">SOUS LE CAPOT.</text>

  <text x="84" y="578" font-family="${MONO}" font-size="17" fill="#9aa2ab">PIÈCES PERFORMANCE   /   DÉCINES-CHARPIEU   /   ROUILLARD-SPORT.COM</text>
</svg>`;

/** Dark scrim so the type stays legible over the photograph. */
const scrim = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${PIT}" stop-opacity="0.96"/>
      <stop offset="0.5" stop-color="${PIT}" stop-opacity="0.8"/>
      <stop offset="1" stop-color="${PIT}" stop-opacity="0.28"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
</svg>`;

await sharp(join(PUBLIC, "images/editorial/hero-3.jpg"))
  .resize(W, H, { fit: "cover", position: "attention" })
  .modulate({ saturation: 0.6, brightness: 0.92 })
  .composite([
    { input: Buffer.from(scrim), left: 0, top: 0 },
    { input: Buffer.from(ogForeground), left: 0, top: 0 },
  ])
  .png()
  .toFile(join(PUBLIC, "rouillard_sport_open_graph.png"));

console.log("rouillard_sport_open_graph.png  1200x630");

/* ── Wordmark (transparent) ──────────────────────────────────────── */

const wordmark = `
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="200">
  ${mark(20, 32, 136)}
  <text x="186" y="128" font-family="${DISPLAY}" font-size="96" font-weight="700" letter-spacing="1.5">
    <tspan fill="${PAPER}">ROUILLARD</tspan><tspan fill="${GOLD}" dx="26">SPORT</tspan>
  </text>
  <text x="190" y="168" font-family="${MONO}" font-size="17" fill="#7b838d" letter-spacing="6">COMPETITION PARTS</text>
</svg>`;

await sharp(Buffer.from(wordmark)).png().toFile(join(PUBLIC, "full-logo.png"));
console.log("full-logo.png  960x200");
